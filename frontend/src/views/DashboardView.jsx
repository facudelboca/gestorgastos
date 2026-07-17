import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function DashboardView() {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [report, setReport] = useState([]);
  const [reportCurrency, setReportCurrency] = useState('USD');

  // Form states
  const [txAccount, setTxAccount] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('EXPENSE');
  const [txDesc, setTxDesc] = useState('');
  const [txAlert, setTxAlert] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const accData = await api.accounts.getAccounts();
      setAccounts(accData);
      if (accData.length > 0 && !txAccount) {
        setTxAccount(accData[0].id);
      }

      const catData = await api.categories.getCategories();
      setCategories(catData);
      if (catData.length > 0 && !txCategory) {
        setTxCategory(catData[0].id);
      }

      const recentData = await api.transactions.getTransactions({ page: 0, size: 5 });
      setRecentTransactions(recentData.content || []);

      const repData = await api.reports.getMonthlyReport(reportCurrency);
      setReport(repData);
    } catch (err) {
      console.error('Error al cargar datos del dashboard', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [reportCurrency]);

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
      
      {/* COLUMNA IZQUIERDA: SALDOS Y GRÁFICO */}
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

        {/* Distribución de Egresos */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>📊 Consumo Mensual por Categoría</h3>
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
          {report.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No se registran gastos para este mes.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {report.map(rep => (
                <div key={rep.categoryId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span>{rep.categoryName}</span>
                    <span style={{ fontWeight: '600' }}>
                      {rep.totalSpent.toLocaleString('en-US')} {reportCurrency} ({rep.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${rep.percentage}%`, height: '100%', background: 'var(--accent-cyan)', borderRadius: '4px' }}></div>
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
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Categoría</label>
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
                <input type="text" className="glass-input" placeholder="Detalle (ej: Almuerzo)" value={txDesc} onChange={e => setTxDesc(e.target.value)} />
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
