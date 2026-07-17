import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function OperationsView() {
  const [accounts, setAccounts] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);

  // Transfer Form State
  const [newTransferSource, setNewTransferSource] = useState('');
  const [newTransferDest, setNewTransferDest] = useState('');
  const [newTransferAmount, setNewTransferAmount] = useState('');
  const [newTransferDesc, setNewTransferDesc] = useState('');
  const [transferSuccess, setTransferSuccess] = useState(null);

  // Allocate Form State
  const [allocateGoalId, setAllocateGoalId] = useState('');
  const [allocateAccountId, setAllocateAccountId] = useState('');
  const [allocateAmount, setAllocateAmount] = useState('');
  const [goalAllocSuccess, setGoalAllocSuccess] = useState(null);

  const fetchOperationsData = async () => {
    try {
      const accData = await api.accounts.getAccounts();
      setAccounts(accData);
      if (accData.length > 0) {
        if (!newTransferSource) setNewTransferSource(accData[0].id);
        if (!newTransferDest) setNewTransferDest(accData[0].id);
        if (!allocateAccountId) setAllocateAccountId(accData[0].id);
      }

      const goalsData = await api.savings.getSavingsGoals();
      setSavingsGoals(goalsData);
      if (goalsData.length > 0 && !allocateGoalId) {
        setAllocateGoalId(goalsData[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOperationsData();
  }, []);

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    setTransferSuccess(null);
    try {
      if (newTransferSource === newTransferDest) {
        throw new Error('Las cuentas origen y destino deben ser distintas.');
      }
      await api.transfers.createTransfer({
        sourceAccountId: parseInt(newTransferSource),
        destinationAccountId: parseInt(newTransferDest),
        amount: parseFloat(newTransferAmount),
        description: newTransferDesc
      });
      setNewTransferAmount('');
      setNewTransferDesc('');
      setTransferSuccess('Transferencia realizada con éxito.');
      fetchOperationsData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAllocateSavings = async (e) => {
    e.preventDefault();
    setGoalAllocSuccess(null);
    try {
      const res = await api.savings.allocateSavings(allocateGoalId, {
        accountId: parseInt(allocateAccountId),
        amount: parseFloat(allocateAmount)
      });
      setAllocateAmount('');
      setGoalAllocSuccess(`Fondos asignados con éxito. Estado: ${res.status}`);
      fetchOperationsData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="grid-cols-2 animate-fade-in">
      
      {/* TRANSFERENCIAS */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          🔄 Transferencia Interna (Aplica Tipo de Cambio)
        </h3>
        {transferSuccess && (
          <div style={{ padding: '10px 14px', borderRadius: '6px', marginBottom: '14px', fontSize: '0.8rem', background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            {transferSuccess}
          </div>
        )}
        {accounts.length < 2 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Debes poseer al menos 2 cuentas para realizar transferencias.</p>
        ) : (
          <form onSubmit={handleCreateTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="grid-cols-2" style={{ gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Cuenta Origen</label>
                <select className="glass-input" value={newTransferSource} onChange={e => setNewTransferSource(e.target.value)}>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Cuenta Destino</label>
                <select className="glass-input" value={newTransferDest} onChange={e => setNewTransferDest(e.target.value)}>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Monto</label>
              <input type="number" step="0.01" required className="glass-input" placeholder="Monto a debitar" value={newTransferAmount} onChange={e => setNewTransferAmount(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Descripción</label>
              <input type="text" className="glass-input" placeholder="Concepto (ej: Traspaso a cuenta USD)" value={newTransferDesc} onChange={e => setNewTransferDesc(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '4px' }}>Transferir Fondos</button>
          </form>
        )}
      </div>

      {/* METAS DE AHORRO */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          🎯 Aportar a Metas de Ahorro
        </h3>
        
        {savingsGoals.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No posees metas de ahorro activas. Puedes configurarlas en **Ajustes**.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
            {savingsGoals.map(goal => {
              const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              return (
                <div key={goal.id} style={{ background: 'var(--bg-primary)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                    <strong>{goal.title}</strong>
                    <span className={`badge ${goal.status === 'COMPLETED' ? 'badge-income' : 'badge-expense'}`}>{goal.status}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-indigo), var(--accent-cyan))', borderRadius: '3px' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>Ahorrado: ${goal.currentAmount}</span>
                    <span>Objetivo: ${goal.targetAmount} ({percent}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {savingsGoals.length > 0 && accounts.length > 0 && (
          <form onSubmit={handleAllocateSavings} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Abonar Fondos desde Cuenta Real (Debita Balance)</strong>
            {goalAllocSuccess && (
              <div style={{ padding: '8px 12px', borderRadius: '4px', fontSize: '0.75rem', background: 'var(--success-bg)', color: 'var(--success)', marginBottom: '8px' }}>
                {goalAllocSuccess}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <select className="glass-input" style={{ flex: '1.2' }} value={allocateGoalId} onChange={e => setAllocateGoalId(e.target.value)}>
                {savingsGoals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
              <select className="glass-input" style={{ flex: '1.2' }} value={allocateAccountId} onChange={e => setAllocateAccountId(e.target.value)}>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>
              <input type="number" step="0.01" required className="glass-input" style={{ flex: '0.8' }} placeholder="Monto" value={allocateAmount} onChange={e => setAllocateAmount(e.target.value)} />
              <button type="submit" className="btn-primary" style={{ padding: '6px 12px' }}>Abonar</button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
