const API_BASE = 'http://localhost:8080/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Error al iniciar sesión');
      }
      return res.json();
    },
    register: async (email, password, firstName) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Error al registrarse');
      }
      return res.json();
    }
  },
  accounts: {
    getAccounts: async () => {
      const res = await fetch(`${API_BASE}/accounts`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Error al obtener cuentas');
      return res.json();
    },
    createAccount: async (data) => {
      const res = await fetch(`${API_BASE}/accounts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Error al crear cuenta');
      return res.json();
    }
  },
  categories: {
    getCategories: async () => {
      const res = await fetch(`${API_BASE}/categories`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Error al obtener categorías');
      return res.json();
    },
    createCategory: async (data) => {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Error al crear categoría');
      return res.json();
    },
    suggestCategory: async (description) => {
      const res = await fetch(`${API_BASE}/categories/suggest?description=${encodeURIComponent(description)}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Error al sugerir categoría');
      return res.json();
    }
  },
  transactions: {
    getTransactions: async ({ page = 0, size = 8, accountId, categoryId, startDate, endDate } = {}) => {
      let url = `${API_BASE}/transactions?page=${page}&size=${size}&sort=transactionDate,desc`;
      if (accountId) url += `&accountId=${accountId}`;
      if (categoryId) url += `&categoryId=${categoryId}`;
      if (startDate) url += `&startDate=${new Date(startDate).toISOString()}`;
      if (endDate) url += `&endDate=${new Date(endDate).toISOString()}`;

      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) throw new Error('Error al obtener transacciones');
      return res.json();
    },
    createTransaction: async (data) => {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Error al guardar transacción');
      }
      return res.json();
    }
  },
  transfers: {
    createTransfer: async (data) => {
      const res = await fetch(`${API_BASE}/transfers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Error al registrar transferencia');
      }
      return res.json();
    }
  },
  budgets: {
    getBudgets: async () => {
      const res = await fetch(`${API_BASE}/budgets`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Error al obtener presupuestos');
      return res.json();
    },
    createBudget: async (data) => {
      const res = await fetch(`${API_BASE}/budgets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Error al registrar presupuesto');
      return res.json();
    }
  },
  savings: {
    getSavingsGoals: async () => {
      const res = await fetch(`${API_BASE}/savings-goals`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Error al obtener metas de ahorro');
      return res.json();
    },
    createSavingsGoal: async (data) => {
      const res = await fetch(`${API_BASE}/savings-goals`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Error al crear meta de ahorro');
      return res.json();
    },
    allocateSavings: async (goalId, data) => {
      const res = await fetch(`${API_BASE}/savings-goals/${goalId}/allocate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Error al abonar fondos a meta');
      }
      return res.json();
    }
  },
  recurring: {
    getRecurringExpenses: async () => {
      const res = await fetch(`${API_BASE}/recurring-expenses`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Error al obtener gastos recurrentes');
      return res.json();
    },
    createRecurringExpense: async (data) => {
      const res = await fetch(`${API_BASE}/recurring-expenses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Error al registrar gasto recurrente');
      return res.json();
    }
  },
  reports: {
    getMonthlyReport: async (currency = 'ARS', startDate = '', endDate = '', type = '') => {
      let url = `${API_BASE}/reports/monthly?currency=${currency}`;
      if (startDate) url += `&startDate=${new Date(startDate).toISOString()}`;
      if (endDate) url += `&endDate=${new Date(endDate).toISOString()}`;
      if (type) url += `&type=${type}`;
      
      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) throw new Error('Error al generar reporte');
      return res.json();
    },
    getTrendReport: async (currency = 'ARS', period = '6_MONTHS', customStart = '', customEnd = '') => {
      let url = `${API_BASE}/reports/trend?currency=${currency}&period=${period}`;
      if (customStart) url += `&customStart=${new Date(customStart).toISOString()}`;
      if (customEnd) url += `&customEnd=${new Date(customEnd).toISOString()}`;
      
      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) throw new Error('Error al generar gráfico de tendencias');
      return res.json();
    }
  }
};
