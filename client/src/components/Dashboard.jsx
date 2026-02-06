import React, { useEffect, useState } from 'react';
import IncomeExpenses from './IncomeExpenses';
import AdvancedCharts from './AdvancedCharts';
import axios from 'axios';

const Dashboard = ({ transactions: pageTransactions, income, expense, balance }) => {
  const [fullTransactions, setFullTransactions] = useState(null);
  const [loadingCharts, setLoadingCharts] = useState(false);

  useEffect(() => {
    let canceled = false;
    const fetchAll = async () => {
      setLoadingCharts(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/v1/transactions?limit=1000&page=1', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!canceled && res.data && res.data.data) setFullTransactions(res.data.data);
      } catch (err) {
        console.warn('Could not fetch full transactions for dashboard charts', err);
      } finally {
        if (!canceled) setLoadingCharts(false);
      }
    };

    fetchAll();
    return () => { canceled = true; };
  }, []);

  const transactionsToUse = fullTransactions && fullTransactions.length > 0 ? fullTransactions : pageTransactions;
  const transactions = pageTransactions;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-300 text-sm font-semibold">Balance Total</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                ${balance.toFixed(2)}
              </p>
            </div>
            <div className="text-4xl">💵</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-300 text-sm font-semibold">Ingresos</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
                ${income.toFixed(2)}
              </p>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 dark:text-red-300 text-sm font-semibold">Gastos</p>
              <p className="text-3xl font-bold text-red-900 dark:text-red-100 mt-2">
                ${expense.toFixed(2)}
              </p>
            </div>
            <div className="text-4xl">📉</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 dark:text-purple-300 text-sm font-semibold">Transacciones</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">
                {transactions.length}
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6">
                <AdvancedCharts transactions={transactionsToUse} />
      </div>
    </div>
  );
};

export default Dashboard;
