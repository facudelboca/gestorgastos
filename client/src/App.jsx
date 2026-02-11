
import { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionsPage from './components/TransactionsPage';
import BudgetsPage from './components/BudgetsPage';
import AnalyticsPage from './components/AnalyticsPage';

const API_URL = 'http://localhost:5000/api/v1/transactions';

function App() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    searchText: '',
    category: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
  });

  const debounceTimeoutRef = useRef(null);

  // Cargar usuario guardado
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing saved user:', e);
      }
    }
  }, []);

  // Cargar transacciones
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const params = new URLSearchParams();
        if (filters.searchText) params.append('searchText', filters.searchText);
        if (filters.category) params.append('category', filters.category);
        if (filters.minAmount) params.append('minAmount', filters.minAmount);
        if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        params.append('page', pagination.page);
        params.append('limit', pagination.limit);

        const res = await axios.get(`${API_URL}?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTransactions(res.data.data || []);
        setPagination({
          page: res.data.page,
          limit: res.data.limit,
          total: res.data.total,
          pages: res.data.pages,
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        } else {
          setError('No se pudieron cargar las transacciones.');
        }
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [user, filters, pagination.page, pagination.limit]);

  // Calcular balance
  const { balance, income, expense } = useMemo(() => {
    const inc = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const exp = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      balance: inc + exp,
      income: inc,
      expense: Math.abs(exp),
    };
  }, [transactions]);

  // Handlers
  const addTransaction = async (transactionData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(API_URL, transactionData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions((prev) => [res.data.data, ...prev]);
      setError(null);
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError('No se pudo agregar la transacción.');
    }
  };

  const updateTransaction = async (id, transactionData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_URL}/${id}`, transactionData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions((prev) =>
        prev.map((t) => (t._id === id ? res.data.data : t))
      );
      setError(null);
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError('No se pudo actualizar la transacción.');
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('No se pudo eliminar la transacción.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setTransactions([]);
    setPagination({ page: 1, limit: 20, total: 0, pages: 0 });
    setFilters({
      searchText: '',
      category: '',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination({
      page: 1,
      limit: newLimit,
      total: pagination.total,
      pages: Math.ceil(pagination.total / newLimit),
    });
  };

  // Si no está autenticado, mostrar login
  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout
      user={user}
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
      onLogout={handleLogout}
    >
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300 px-4 py-3">
          {error}
        </div>
      )}

      {currentSection === 'dashboard' && (
        <Dashboard
          transactions={transactions}
          income={income}
          expense={expense}
          balance={balance}
        />
      )}

      {currentSection === 'transactions' && (
        <TransactionsPage
          transactions={transactions}
          filters={filters}
          onFiltersChange={setFilters}
          onAdd={addTransaction}
          onDelete={deleteTransaction}
          onUpdate={updateTransaction}
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          loading={loading}
        />
      )}

      {currentSection === 'budgets' && (
        <BudgetsPage token={localStorage.getItem('token')} />
      )}

      {currentSection === 'analytics' && (
        <AnalyticsPage transactions={transactions} />
      )}
    </Layout>
  );
}

export default App;
