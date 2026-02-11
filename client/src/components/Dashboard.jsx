
import React, { useEffect, useState } from 'react';
import AdvancedCharts from './AdvancedCharts';
import axios from 'axios';
import { Wallet, TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

const StatCard = ({ title, amount, icon: Icon, trend, colorClass }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
      {amount}
    </p>
  </div>
);

const Dashboard = ({ transactions: pageTransactions, income, expense, balance }) => {
  const [fullTransactions, setFullTransactions] = useState([]);
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
        if (!canceled && res.data && res.data.data) {
          setFullTransactions(res.data.data);
        }
      } catch (err) {
        console.warn('Could not fetch full transactions for dashboard charts', err);
      } finally {
        if (!canceled) setLoadingCharts(false);
      }
    };

    fetchAll();
    return () => { canceled = true; };
  }, []);

  const transactionsToUse = fullTransactions.length > 0 ? fullTransactions : pageTransactions;

  const stats = React.useMemo(() => {
    const inc = transactionsToUse
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const exp = transactionsToUse
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      balance: inc + exp,
      income: inc,
      expense: Math.abs(exp),
    };
  }, [transactionsToUse]);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Net Worth"
          amount={`$${stats.balance.toFixed(2)}`}
          icon={Wallet}
          colorClass="bg-blue-500"
        // trend={2.5} // Example trend
        />
        <StatCard
          title="Income"
          amount={`$${stats.income.toFixed(2)}`}
          icon={TrendingUp}
          colorClass="bg-emerald-500"
        />
        <StatCard
          title="Expenses"
          amount={`$${stats.expense.toFixed(2)}`}
          icon={TrendingDown}
          colorClass="bg-rose-500"
        />
        <StatCard
          title="Transactions"
          amount={transactionsToUse.length}
          icon={Activity}
          colorClass="bg-violet-500"
        />
      </div>

      {/* Main Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Spending Overview</h3>
          <AdvancedCharts transactions={transactionsToUse} />
        </div>

        {/* Recent Activity / Mini Widget */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {pageTransactions.slice(0, 5).map(t => (
              <div key={t._id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${t.amount < 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">{t.text}</p>
                    <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`font-mono text-sm font-medium ${t.amount < 0 ? 'text-slate-900 dark:text-white' : 'text-emerald-600'}`}>
                  {t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                </span>
              </div>
            ))}
            {pageTransactions.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No recent transactions</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
