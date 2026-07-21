import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export default function DashboardView() {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [report, setReport] = useState([]);
  const [reportCurrency, setReportCurrency] = useState('ARS');

  // Report filter states (US 10)
  const [reportType, setReportType] = useState('EXPENSE');
  const [reportStart, setReportStart] = useState('');
  const [reportEnd, setReportEnd] = useState('');

  // Form states
  const [txAccount, setTxAccount] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('EXPENSE');
  const [txDesc, setTxDesc] = useState('');
  const [txAlert, setTxAlert] = useState(null);
  const [suggestedLabel, setSuggestedLabel] = useState('');

  const handleSuggestCategory = async () => {
    if (!txDesc || txDesc.trim().length < 3) return;
    try {
      const suggested = await api.categories.suggestCategory(txDesc.trim());
      if (suggested && suggested.id) {
        setTxCategory(suggested.id);
        setSuggestedLabel(suggested.name);
      }
    } catch (err) {
      console.warn('No se pudo sugerir categoría', err);
    }
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      const accData = await api.accounts.getAccounts();
      setAccounts(accData);
      if (accData.length > 0) {
        setTxAccount(prev => prev || accData[0].id);
      }

      const catData = await api.categories.getCategories();
      setCategories(catData);
      if (catData.length > 0) {
        setTxCategory(prev => prev || catData[0].id);
      }

      const recentData = await api.transactions.getTransactions({ page: 0, size: 5 });
      setRecentTransactions(recentData.content || []);

      const repData = await api.reports.getMonthlyReport(
        reportCurrency, 
        reportStart || null, 
        reportEnd || null, 
        reportType
      );
      setReport(repData);
    } catch (err) {
      console.error('Error al cargar datos del dashboard', err);
    }
  }, [reportCurrency, reportStart, reportEnd, reportType]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    setTxAlert(null);
    try {
      if (!txCategory) {
        throw new Error('Selecciona una categoría. Si no tienes categorías, créalas en Ajustes.');
      }
      const res = await api.transactions.createTransaction({
        accountId: parseInt(txAccount),
        categoryId: parseInt(txCategory),
        amount: parseFloat(txAmount),
        type: txType,
        description: txDesc
      });

      setTxAmount('');
      setTxDesc('');
      setSuggestedLabel('');

      if (res.budgetExceeded) {
        setTxAlert({ type: 'warning', message: '¡Alerta de Presupuesto! Has superado el límite mensual para esta categoría.' });
      } else {
        setTxAlert({ type: 'success', message: 'Transacción cargada con éxito.' });
      }
      fetchDashboardData();
    } catch (err) {
      setTxAlert({ type: 'danger', message: err.message });
    }
  };

  return (
    <div className="grid-cols-2 animate-fade-in">
      
      {/* COLUMNA IZQUIERDA: SALDOS Y REPORTES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Mis Cuentas */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            💰 Cuentas y Balances
          </h3>
          {accounts.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No tienes cuentas configuradas. Configura una nueva en la pestaña **Ajustes**.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {accounts.map(acc => (
                <div key={acc.id} className="list-item" style={{ margin: '0' }}>
                  <div>
                    <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{acc.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>({acc.currency})</span>
                  </div>
                  <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    {acc.balance.toLocaleString('es-AR', { style: 'currency', currency: acc.currency })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Distribución por Categoría con Filtros */}
        <div className="glass-card">
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>📊 Consumo por Categoría</h3>
              <select 
                className="glass-input" 
                style={{ width: '90px', padding: '4px 8px', fontSize: '0.8rem' }} 
                value={reportCurrency} 
                onChange={e => setReportCurrency(e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            
            {/* Filtros avanzados de Reporte (US 10) */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '100px' }}>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Tipo</label>
                <select className="glass-input" style={{ padding: '4px 8px', fontSize: '0.75rem' }} value={reportType} onChange={e => setReportType(e.target.value)}>
                  <option value="EXPENSE">Egresos</option>
                  <option value="INCOME">Ingresos</option>
                </select>
              </div>
              <div style={{ flex: '1.2', minWidth: '110px' }}>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Inicio</label>
                <input type="date" className="glass-input" style={{ padding: '2px 6px', fontSize: '0.75rem' }} value={reportStart} onChange={e => setReportStart(e.target.value)} />
              </div>
              <div style={{ flex: '1.2', minWidth: '110px' }}>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Fin</label>
                <input type="date" className="glass-input" style={{ padding: '2px 6px', fontSize: '0.75rem' }} value={reportEnd} onChange={e => setReportEnd(e.target.value)} />
              </div>
            </div>
          </div>

          {report.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No se registran movimientos para los filtros seleccionados.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {report.map(rep => (
                <div key={rep.categoryId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span>{rep.categoryName}</span>
                    <span style={{ fontWeight: '600' }}>
                      {rep.totalSpent.toLocaleString('es-AR')} {reportCurrency} ({rep.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${rep.percentage}%`, height: '100%', background: reportType === 'INCOME' ? 'var(--success)' : 'var(--accent-cyan)', borderRadius: '4px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* COLUMNA DERECHA: REGISTRO Y ÚLTIMOS MOVIMIENTOS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Registrar transacción rápida */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            ✍️ Cargar Movimiento Rápido
          </h3>
          
          {txAlert && (
            <div style={{ 
              padding: '10px 14px', 
              borderRadius: '6px', 
              marginBottom: '14px', 
              fontSize: '0.8rem',
              background: txAlert.type === 'warning' ? 'var(--warning-bg)' : txAlert.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
              color: txAlert.type === 'warning' ? 'var(--warning)' : txAlert.type === 'success' ? 'var(--success)' : 'var(--danger)',
              border: `1px solid ${txAlert.type === 'warning' ? 'rgba(245, 158, 11, 0.2)' : txAlert.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
            }}>
              {txAlert.message}
            </div>
          )}

          {accounts.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Debes crear una cuenta en Ajustes antes de registrar movimientos.</p>
          ) : categories.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Debes crear al menos una categoría en Ajustes antes de registrar movimientos.</p>
          ) : (
            <form onSubmit={handleCreateTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: '1' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Cuenta</label>
                  <select className="glass-input" value={txAccount} onChange={e => setTxAccount(e.target.value)}>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
                  </select>
                </div>
                <div style={{ flex: '1' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Categoría {suggestedLabel && <span style={{ color: 'var(--success)', fontWeight: 'bold' }}> (Sugerida: {suggestedLabel})</span>}
                  </label>
                  <select className="glass-input" value={txCategory} onChange={e => setTxCategory(e.target.value)}>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: '1' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Monto</label>
                  <input type="number" step="0.01" required className="glass-input" placeholder="0.00" value={txAmount} onChange={e => setTxAmount(e.target.value)} />
                </div>
                <div style={{ flex: '1' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Tipo</label>
                  <select className="glass-input" value={txType} onChange={e => setTxType(e.target.value)}>
                    <option value="EXPENSE">Egreso</option>
                    <option value="INCOME">Ingreso</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Concepto</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="Detalle (ej: Almuerzo)" 
                  value={txDesc} 
                  onChange={e => setTxDesc(e.target.value)} 
                  onBlur={handleSuggestCategory}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '4px' }}>Cargar Movimiento</button>
            </form>
          )}
        </div>

        {/* Últimos 5 Movimientos */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            📜 Últimos 5 Movimientos
          </h3>
          {recentTransactions.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No se registran movimientos aún.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentTransactions.map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px 14px', borderRadius: '6px' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem', display: 'block' }}>{tx.description || 'Movimiento'}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {tx.accountName} | {tx.categoryName} | {new Date(tx.transactionDate).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`badge ${tx.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
