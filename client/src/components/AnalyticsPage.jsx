import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdvancedCharts from './AdvancedCharts';

const AnalyticsPage = ({ transactions: pageTransactions }) => {
  const [preset, setPreset] = useState('all');
  const [fullTransactions, setFullTransactions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch full transactions for charts (ignore pagination)
  useEffect(() => {
    let canceled = false;
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        // Try to request many items in one go (server caps at 100 per page by design)
        const limit = 1000;
        const res = await axios.get(`http://localhost:5000/api/v1/transactions?limit=${limit}&page=1`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (canceled) return;

        if (res.data && res.data.data) {
          // If server returned partial set but total > returned, try a second request with larger limit
          if (res.data.total && res.data.total > res.data.count) {
            try {
              const tryAll = await axios.get(`http://localhost:5000/api/v1/transactions?limit=5000&page=1`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (!canceled && tryAll.data && tryAll.data.data) {
                setFullTransactions(tryAll.data.data);
                return;
              }
            } catch (e) {
              // fallback to received page
              console.warn('Second attempt to fetch all transactions failed, falling back to first page result');
            }
          }

          setFullTransactions(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching full transactions for charts', err);
        setError('No se pudieron cargar todas las transacciones para los gráficos');
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      canceled = true;
    };
  }, []);

  const transactionsToUse = fullTransactions && fullTransactions.length > 0 ? fullTransactions : pageTransactions;

  const getDaysFromPreset = (p) => {
    switch (p) {
      case 'last-3-months': return 90;
      case 'last-12-weeks': return 84;
      case 'last-3-years': return 1095;
      default: return 'all';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            📊 Análisis Detallado
          </h1>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium dark:text-slate-300">Rango:</label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              className="px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white"
            >
              <option value="all">Histórico Completo</option>
              <option value="last-3-months">Últimos 3 meses</option>
              <option value="last-12-weeks">Últimas 12 semanas</option>
              <option value="last-3-years">Últimos 3 años</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-sm text-slate-500">Cargando datos para gráficos...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}

        <AdvancedCharts transactions={transactionsToUse} days={getDaysFromPreset(preset)} />
      </div>
    </div>
  );
};

export default AnalyticsPage;
