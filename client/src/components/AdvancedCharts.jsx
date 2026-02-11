
import React, { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Calendar, PieChart as PieIcon, BarChart2 } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#6366f1', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700 shadow-lg rounded-xl">
        <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-500 dark:text-slate-400 capitalize">{entry.name}:</span>
            <span className="font-medium text-slate-900 dark:text-white">
              ${Math.abs(entry.value).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const AdvancedCharts = ({ transactions = [], days = 30 }) => {
  const [chartType, setChartType] = useState('spending'); // spending | distribution | monthly

  // Filter transactions based on the "days" prop (if provided)
  const filteredTransactions = useMemo(() => {
    if (!days || days === 'all') return transactions;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return transactions.filter(t => new Date(t.date) >= cutoff);
  }, [transactions, days]);

  // 1. Process Data for Spending Over Time (Area Chart)
  const spendingData = useMemo(() => {
    const grouped = {};
    filteredTransactions.forEach(t => {
      if (t.amount >= 0) return; // Only expenses
      // Use YYYY-MM-DD for sorting safety
      const dateObj = new Date(t.date);
      const key = dateObj.toISOString().split('T')[0];
      if (!grouped[key]) grouped[key] = 0;
      grouped[key] += Math.abs(t.amount);
    });

    return Object.entries(grouped)
      .map(([date, amount]) => ({
        date,
        displayDate: new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
        amount
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTransactions]);

  // 2. Process Data for Category Distribution (Donut Chart)
  const categoryData = useMemo(() => {
    const grouped = {};
    filteredTransactions.forEach(t => {
      if (t.amount >= 0) return; // Only expenses
      const cat = t.category || 'Uncategorized';
      if (!grouped[cat]) grouped[cat] = 0;
      grouped[cat] += Math.abs(t.amount);
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // 3. Process Data for Monthly Income vs Expenses (Bar Chart)
  const monthlyData = useMemo(() => {
    const grouped = {};
    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const displayKey = date.toLocaleString('es-ES', { month: 'short', year: 'numeric' });

      if (!grouped[key]) grouped[key] = { name: displayKey, income: 0, expense: 0, id: key };

      if (t.amount > 0) grouped[key].income += t.amount;
      else grouped[key].expense += Math.abs(t.amount);
    });

    return Object.values(grouped).sort((a, b) => a.id.localeCompare(b.id));
  }, [filteredTransactions]);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <BarChart2 size={48} className="mb-4 opacity-20" />
        <p>No enough data to visualize</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg w-max">
        <button
          onClick={() => setChartType('spending')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${chartType === 'spending'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
          <Calendar size={14} /> Diario
        </button>
        <button
          onClick={() => setChartType('distribution')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${chartType === 'distribution'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
          <PieIcon size={14} /> Categorías
        </button>
        <button
          onClick={() => setChartType('monthly')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${chartType === 'monthly'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
          <BarChart2 size={14} /> Mensual
        </button>
      </div>

      {/* Charts Area */}
      <div className="h-[350px] w-full animate-in fade-in duration-500">
        {chartType === 'spending' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spendingData}>
              <defs>
                <linearGradient id="colorSplit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="displayDate"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                minTickGap={30}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                name="Gasto Diario"
                stroke="#ec4899"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSplit)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {chartType === 'distribution' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}

        {chartType === 'monthly' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              <Bar
                dataKey="income"
                name="Ingresos"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar
                dataKey="expense"
                name="Gastos"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AdvancedCharts;
