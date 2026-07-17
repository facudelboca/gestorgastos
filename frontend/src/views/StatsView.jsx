import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function StatsView() {
  const [trendData, setTrendData] = useState([]);
  const [currency, setCurrency] = useState('ARS'); // Default to ARS (pesos)
  const [period, setPeriod] = useState('6_MONTHS'); // 1_WEEK, 1_MONTH, 3_MONTHS, 6_MONTHS, 1_YEAR, CUSTOM
  
  // Custom date states
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Chart view states
  const [chartType, setChartType] = useState('LINE'); // BAR or LINE
  const [lineVisibility, setLineVisibility] = useState('BOTH'); // BOTH, INCOME, EXPENSE
  const [hovered, setHovered] = useState(null); // { month, type, value }

  const fetchStats = async () => {
    try {
      // Validate custom dates if custom period is selected
      if (period === 'CUSTOM' && (!customStart || !customEnd)) {
        return; 
      }
      const res = await api.reports.getTrendReport(currency, period, customStart || null, customEnd || null);
      setTrendData(res || []);
    } catch (err) {
      console.error('Error al obtener datos históricos', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [currency, period, customStart, customEnd]);

  // Summarized metrics
  const totalIncome = trendData.reduce((sum, d) => sum + d.income, 0);
  const totalExpense = trendData.reduce((sum, d) => sum + d.expense, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  const avgIncome = trendData.length > 0 ? totalIncome / trendData.length : 0;
  const avgExpense = trendData.length > 0 ? totalExpense / trendData.length : 0;

  const maxVal = Math.max(...trendData.map(d => Math.max(d.income, d.expense)), 100);

  // Line chart configurations
  const showIncome = lineVisibility === 'BOTH' || lineVisibility === 'INCOME';
  const showExpense = lineVisibility === 'BOTH' || lineVisibility === 'EXPENSE';
  const N = trendData.length;
  const paddingX = 40;
  const chartWidth = 500 - paddingX * 2;
  const chartHeight = 150;
  
  const getX = (index) => paddingX + (index / Math.max(N - 1, 1)) * chartWidth;
  const getY = (val) => 170 - (val / maxVal) * chartHeight;

  const incomePoints = trendData.map((d, i) => `${getX(i)},${getY(d.income)}`).join(' ');
  const expensePoints = trendData.map((d, i) => `${getX(i)},${getY(d.expense)}`).join(' ');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Cabecera y Filtros */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>📈 Análisis Estadístico & Histórico</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Evolución comparativa de tus finanzas</p>
        </div>
        
        {/* Controles de Consulta */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Periodo</label>
            <select className="glass-input" style={{ width: '130px', padding: '6px 12px' }} value={period} onChange={e => setPeriod(e.target.value)}>
              <option value="1_WEEK">1 Semana</option>
              <option value="1_MONTH">1 Mes</option>
              <option value="3_MONTHS">3 Meses</option>
              <option value="6_MONTHS">6 Meses</option>
              <option value="1_YEAR">1 Año</option>
              <option value="CUSTOM">Personalizado</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Divisa</label>
            <select className="glass-input" style={{ width: '90px', padding: '6px 12px' }} value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="ARS">Pesos (ARS)</option>
              <option value="USD">Dólares (USD)</option>
              <option value="EUR">Euros (EUR)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rango de Fechas Customizado (se muestra si period === 'CUSTOM') */}
      {period === 'CUSTOM' && (
        <div className="glass-card animate-fade-in" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '12px 18px', marginTop: '-12px' }}>
          <div style={{ flex: '1', minWidth: '150px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Fecha Inicio</label>
            <input type="date" className="glass-input" style={{ padding: '6px 12px' }} value={customStart} onChange={e => setCustomStart(e.target.value)} />
          </div>
          <div style={{ flex: '1', minWidth: '150px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Fecha Fin</label>
            <input type="date" className="glass-input" style={{ padding: '6px 12px' }} value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
          </div>
        </div>
      )}

      {/* Tarjetas de Métricas Acumuladas */}
      <div className="grid-cols-3">
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ingresos Acumulados</span>
          <strong style={{ fontSize: '1.5rem', color: 'var(--success)' }}>
            {totalIncome.toLocaleString('es-AR', { style: 'currency', currency })}
          </strong>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Promedio por periodo: {avgIncome.toLocaleString('es-AR', { style: 'currency', currency })}
          </span>
        </div>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Egresos Acumulados</span>
          <strong style={{ fontSize: '1.5rem', color: 'var(--danger)' }}>
            {totalExpense.toLocaleString('es-AR', { style: 'currency', currency })}
          </strong>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Promedio por periodo: {avgExpense.toLocaleString('es-AR', { style: 'currency', currency })}
          </span>
        </div>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ahorro Neto & Tasa</span>
          <strong style={{ fontSize: '1.5rem', color: 'var(--accent-cyan)' }}>
            {netSavings.toLocaleString('es-AR', { style: 'currency', currency })}
          </strong>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Tasa de ahorro: <strong>{savingsRate.toFixed(1)}%</strong>
          </span>
        </div>
      </div>

      {/* Gráfico Interactiva */}
      <div className="glass-card">
        
        {/* Cabecera del Gráfico con Controles Visuales */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            📊 Gráfico de Tendencias
          </h3>
          
          {/* Controles de estilo de gráfico */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div>
              <select className="glass-input" style={{ width: '110px', padding: '4px 8px', fontSize: '0.8rem' }} value={chartType} onChange={e => setChartType(e.target.value)}>
                <option value="LINE">Líneas</option>
                <option value="BAR">Barras</option>
              </select>
            </div>
            
            {chartType === 'LINE' && (
              <div>
                <select className="glass-input" style={{ width: '130px', padding: '4px 8px', fontSize: '0.8rem' }} value={lineVisibility} onChange={e => setLineVisibility(e.target.value)}>
                  <option value="BOTH">Ambos Flujos</option>
                  <option value="INCOME">Solo Ingresos</option>
                  <option value="EXPENSE">Solo Egresos</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {trendData.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>No hay suficientes datos para graficar en este periodo.</p>
        ) : (
          <div style={{ padding: '0 10px' }}>
            
            {/* MODO GRÁFICO DE BARRAS */}
            {chartType === 'BAR' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '240px', paddingBottom: '16px', borderBottom: '2px solid var(--border-color)' }}>
                  {trendData.map((d, idx) => {
                    const incHeight = (d.income / maxVal) * 200;
                    const expHeight = (d.expense / maxVal) * 200;
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px', marginBottom: '12px' }}>
                          <div 
                            onMouseEnter={() => setHovered({ month: d.label, type: 'Ingreso', value: d.income })}
                            onMouseLeave={() => setHovered(null)}
                            style={{ 
                              width: '20px', 
                              height: `${incHeight}px`, 
                              background: 'var(--success)', 
                              borderRadius: '4px 4px 0 0',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              opacity: hovered && hovered.month === d.label && hovered.type === 'Ingreso' ? 0.85 : 1,
                              transform: hovered && hovered.month === d.label && hovered.type === 'Ingreso' ? 'scaleX(1.1)' : 'scaleX(1)'
                            }}
                            title={`Ingresos: $${d.income}`}
                          />
                          <div 
                            onMouseEnter={() => setHovered({ month: d.label, type: 'Egreso', value: d.expense })}
                            onMouseLeave={() => setHovered(null)}
                            style={{ 
                              width: '20px', 
                              height: `${expHeight}px`, 
                              background: 'var(--danger)', 
                              borderRadius: '4px 4px 0 0',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              opacity: hovered && hovered.month === d.label && hovered.type === 'Egreso' ? 0.85 : 1,
                              transform: hovered && hovered.month === d.label && hovered.type === 'Egreso' ? 'scaleX(1.1)' : 'scaleX(1)'
                            }}
                            title={`Egresos: $${d.expense}`}
                          />
                        </div>
                        <strong style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{d.label}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MODO GRÁFICO DE LÍNEAS (SVG) */}
            {chartType === 'LINE' && (
              <div style={{ position: 'relative', width: '100%', height: '240px', paddingBottom: '16px', borderBottom: '2px solid var(--border-color)' }}>
                <svg viewBox="0 0 500 200" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  
                  {/* Líneas horizontales de fondo */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="var(--border-color)" strokeDasharray="3 3" />
                  <line x1="0" y1="70" x2="500" y2="70" stroke="var(--border-color)" strokeDasharray="3 3" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="var(--border-color)" strokeDasharray="3 3" />
                  <line x1="0" y1="170" x2="500" y2="170" stroke="var(--border-color)" strokeDasharray="3 3" />

                  {/* Polyline de Ingresos */}
                  {showIncome && (
                    <polyline 
                      points={incomePoints} 
                      fill="none" 
                      stroke="var(--success)" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  )}

                  {/* Polyline de Egresos */}
                  {showExpense && (
                    <polyline 
                      points={expensePoints} 
                      fill="none" 
                      stroke="var(--danger)" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  )}

                  {/* Círculos interactivos en los nodos */}
                  {trendData.map((d, i) => {
                    const cx = getX(i);
                    const cyInc = getY(d.income);
                    const cyExp = getY(d.expense);
                    return (
                      <g key={i}>
                        {showIncome && (
                          <circle 
                            cx={cx} 
                            cy={cyInc} 
                            r={hovered && hovered.month === d.label && hovered.type === 'Ingreso' ? "7" : "5"} 
                            fill="var(--success)" 
                            stroke="var(--bg-card)" 
                            strokeWidth="2" 
                            cursor="pointer"
                            onMouseEnter={() => setHovered({ month: d.label, type: 'Ingreso', value: d.income })}
                            onMouseLeave={() => setHovered(null)}
                          />
                        )}
                        {showExpense && (
                          <circle 
                            cx={cx} 
                            cy={cyExp} 
                            r={hovered && hovered.month === d.label && hovered.type === 'Egreso' ? "7" : "5"} 
                            fill="var(--danger)" 
                            stroke="var(--bg-card)" 
                            strokeWidth="2" 
                            cursor="pointer"
                            onMouseEnter={() => setHovered({ month: d.label, type: 'Egreso', value: d.expense })}
                            onMouseLeave={() => setHovered(null)}
                          />
                        )}
                        {/* Eje X Etiquetas de Texto */}
                        <text 
                          x={cx} 
                          y="196" 
                          fill="var(--text-secondary)" 
                          fontSize="9" 
                          textAnchor="middle" 
                          fontWeight="bold"
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          {d.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}

            {/* Panel de Hover Detallado */}
            <div style={{ height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '16px' }}>
              {hovered ? (
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem' }}>
                  <strong>{hovered.month}</strong> | {hovered.type}: <strong style={{ color: hovered.type === 'Ingreso' ? 'var(--success)' : 'var(--danger)' }}>{hovered.value.toLocaleString('es-AR', { style: 'currency', currency })}</strong>
                </div>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pasa el cursor sobre las columnas o nodos para ver los montos exactos</span>
              )}
            </div>

            {/* Leyenda */}
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', fontSize: '0.8rem', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', background: 'var(--success)', borderRadius: '3px' }}></div>
                <span style={{ color: 'var(--text-secondary)' }}>Ingresos ({currency})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', background: 'var(--danger)', borderRadius: '3px' }}></div>
                <span style={{ color: 'var(--text-secondary)' }}>Egresos ({currency})</span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Variación Mes a Mes (MoM Analysis) */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          📉 Variación Comparativa entre Períodos (MoM)
        </h3>
        
        {trendData.length < 2 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Faltan períodos anteriores para realizar la comparativa intermensual.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {trendData.map((d, index) => {
              if (index === 0) return null; 
              const prev = trendData[index - 1];

              const incDiff = prev.income > 0 ? ((d.income - prev.income) / prev.income) * 100 : 0;
              const expDiff = prev.expense > 0 ? ((d.expense - prev.expense) / prev.expense) * 100 : 0;

              return (
                <div key={index} className="list-item" style={{ margin: '0', display: 'flex', justifyContent: 'space-between', padding: '12px 18px' }}>
                  <strong style={{ fontSize: '0.85rem' }}>{d.label} vs {prev.label}</strong>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem' }}>
                    <span>
                      Ingresos:{' '}
                      <strong style={{ color: incDiff >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {incDiff >= 0 ? '▲ +' : '▼ '}{incDiff.toFixed(1)}%
                      </strong>
                    </span>
                    <span>
                      Egresos:{' '}
                      <strong style={{ color: expDiff <= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {expDiff >= 0 ? '▲ +' : '▼ '}{expDiff.toFixed(1)}%
                      </strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
