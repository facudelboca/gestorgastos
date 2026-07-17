import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8080/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [view, setView] = useState(token ? 'DASHBOARD' : 'LOGIN');
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Data States
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [report, setReport] = useState([]);
  const [reportCurrency, setReportCurrency] = useState('USD');

  // Form Creation States
  const [newAccName, setNewAccName] = useState('');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newAccCurrency, setNewAccCurrency] = useState('USD');

  const [newTxAccount, setNewTxAccount] = useState('');
  const [newTxCategory, setNewTxCategory] = useState('');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxType, setNewTxType] = useState('EXPENSE');
  const [newTxDesc, setNewTxDesc] = useState('');
  const [txAlert, setTxAlert] = useState(null);

  const [newTransferSource, setNewTransferSource] = useState('');
  const [newTransferDest, setNewTransferDest] = useState('');
  const [newTransferAmount, setNewTransferAmount] = useState('');
  const [newTransferDesc, setNewTransferDesc] = useState('');
  const [transferSuccess, setTransferSuccess] = useState(null);

  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [newBudgetPeriod, setNewBudgetPeriod] = useState(new Date().getFullYear() * 100 + (new Date().getMonth() + 1));

  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');

  const [allocateGoalId, setAllocateGoalId] = useState('');
  const [allocateAccountId, setAllocateAccountId] = useState('');
  const [allocateAmount, setAllocateAmount] = useState('');
  const [goalAllocSuccess, setGoalAllocSuccess] = useState(null);

  const [newRecAcc, setNewRecAcc] = useState('');
  const [newRecCat, setNewRecCat] = useState('');
  const [newRecAmount, setNewRecAmount] = useState('');
  const [newRecDesc, setNewRecDesc] = useState('');
  const [newRecDate, setNewRecDate] = useState('');

  // Transaction Search Filters
  const [filterAcc, setFilterAcc] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [txPage, setTxPage] = useState(0);
  const [txTotalPages, setTxTotalPages] = useState(1);

  // General Notification Error
  const [generalError, setGeneralError] = useState('');

  // Helper fetch header builder
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  // Actions
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setView('LOGIN');
    clearStates();
  };

  const clearStates = () => {
    setAccounts([]);
    setCategories([]);
    setTransactions([]);
    setBudgets([]);
    setSavingsGoals([]);
    setRecurringExpenses([]);
    setReport([]);
    setAuthError('');
    setAuthSuccess('');
    setGeneralError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setToken(data.token);
      setUser(data);
      setView('DASHBOARD');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al registrarse');
      
      setAuthSuccess('Registro exitoso. Inicia sesión con tus credenciales.');
      setView('LOGIN');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  // Fetch Dashboard Data
  const fetchData = async () => {
    if (!token) return;
    setGeneralError('');
    try {
      // 1. Fetch Accounts
      const accRes = await fetch(`${API_BASE}/accounts`, { headers: getHeaders() });
      if (accRes.status === 401) { handleLogout(); return; }
      const accData = await accRes.json();
      setAccounts(accData);

      // We populate selectors with first account
      if (accData.length > 0) {
        if (!newTxAccount) setNewTxAccount(accData[0].id);
        if (!newTransferSource) setNewTransferSource(accData[0].id);
        if (!newTransferDest) setNewTransferDest(accData[0].id);
        if (!allocateAccountId) setAllocateAccountId(accData[0].id);
        if (!newRecAcc) setNewRecAcc(accData[0].id);
      }

      // 2. Fetch categories (mock default categories in database if empty)
      // Since category creation endpoint wasn't requested explicitly but we have entities,
      // we'll have a default setup:
      const catRes = await fetch(`${API_BASE}/reports/monthly`, { headers: getHeaders() }); // just testing endpoints
      
      // Let's create default categories locally for database using H2/PostgreSQL
      // We can also retrieve standard mock categories:
      // Note: for this demo we'll assume category records are populated.
      // Let's mock fetching categories:
      // If we don't have categories, let's allow users to select from 4 standard ID categories
      // We set them in state:
      const defaultCats = [
        { id: 1, name: 'Comida', icon: '🍔' },
        { id: 2, name: 'Transporte', icon: '🚗' },
        { id: 3, name: 'Servicios', icon: '⚡' },
        { id: 4, name: 'Trabajo', icon: '💼' }
      ];
      setCategories(defaultCats);
      if (!newTxCategory) setNewTxCategory(defaultCats[0].id);
      if (!newBudgetCategory) setNewBudgetCategory(defaultCats[0].id);
      if (!newRecCat) setNewRecCat(defaultCats[0].id);

      // 3. Fetch Savings Goals
      const goalsRes = await fetch(`${API_BASE}/savings-goals`, { headers: getHeaders() });
      const goalsData = await goalsRes.json();
      setSavingsGoals(goalsData);
      if (goalsData.length > 0 && !allocateGoalId) setAllocateGoalId(goalsData[0].id);

      // 4. Fetch Budgets
      const budgetRes = await fetch(`${API_BASE}/budgets`, { headers: getHeaders() });
      const budgetData = await budgetRes.json();
      setBudgets(budgetData);

      // 5. Fetch Recurring Expenses
      const recRes = await fetch(`${API_BASE}/recurring-expenses`, { headers: getHeaders() });
      const recData = await recRes.json();
      setRecurringExpenses(recData);

      // 6. Fetch Report
      fetchReport();
    } catch (err) {
      setGeneralError('Error al recuperar datos del backend');
    }
  };

  const fetchReport = async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/monthly?currency=${reportCurrency}`, { headers: getHeaders() });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      log.error(err);
    }
  };

  const fetchFilteredTransactions = async () => {
    try {
      let url = `${API_BASE}/transactions?page=${txPage}&size=8&sort=transactionDate,desc`;
      if (filterAcc) url += `&accountId=${filterAcc}`;
      if (filterCat) url += `&categoryId=${filterCat}`;
      if (filterStart) url += `&startDate=${new Date(filterStart).toISOString()}`;
      if (filterEnd) url += `&endDate=${new Date(filterEnd).toISOString()}`;

      const res = await fetch(url, { headers: getHeaders() });
      const data = await res.json();
      setTransactions(data.content || []);
      setTxTotalPages(data.totalPages || 1);
    } catch (err) {
      setGeneralError('Error al filtrar transacciones');
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  useEffect(() => {
    if (view === 'TRANSACTIONS') {
      fetchFilteredTransactions();
    }
  }, [view, filterAcc, filterCat, filterStart, filterEnd, txPage]);

  useEffect(() => {
    if (token) {
      fetchReport();
    }
  }, [reportCurrency]);

  // Form Submit Handlers
  const createAccount = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/accounts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: newAccName, balance: parseFloat(newAccBalance), currency: newAccCurrency })
      });
      if (!res.ok) throw new Error('Error al registrar cuenta');
      setNewAccName('');
      setNewAccBalance('');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const createTransaction = async (e) => {
    e.preventDefault();
    setTxAlert(null);
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          accountId: parseInt(newTxAccount),
          categoryId: parseInt(newTxCategory),
          amount: parseFloat(newTxAmount),
          type: newTxType,
          description: newTxDesc
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar transacción');

      setNewTxAmount('');
      setNewTxDesc('');
      
      if (data.budgetExceeded) {
        setTxAlert({ type: 'warning', message: '¡Alerta! Has superado el presupuesto mensual configurado para esta categoría.' });
      } else {
        setTxAlert({ type: 'success', message: 'Transacción guardada exitosamente.' });
      }
      fetchData();
    } catch (err) {
      setTxAlert({ type: 'danger', message: err.message });
    }
  };

  const createTransfer = async (e) => {
    e.preventDefault();
    setTransferSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/transfers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          sourceAccountId: parseInt(newTransferSource),
          destinationAccountId: parseInt(newTransferDest),
          amount: parseFloat(newTransferAmount),
          description: newTransferDesc
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al registrar transferencia');

      setNewTransferAmount('');
      setNewTransferDesc('');
      setTransferSuccess('Transferencia registrada exitosamente.');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const createBudget = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/budgets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          categoryId: parseInt(newBudgetCategory),
          limitAmount: parseFloat(newBudgetAmount),
          monthPeriod: parseInt(newBudgetPeriod)
        })
      });
      if (!res.ok) throw new Error('Error al registrar presupuesto');
      setNewBudgetAmount('');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const createSavingsGoal = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/savings-goals`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title: newGoalTitle,
          targetAmount: parseFloat(newGoalTarget),
          targetDate: newGoalDate
        })
      });
      if (!res.ok) throw new Error('Error al registrar meta');
      setNewGoalTitle('');
      setNewGoalTarget('');
      setNewGoalDate('');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const allocateSavings = async (e) => {
    e.preventDefault();
    setGoalAllocSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/savings-goals/${allocateGoalId}/allocate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          accountId: parseInt(allocateAccountId),
          amount: parseFloat(allocateAmount)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al destinar ahorros');

      setAllocateAmount('');
      setGoalAllocSuccess(`Ahorros destinados con éxito. Estado actual: ${data.status}`);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const createRecurringExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/recurring-expenses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          accountId: parseInt(newRecAcc),
          categoryId: parseInt(newRecCat),
          amount: parseFloat(newRecAmount),
          description: newRecDesc,
          nextExecutionDate: newRecDate
        })
      });
      if (!res.ok) throw new Error('Error al programar gasto fijo');
      setNewRecAmount('');
      setNewRecDesc('');
      setNewRecDate('');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER NAVBAR */}
      {token && (
        <header className="glass-card" style={{ borderRadius: '0', borderLeft: 'none', borderRight: 'none', borderTop: 'none', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              GESTOR DE GASTOS
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hola de nuevo, {user?.firstName || 'Usuario'}</p>
          </div>
          <nav style={{ display: 'flex', gap: '20px' }}>
            <button onClick={() => setView('DASHBOARD')} className="btn-secondary" style={{ padding: '8px 16px', borderColor: view === 'DASHBOARD' ? 'var(--accent-cyan)' : 'transparent' }}>Dashboard</button>
            <button onClick={() => setView('TRANSACTIONS')} className="btn-secondary" style={{ padding: '8px 16px', borderColor: view === 'TRANSACTIONS' ? 'var(--accent-cyan)' : 'transparent' }}>Movimientos</button>
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>Salir</button>
          </nav>
        </header>
      )}

      <main style={{ flex: '1', padding: '40px 20px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        
        {generalError && (
          <div className="glass-card" style={{ borderLeft: '4px solid var(--danger)', padding: '16px', marginBottom: '24px', color: 'var(--danger)' }}>
            <strong>Error:</strong> {generalError}. Por favor, asegúrate de que el backend de Spring Boot esté corriendo.
          </div>
        )}

        {/* 1. VIEW: LOGIN */}
        {view === 'LOGIN' && (
          <div className="glass-card animate-fade-in" style={{ maxWidth: '450px', margin: '80px auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', fontWeight: '700' }}>Iniciar Sesión</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>Ingresa tus credenciales financieras</p>
            {authError && <div style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '0.9rem' }}>{authError}</div>}
            {authSuccess && <div style={{ color: 'var(--success)', marginBottom: '16px', fontSize: '0.9rem' }}>{authSuccess}</div>}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Email</label>
                <input type="email" required className="glass-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="ejemplo@correo.com" />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Contraseña</label>
                <input type="password" required className="glass-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="******" />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Ingresar</button>
            </form>
            <p style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              ¿No tienes una cuenta? <span onClick={() => setView('REGISTER')} style={{ color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: '500' }}>Regístrate aquí</span>
            </p>
          </div>
        )}

        {/* 2. VIEW: REGISTER */}
        {view === 'REGISTER' && (
          <div className="glass-card animate-fade-in" style={{ maxWidth: '450px', margin: '80px auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', fontWeight: '700' }}>Registrar Usuario</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>Crea tu perfil de portfolio</p>
            {authError && <div style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '0.9rem' }}>{authError}</div>}
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Nombre</label>
                <input type="text" required className="glass-input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Tu Nombre" />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Email</label>
                <input type="email" required className="glass-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Contraseña</label>
                <input type="password" required className="glass-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Al menos 6 caracteres" />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Crear Cuenta</button>
            </form>
            <p style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              ¿Ya estás registrado? <span onClick={() => setView('LOGIN')} style={{ color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: '500' }}>Inicia sesión</span>
            </p>
          </div>
        )}

        {/* 3. VIEW: DASHBOARD PANEL */}
        {view === 'DASHBOARD' && token && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* GRID SECCION SUPERIOR: CUENTAS Y CREACION */}
            <div className="grid-cols-2">
              
              {/* LISTADO DE CUENTAS */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', fontWeight: '600' }}>
                  💰 Mis Cuentas Activas
                </h3>
                {accounts.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No tienes cuentas registradas aún. ¡Crea una a la derecha!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {accounts.map(acc => (
                      <div key={acc.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                        <div>
                          <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{acc.name}</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {acc.id} | Moneda: {acc.currency}</p>
                        </div>
                        <span style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                          {acc.balance.toLocaleString('es-AR', { style: 'currency', currency: acc.currency })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CREAR CUENTA NUEVA */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px', fontWeight: '600' }}>
                  ➕ Registrar Nueva Cuenta
                </h3>
                <form onSubmit={createAccount} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" required className="glass-input" placeholder="Nombre (ej: Santander Río, Efectivo)" value={newAccName} onChange={e => setNewAccName(e.target.value)} />
                  <div className="grid-cols-2" style={{ gap: '12px' }}>
                    <input type="number" step="0.01" required className="glass-input" placeholder="Saldo Inicial (BigDecimal)" value={newAccBalance} onChange={e => setNewAccBalance(e.target.value)} />
                    <select className="glass-input" value={newAccCurrency} onChange={e => setNewAccCurrency(e.target.value)}>
                      <option value="USD">Dólar (USD)</option>
                      <option value="ARS">Pesos Argentinos (ARS)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Crear Cuenta</button>
                </form>
              </div>

            </div>

            {/* SECCION CENTRAL: REGISTRO DE TRANSACCIONES Y TRANSFERENCIAS */}
            <div className="grid-cols-2">

              {/* CREAR TRANSACCION */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px', fontWeight: '600' }}>
                  📝 Cargar Transacción (Impacta Saldo y Valida Presupuesto)
                </h3>
                {txAlert && (
                  <div style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    marginBottom: '16px', 
                    fontSize: '0.85rem',
                    background: txAlert.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' : txAlert.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: txAlert.type === 'warning' ? 'var(--warning)' : txAlert.type === 'success' ? 'var(--success)' : 'var(--danger)',
                    border: `1px solid ${txAlert.type === 'warning' ? 'rgba(245, 158, 11, 0.3)' : txAlert.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                  }}>
                    {txAlert.message}
                  </div>
                )}
                <form onSubmit={createTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="grid-cols-2" style={{ gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cuenta origen/destino</label>
                      <select className="glass-input" value={newTxAccount} onChange={e => setNewTxAccount(e.target.value)}>
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Categoría</label>
                      <select className="glass-input" value={newTxCategory} onChange={e => setNewTxCategory(e.target.value)}>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid-cols-2" style={{ gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Monto</label>
                      <input type="number" step="0.01" required className="glass-input" placeholder="0.00" value={newTxAmount} onChange={e => setNewTxAmount(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tipo de Movimiento</label>
                      <select className="glass-input" value={newTxType} onChange={e => setNewTxType(e.target.value)}>
                        <option value="EXPENSE">Egreso (EXPENSE)</option>
                        <option value="INCOME">Ingreso (INCOME)</option>
                      </select>
                    </div>
                  </div>
                  <input type="text" className="glass-input" placeholder="Descripción (ej: Compras Coto)" value={newTxDesc} onChange={e => setNewTxDesc(e.target.value)} />
                  <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Registrar Movimiento</button>
                </form>
              </div>

              {/* REGISTRAR TRANSFERENCIA ENTRE CUENTAS PROPIAS */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px', fontWeight: '600' }}>
                  🔄 Transferencia Cruzada Interna (Aplica Tipo de Cambio)
                </h3>
                {transferSuccess && (
                  <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    {transferSuccess}
                  </div>
                )}
                <form onSubmit={createTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="grid-cols-2" style={{ gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cuenta Origen</label>
                      <select className="glass-input" value={newTransferSource} onChange={e => setNewTransferSource(e.target.value)}>
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cuenta Destino</label>
                      <select className="glass-input" value={newTransferDest} onChange={e => setNewTransferDest(e.target.value)}>
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
                      </select>
                    </div>
                  </div>
                  <input type="number" step="0.01" required className="glass-input" placeholder="Monto a debitar de la cuenta origen" value={newTransferAmount} onChange={e => setNewTransferAmount(e.target.value)} />
                  <input type="text" className="glass-input" placeholder="Descripción de transferencia" value={newTransferDesc} onChange={e => setNewTransferDesc(e.target.value)} />
                  <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Realizar Transferencia</button>
                </form>
              </div>

            </div>

            {/* SECCION INFERIOR: METAS DE AHORRO Y PRESUPUESTOS */}
            <div className="grid-cols-2">

              {/* METAS DE AHORRO */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', fontWeight: '600' }}>
                  🎯 Metas de Ahorro (Saldos Virtuales)
                </h3>
                
                {/* LISTAR METAS */}
                {savingsGoals.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No tienes metas de ahorro registradas.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {savingsGoals.map(goal => {
                      const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                      return (
                        <div key={goal.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div>
                              <strong>{goal.title}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '10px' }}>
                                Límite: {goal.targetDate}
                              </span>
                            </div>
                            <span className={`badge ${goal.status === 'COMPLETED' ? 'badge-income' : 'badge-expense'}`}>{goal.status}</span>
                          </div>
                          
                          {/* Barra de Progreso */}
                          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                            <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-indigo), var(--accent-cyan))', borderRadius: '4px' }}></div>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <span>Ahorrado: ${goal.currentAmount}</span>
                            <span>Objetivo: ${goal.targetAmount} ({percent}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* FORM CREAR META */}
                <form onSubmit={createSavingsGoal} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Añadir Nueva Meta</strong>
                  <input type="text" required className="glass-input" placeholder="Nombre de la meta (ej: Auto)" value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} />
                  <div className="grid-cols-2" style={{ gap: '12px' }}>
                    <input type="number" step="0.01" required className="glass-input" placeholder="Monto objetivo ($)" value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)} />
                    <input type="date" required className="glass-input" value={newGoalDate} onChange={e => setNewGoalDate(e.target.value)} />
                  </div>
                  <button type="submit" className="btn-secondary" style={{ padding: '10px' }}>Crear Meta de Ahorro</button>
                </form>

                {/* FORM DESTINAR FONDOS */}
                {savingsGoals.length > 0 && (
                  <form onSubmit={allocateSavings} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Abonar Fondos desde Cuenta Real (Debita Balance)</strong>
                    {goalAllocSuccess && (
                      <div style={{ padding: '8px', borderRadius: '4px', fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                        {goalAllocSuccess}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select className="glass-input" style={{ flex: '1' }} value={allocateGoalId} onChange={e => setAllocateGoalId(e.target.value)}>
                        {savingsGoals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                      </select>
                      <select className="glass-input" style={{ flex: '1' }} value={allocateAccountId} onChange={e => setAllocateAccountId(e.target.value)}>
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
                      </select>
                      <input type="number" step="0.01" required className="glass-input" style={{ width: '100px' }} placeholder="Monto" value={allocateAmount} onChange={e => setAllocateAmount(e.target.value)} />
                      <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>Guardar</button>
                    </div>
                  </form>
                )}
              </div>

              {/* REPORTES Y PRESUPUESTOS MENSUALES */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* REPORTE MENSUAL */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>📊 Reporte por Categorías</h3>
                    <select className="glass-input" style={{ width: '100px', padding: '6px' }} value={reportCurrency} onChange={e => setReportCurrency(e.target.value)}>
                      <option value="USD">USD</option>
                      <option value="ARS">ARS</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  {report.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No hay egresos registrados este mes.</p>
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
                          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${rep.percentage}%`, height: '100%', background: 'var(--accent-cyan)', borderRadius: '3px' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* PRESUPUESTOS Y LÍMITES */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px' }}>🛡️ Límites Presupuestarios</h3>
                  {budgets.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>No has establecido límites mensuales.</p>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                      {budgets.map(b => (
                        <div key={b.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                          <strong>{b.categoryName}:</strong> ${b.limitAmount} <span style={{ color: 'var(--text-secondary)' }}>({b.monthPeriod})</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* FORM PRESUPUESTO */}
                  <form onSubmit={createBudget} style={{ display: 'flex', gap: '10px' }}>
                    <select className="glass-input" style={{ flex: '1' }} value={newBudgetCategory} onChange={e => setNewBudgetCategory(e.target.value)}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="number" step="0.01" required className="glass-input" style={{ flex: '1' }} placeholder="Monto Limite ($)" value={newBudgetAmount} onChange={e => setNewBudgetAmount(e.target.value)} />
                    <button type="submit" className="btn-secondary" style={{ padding: '8px 16px' }}>Configurar</button>
                  </form>
                </div>

              </div>

            </div>

            {/* SECCION ADICIONAL: GASTOS RECURRENTES SUSCRIPCIONES */}
            <div className="glass-card animate-fade-in">
              <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px', fontWeight: '600' }}>
                📅 Suscripciones y Gastos Programados (Ejecutados diariamente por el Scheduler)
              </h3>
              
              <div className="grid-cols-2" style={{ gap: '30px' }}>
                {/* Listado de Suscripciones */}
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '12px' }}>Suscripciones Activas</strong>
                  {recurringExpenses.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No tienes gastos fijos programados.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {recurringExpenses.map(re => (
                        <div key={re.id} style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <div>
                            <strong>{re.description}</strong>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Cuenta: {re.accountName} | Cat: {re.categoryName}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <strong style={{ color: 'var(--danger)' }}>${re.amount}</strong>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Próx: {re.nextExecutionDate}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Formulario Programar Gasto */}
                <form onSubmit={createRecurringExpense} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Programar Gasto</strong>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select className="glass-input" value={newRecAcc} onChange={e => setNewRecAcc(e.target.value)}>
                      {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                    <select className="glass-input" value={newRecCat} onChange={e => setNewRecCat(e.target.value)}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="number" step="0.01" required className="glass-input" placeholder="Monto" value={newRecAmount} onChange={e => setNewRecAmount(e.target.value)} />
                    <input type="date" required className="glass-input" value={newRecDate} onChange={e => setNewRecDate(e.target.value)} />
                  </div>
                  <input type="text" required className="glass-input" placeholder="Suscripción (ej: Alquiler, Spotify, Netflix)" value={newRecDesc} onChange={e => setNewRecDesc(e.target.value)} />
                  <button type="submit" className="btn-primary" style={{ padding: '10px' }}>Programar Débito Mensual</button>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* 4. VIEW: TRANSACTIONS LIST (HISTORIAL FILTRADO Y PAGINADO) */}
        {view === 'TRANSACTIONS' && token && (
          <div className="glass-card animate-fade-in">
            <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px', fontWeight: '700' }}>
              📜 Historial de Movimientos
            </h2>

            {/* FILTROS */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
              <div style={{ flex: '1', minWidth: '150px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cuenta</label>
                <select className="glass-input" value={filterAcc} onChange={e => { setFilterAcc(e.target.value); setTxPage(0); }}>
                  <option value="">Todas</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>
              <div style={{ flex: '1', minWidth: '150px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Categoría</label>
                <select className="glass-input" value={filterCat} onChange={e => { setFilterCat(e.target.value); setTxPage(0); }}>
                  <option value="">Todas</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div style={{ flex: '1', minWidth: '150px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fecha Inicio</label>
                <input type="date" className="glass-input" value={filterStart} onChange={e => { setFilterStart(e.target.value); setTxPage(0); }} />
              </div>
              <div style={{ flex: '1', minWidth: '150px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fecha Fin</label>
                <input type="date" className="glass-input" value={filterEnd} onChange={e => { setFilterEnd(e.target.value); setTxPage(0); }} />
              </div>
            </div>

            {/* LISTADO DE MOVIENTOS */}
            {transactions.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>No se encontraron transacciones con los filtros seleccionados.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {transactions.map(tx => (
                  <div key={tx.id} style={{ background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '1rem' }}>{tx.description || '[Sin Descripción]'}</strong>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Cuenta: {tx.accountName} | Categoría: {tx.categoryName} | Fecha: {new Date(tx.transactionDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${tx.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`} style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                        {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                ))}

                {/* PAGINACION */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <button onClick={() => setTxPage(p => Math.max(0, p - 1))} disabled={txPage === 0} className="btn-secondary" style={{ padding: '8px 16px', opacity: txPage === 0 ? '0.5' : '1', cursor: txPage === 0 ? 'not-allowed' : 'pointer' }}>Anterior</button>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Página {txPage + 1} de {txTotalPages}</span>
                  <button onClick={() => setTxPage(p => Math.min(txTotalPages - 1, p + 1))} disabled={txPage >= txTotalPages - 1} className="btn-secondary" style={{ padding: '8px 16px', opacity: txPage >= txTotalPages - 1 ? '0.5' : '1', cursor: txPage >= txTotalPages - 1 ? 'not-allowed' : 'pointer' }}>Siguiente</button>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '24px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)' }}>
        Gestor de Gastos Backend Portfolio - Diseñado con Java 25, Spring Boot 3.x, PostgreSQL y React
      </footer>

    </div>
  );
}

export default App;
