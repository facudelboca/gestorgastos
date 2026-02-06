import React, { useMemo, useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

// Helpers
const toDate = (d) => {
  const dt = d ? new Date(d) : null;
  if (dt && !isNaN(dt)) return dt;
  return null;
};

const pad = (n) => String(n).padStart(2, '0');

const monthKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

// ISO week (year-week)
const getISOWeekYear = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Thursday in current week decides the year.
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${pad(weekNo)}`;
};

const yearKey = (date) => `${date.getFullYear()}`;

const formatPeriodLabel = (key, gran) => {
  if (gran === 'month') return key;
  if (gran === 'year') return key;
  // week key like YYYY-Www -> display YYYY Wnn
  return key.replace('-W', ' W');
};

const aggregateBy = (transactions, granularity, filter) => {
  // returns { [periodKey]: { ingresos, gastos } }
  const acc = {};
  transactions.forEach((t) => {
    const amt = Number(t.amount);
    if (!amt || isNaN(amt)) return; // skip zero/invalid
    const date = toDate(t.date);
    if (!date) return;

    let key;
    if (granularity === 'month') key = monthKey(date);
    else if (granularity === 'year') key = yearKey(date);
    else key = getISOWeekYear(date);

    // Apply filter if provided (filter: { year, month, weekKey })
    if (filter) {
      if (filter.year && key.indexOf(filter.year) !== 0) return;
      if (filter.month && granularity === 'month' && key !== filter.month) return;
      if (filter.week && granularity === 'week' && key !== filter.week) return;
    }

    if (!acc[key]) acc[key] = { ingresos: 0, gastos: 0 };
    if (amt > 0) acc[key].ingresos += amt;
    else acc[key].gastos += Math.abs(amt);
  });

  return acc;
};

const sortPeriodKeys = (keys, gran) => {
  return keys.sort((a, b) => {
    if (gran === 'year') return Number(a) - Number(b);
    if (gran === 'month') return a.localeCompare(b);
    // week key: YYYY-Www -> compare year then week
    const [ay, aw] = a.split('-W');
    const [by, bw] = b.split('-W');
    if (ay !== by) return Number(ay) - Number(by);
    return Number(aw) - Number(bw);
  });
};

const AdvancedCharts = ({ transactions = [], preset = 'all' }) => {
  const [granularity, setGranularity] = useState('month'); // month | week | year
  const [presetLimit, setPresetLimit] = useState(null);
  const dates = useMemo(() => transactions.map((t) => toDate(t.date)).filter(Boolean), [transactions]);

  const years = useMemo(() => {
    const s = new Set(dates.map((d) => d.getFullYear()));
    return Array.from(s).sort((a, b) => a - b).map(String);
  }, [dates]);

  const months = useMemo(() => {
    const s = new Set(dates.map((d) => monthKey(d)));
    return Array.from(s).sort();
  }, [dates]);

  const weeks = useMemo(() => {
    const s = new Set(dates.map((d) => getISOWeekYear(d)));
    return Array.from(s).sort();
  }, [dates]);

  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterWeek, setFilterWeek] = useState('');

  // Apply preset (granularity + limit)
  useEffect(() => {
    if (!preset || preset === 'all') {
      setPresetLimit(null);
      return;
    }

    if (preset === 'last-3-months') {
      setGranularity('month');
      setPresetLimit(3);
      return;
    }

    if (preset === 'last-12-weeks') {
      setGranularity('week');
      setPresetLimit(12);
      return;
    }

    if (preset === 'last-3-years') {
      setGranularity('year');
      setPresetLimit(3);
      return;
    }
  }, [preset]);

  const filter = useMemo(() => {
    if (granularity === 'year' && filterYear) return { year: filterYear };
    if (granularity === 'month' && filterMonth) return { month: filterMonth };
    if (granularity === 'week' && filterWeek) return { week: filterWeek };
    if (filterYear) return { year: filterYear };
    return null;
  }, [granularity, filterYear, filterMonth, filterWeek]);

  const aggregated = useMemo(() => {
    const agg = aggregateBy(transactions, granularity, null);
    // If user set a filter narrow down
    if (filter) {
      // re-aggregate with filter applied
      return aggregateBy(transactions, granularity, filter);
    }
    return agg;
  }, [transactions, granularity, filter]);

  const periodKeys = useMemo(() => {
    let keys = sortPeriodKeys(Object.keys(aggregated), granularity);
    if (presetLimit && keys.length > presetLimit) keys = keys.slice(-presetLimit);
    return keys;
  }, [aggregated, granularity, presetLimit]);

  const series = useMemo(() => {
    return periodKeys.map((k) => ({
      period: formatPeriodLabel(k, granularity),
      Ingresos: parseFloat(((aggregated[k] && aggregated[k].ingresos) || 0).toFixed(2)),
      Gastos: parseFloat(((aggregated[k] && aggregated[k].gastos) || 0).toFixed(2)),
    }));
  }, [periodKeys, aggregated, granularity]);

  // cumulative balance per period
  const cumulative = useMemo(() => {
    let total = 0;
    return series.map((s) => {
      total += (s.Ingresos || 0) - (s.Gastos || 0);
      return { period: s.period, Balance: parseFloat(total.toFixed(2)) };
    });
  }, [series]);

  // Pie chart category distribution for gastos and ingresos
  const categoryDistribution = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      const amt = Number(t.amount);
      if (isNaN(amt) || amt === 0) return;
      const date = toDate(t.date);
      if (!date) return;
      // apply filter if exists
      if (filter) {
        if (filter.year && String(date.getFullYear()) !== filter.year) return;
        if (filter.month && monthKey(date) !== filter.month) return;
        if (filter.week && getISOWeekYear(date) !== filter.week) return;
      }
      const cat = t.category || 'Otros';
      if (!map[cat]) map[cat] = { gastos: 0, ingresos: 0 };
      if (amt > 0) map[cat].ingresos += amt;
      else map[cat].gastos += Math.abs(amt);
    });

    const gastos = Object.entries(map)
      .map(([name, v]) => ({ name, value: parseFloat(v.gastos.toFixed(2)) }))
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value);

    const ingresos = Object.entries(map)
      .map(([name, v]) => ({ name, value: parseFloat(v.ingresos.toFixed(2)) }))
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value);

    return { gastos, ingresos };
  }, [transactions, filter]);

  if (transactions.length === 0) {
    return <div className="text-center text-gray-500 py-8">No hay transacciones para mostrar gráficos</div>;
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold">Granularidad:</label>
        <select value={granularity} onChange={(e) => setGranularity(e.target.value)} className="px-3 py-2 rounded border">
          <option value="week">Semana</option>
          <option value="month">Mes</option>
          <option value="year">Año</option>
        </select>

        <label className="text-sm font-semibold">Filtrar año:</label>
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="px-3 py-2 rounded border">
          <option value="">Todos</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {granularity === 'month' && (
          <>
            <label className="text-sm font-semibold">Mes:</label>
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="px-3 py-2 rounded border">
              <option value="">Todos</option>
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </>
        )}

        {granularity === 'week' && (
          <>
            <label className="text-sm font-semibold">Semana:</label>
            <select value={filterWeek} onChange={(e) => setFilterWeek(e.target.value)} className="px-3 py-2 rounded border">
              <option value="">Todas</option>
              {weeks.map((w) => (
                <option key={w} value={w}>{w.replace('-W', ' W')}</option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Expenses Pie */}
      {categoryDistribution.gastos.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Distribución de Gastos por Categoría</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categoryDistribution.gastos} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name} (${(percent*100).toFixed(0)}%)`}>
                {categoryDistribution.gastos.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Income Pie */}
      {categoryDistribution.ingresos.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Distribución de Ingresos por Categoría</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categoryDistribution.ingresos} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name} (${(percent*100).toFixed(0)}%)`}>
                {categoryDistribution.ingresos.map((_, i) => (
                  <Cell key={i} fill={COLORS[(i+2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Line chart Ingresos vs Gastos */}
      {series.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Ingresos vs Gastos ({granularity})</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={series} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="Ingresos" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="Gastos" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Balance cumulative */}
      {cumulative.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Balance Acumulado ({granularity})</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={cumulative} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
              <Bar dataKey="Balance" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Simple stats */}
      <div className="bg-white p-4 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Transacciones</p>
            <p className="text-2xl font-bold">{transactions.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Ingresos</p>
            <p className="text-2xl font-bold text-green-600">${transactions.filter(t => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Gastos</p>
            <p className="text-2xl font-bold text-red-600">${transactions.filter(t => Number(t.amount) < 0).reduce((s, t) => s + Math.abs(Number(t.amount)), 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Balance</p>
            <p className="text-2xl font-bold">${(transactions.reduce((s, t) => s + Number(t.amount || 0), 0)).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCharts;
