import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function ConfigView() {
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);

  // Form states: Accounts
  const [newAccName, setNewAccName] = useState('');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newAccCurrency, setNewAccCurrency] = useState('USD');

  // Form states: Budgets
  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [newBudgetPeriod, setNewBudgetPeriod] = useState(
    new Date().getFullYear() * 100 + (new Date().getMonth() + 1)
  );

  // Form states: Savings Goals
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');

  // Form states: Subscriptions
  const [newRecAcc, setNewRecAcc] = useState('');
  const [newRecCat, setNewRecCat] = useState('');
  const [newRecAmount, setNewRecAmount] = useState('');
  const [newRecDesc, setNewRecDesc] = useState('');
  const [newRecDate, setNewRecDate] = useState('');

  // Form states: Categories
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');

  const fetchConfigData = async () => {
    try {
      const catData = await api.categories.getCategories();
      setCategories(catData);
      if (catData.length > 0) {
        if (!newBudgetCategory) setNewBudgetCategory(catData[0].id);
        if (!newRecCat) setNewRecCat(catData[0].id);
      }

      const accData = await api.accounts.getAccounts();
      setAccounts(accData);
      if (accData.length > 0) {
        if (!newRecAcc) setNewRecAcc(accData[0].id);
      }

      const budData = await api.budgets.getBudgets();
      setBudgets(budData);

      const recData = await api.recurring.getRecurringExpenses();
      setRecurringExpenses(recData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConfigData();
  }, []);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      await api.accounts.createAccount({
        name: newAccName,
        balance: parseFloat(newAccBalance),
        currency: newAccCurrency
      });
      setNewAccName('');
      setNewAccBalance('');
      fetchConfigData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    try {
      if (!newBudgetCategory) {
        throw new Error('Selecciona una categoría válida.');
      }
      await api.budgets.createBudget({
        categoryId: parseInt(newBudgetCategory),
        limitAmount: parseFloat(newBudgetAmount),
        monthPeriod: parseInt(newBudgetPeriod)
      });
      setNewBudgetAmount('');
      fetchConfigData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await api.savings.createSavingsGoal({
        title: newGoalTitle,
        targetAmount: parseFloat(newGoalTarget),
        targetDate: newGoalDate
      });
      setNewGoalTitle('');
      setNewGoalTarget('');
      setNewGoalDate('');
      fetchConfigData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateRecurring = async (e) => {
    e.preventDefault();
    try {
      if (!newRecCat) {
        throw new Error('Selecciona una categoría válida.');
      }
      await api.recurring.createRecurringExpense({
        accountId: parseInt(newRecAcc),
        categoryId: parseInt(newRecCat),
        amount: parseFloat(newRecAmount),
        description: newRecDesc,
        nextExecutionDate: newRecDate
      });
      setNewRecAmount('');
      setNewRecDesc('');
      setNewRecDate('');
      fetchConfigData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await api.categories.createCategory({
        name: newCatName,
        icon: newCatIcon
      });
      setNewCatName('');
      setNewCatIcon('');
      fetchConfigData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* CUENTAS Y PRESUPUESTOS */}
      <div className="grid-cols-2">
        
        {/* Registrar Cuenta */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            ➕ Registrar Nueva Cuenta
          </h3>
          <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Nombre</label>
              <input type="text" required className="glass-input" placeholder="ej: Santander Río, Efectivo" value={newAccName} onChange={e => setNewAccName(e.target.value)} />
            </div>
            <div className="grid-cols-2" style={{ gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Saldo Inicial</label>
                <input type="number" step="0.01" required className="glass-input" placeholder="0.00" value={newAccBalance} onChange={e => setNewAccBalance(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Moneda</label>
                <select className="glass-input" value={newAccCurrency} onChange={e => setNewAccCurrency(e.target.value)}>
                  <option value="USD">Dólar (USD)</option>
                  <option value="ARS">Pesos Argentinos (ARS)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '4px' }}>Crear Cuenta</button>
          </form>
        </div>

        {/* Límites Presupuestarios */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            🛡️ Configurar Presupuesto Mensual
          </h3>
          
          {budgets.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {budgets.map(b => (
                <div key={b.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem' }}>
                  <strong>{b.categoryName}:</strong> ${b.limitAmount} <span style={{ color: 'var(--text-muted)' }}>({b.monthPeriod})</span>
                </div>
              ))}
            </div>
          )}

          {categories.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Debes crear al menos una categoría para configurar presupuestos.</p>
          ) : (
            <form onSubmit={handleCreateBudget} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: '1.2' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Categoría</label>
                  <select className="glass-input" value={newBudgetCategory} onChange={e => setNewBudgetCategory(e.target.value)}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ flex: '0.8' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Período (YYYYMM)</label>
                  <input type="number" required className="glass-input" value={newBudgetPeriod} onChange={e => setNewBudgetPeriod(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Límite ($)</label>
                <input type="number" step="0.01" required className="glass-input" placeholder="Límite máximo" value={newBudgetAmount} onChange={e => setNewBudgetAmount(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '4px' }}>Configurar Límite</button>
            </form>
          )}
        </div>

      </div>

      {/* METAS Y SUSCRIPCIONES */}
      <div className="grid-cols-2">
        
        {/* Metas de Ahorro */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            🎯 Nueva Meta de Ahorro
          </h3>
          <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Nombre</label>
              <input type="text" required className="glass-input" placeholder="Auto, Notebook, Viaje" value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} />
            </div>
            <div className="grid-cols-2" style={{ gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Monto Objetivo</label>
                <input type="number" step="0.01" required className="glass-input" placeholder="0.00" value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Fecha Objetivo</label>
                <input type="date" required className="glass-input" value={newGoalDate} onChange={e => setNewGoalDate(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '4px' }}>Crear Meta</button>
          </form>
        </div>

        {/* Suscripciones */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            📅 Suscripciones / Gastos Recurrentes
          </h3>
          
          {recurringExpenses.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              {recurringExpenses.map(re => (
                <div key={re.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{re.description} (${re.amount})</span>
                  <span style={{ color: 'var(--text-muted)' }}>Próx: {re.nextExecutionDate}</span>
                </div>
              ))}
            </div>
          )}

          {accounts.length === 0 || categories.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Configura cuentas y categorías para programar suscripciones.</p>
          ) : (
            <form onSubmit={handleCreateRecurring} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: '1' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Cuenta</label>
                  <select className="glass-input" value={newRecAcc} onChange={e => setNewRecAcc(e.target.value)}>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
                </div>
                <div style={{ flex: '1' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Categoría</label>
                  <select className="glass-input" value={newRecCat} onChange={e => setNewRecCat(e.target.value)}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: '1.2' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Débito Mensual</label>
                  <input type="number" step="0.01" required className="glass-input" placeholder="0.00" value={newRecAmount} onChange={e => setNewRecAmount(e.target.value)} />
                </div>
                <div style={{ flex: '0.8' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Primer Vencimiento</label>
                  <input type="date" required className="glass-input" value={newRecDate} onChange={e => setNewRecDate(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Concepto</label>
                <input type="text" required className="glass-input" placeholder="ej: Alquiler, Netflix" value={newRecDesc} onChange={e => setNewRecDesc(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '4px' }}>Programar Débito</button>
            </form>
          )}
        </div>

      </div>

      {/* CATEGORÍAS PERSONALIZADAS */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          🏷️ Categorías Personalizadas
        </h3>
        <div className="grid-cols-2" style={{ gap: '30px' }}>
          
          {/* Listado */}
          <div>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>Categorías del Usuario</strong>
            {categories.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>No tienes categorías creadas aún.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {categories.map(cat => (
                  <div key={cat.id} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{cat.icon}</span>
                    <strong>{cat.name}</strong>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>ID: {cat.id}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulario */}
          <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Añadir Categoría Personalizada</strong>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: '1.5' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Nombre</label>
                <input type="text" required className="glass-input" placeholder="Ej: Regalos, Mascotas" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
              </div>
              <div style={{ flex: '0.5' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Emoji</label>
                <input type="text" required className="glass-input" placeholder="🐶" value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn-secondary" style={{ padding: '8px 16px', marginTop: '4px' }}>Crear Categoría</button>
          </form>

        </div>
      </div>

    </div>
  );
}
