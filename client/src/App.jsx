import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Header from './components/Header';
import IncomeExpenses from './components/IncomeExpenses';
import TransactionList from './components/TransactionList';
import AddTransaction from './components/AddTransaction';
import ExpensesChart from './components/ExpensesChart';

// URL base de la API (ajusta si cambias el puerto/backend)
const API_URL = 'http://localhost:5000/api/v1/transactions';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar transacciones al montar
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(API_URL);
        setTransactions(res.data.data || []);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las transacciones.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Cálculos derivados (memoizados para evitar recomputar en cada render)
  const { balance, income, expense } = useMemo(() => {
    const amounts = transactions.map((t) => t.amount);

    const total = amounts.reduce((acc, item) => acc + item, 0);
    const inc = amounts
      .filter((item) => item > 0)
      .reduce((acc, item) => acc + item, 0);
    const exp = amounts
      .filter((item) => item < 0)
      .reduce((acc, item) => acc + item, 0);

    return {
      balance: total,
      income: inc,
      expense: Math.abs(exp), // gasto positivo para mostrar
    };
  }, [transactions]);

  // Handler para agregar transacción
  const addTransaction = async (transactionData) => {
    try {
      const res = await axios.post(API_URL, transactionData);
      // Agregamos la nueva transacción al inicio de la lista
      setTransactions((prev) => [res.data.data, ...prev]);
    } catch (err) {
      console.error(err);
      setError('No se pudo agregar la transacción.');
    }
  };

  // Handler para eliminar transacción
  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar la transacción.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-3xl bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 p-6 md:p-8">
        <Header balance={balance} />

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-slate-400">Cargando...</div>
        ) : (
          <>
            <IncomeExpenses income={income} expense={expense} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
              <div>
                <AddTransaction onAdd={addTransaction} />
              </div>
              <div>
                <ExpensesChart transactions={transactions} />
              </div>
            </div>

            <TransactionList
              transactions={transactions}
              onDelete={deleteTransaction}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;

