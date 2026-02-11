
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, AlertTriangle, Check, X, Calendar } from 'lucide-react';

const CATEGORIES = ['Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Otros', 'Casa'];

const BudgetsPage = ({ token }) => {
  const [budgets, setBudgets] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Comida',
    limit: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/v1/budgets?month=${selectedMonth}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setBudgets(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar presupuestos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    try {
      if (!formData.limit || isNaN(formData.limit) || formData.limit <= 0) {
        setError('El límite debe ser un número mayor a 0');
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/v1/budgets',
        {
          category: formData.category,
          limit: parseFloat(formData.limit),
          month: selectedMonth
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setBudgets([...budgets, {
        ...response.data,
        spent: 0,
        remaining: response.data.limit,
        percentage: 0
      }]);

      setFormData({ category: 'Comida', limit: '' });
      setShowForm(false);
      setSuccess('Presupuesto creado exitosamente');
      setTimeout(() => setSuccess(''), 3000);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear presupuesto');
    }
  };

  const handleEditBudget = async (id, newLimit) => {
    try {
      if (isNaN(newLimit) || newLimit <= 0) {
        setError('El límite debe ser un número mayor a 0');
        return;
      }

      await axios.put(
        `http://localhost:5000/api/v1/budgets/${id}`,
        { limit: parseFloat(newLimit) },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchBudgets();
      setSuccess('Presupuesto actualizado');
      setTimeout(() => setSuccess(''), 3000);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar presupuesto');
    }
  };

  const handleDeleteBudget = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar este presupuesto?')) {
      try {
        await axios.delete(
          `http://localhost:5000/api/v1/budgets/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setBudgets(budgets.filter(b => b._id !== id));
        setSuccess('Presupuesto eliminado');
        setTimeout(() => setSuccess(''), 3000);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || 'Error al eliminar presupuesto');
      }
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage <= 50) return 'bg-emerald-500';
    if (percentage <= 80) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 p-4 rounded-lg flex items-center gap-2">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 p-4 rounded-lg flex items-center gap-2">
          <Check size={18} />
          {success}
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Calendar size={20} className="text-slate-500" />
          </div>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border-none bg-transparent font-semibold text-lg text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
          />
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
          >
            <Plus size={18} />
            New Budget
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create New Budget</h3>
          <form onSubmit={handleAddBudget}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Monthly Limit
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.limit}
                    onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                    placeholder="0.00"
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2 items-end">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg font-medium transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Budgets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Skeletons
          [1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse" />
          ))
        ) : budgets.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <p>No budgets found for this month.</p>
          </div>
        ) : (
          budgets.map((budget) => {
            const percent = Math.min(budget.percentage, 100);
            const isExceeded = budget.percentage > 100;

            return (
              <div
                key={budget._id}
                className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 hover:shadow-lg hover:border-blue-100 dark:hover:border-blue-900 transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                      {budget.category}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                      ${budget.spent.toFixed(2)} spent
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      ${budget.remaining.toFixed(0)}
                    </p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Remaining</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${getProgressColor(budget.percentage)}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Edit / Delete / Status */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex-1 mr-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span>Limit:</span>
                      <input
                        type="number"
                        defaultValue={budget.limit}
                        onBlur={(e) => {
                          const val = parseFloat(e.target.value);
                          if (val !== budget.limit) handleEditBudget(budget._id, val);
                        }}
                        className="w-20 bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-blue-500 text-slate-600 dark:text-slate-300 font-medium px-0 py-0"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteBudget(budget._id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {isExceeded && (
                  <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 animate-bounce">
                    <AlertTriangle size={12} />
                    Over!
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BudgetsPage;
