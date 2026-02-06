import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    if (percentage <= 50) return 'bg-green-500';
    if (percentage <= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = (percentage) => {
    if (percentage <= 50) return 'Bien';
    if (percentage <= 80) return 'Advertencia';
    return 'Excedido';
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-4 rounded-lg">
          {success}
        </div>
      )}

      {/* Selector de mes */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <label className="font-semibold text-slate-900 dark:text-white">📅 Mes:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              + Agregar Presupuesto
            </button>
          )}
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6 border-2 border-blue-200 dark:border-blue-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Nuevo Presupuesto</h3>
          <form onSubmit={handleAddBudget} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Límite ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  placeholder="0.00"
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2 items-end">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  ✓ Crear
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Lista de presupuestos */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          💰 Presupuestos de {selectedMonth}
        </h2>

        {loading ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">
            Cargando presupuestos...
          </p>
        ) : budgets.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">
            No hay presupuestos para este mes. ¡Crea uno!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgets.map((budget) => (
              <div
                key={budget._id}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-5 hover:shadow-lg transition bg-slate-50 dark:bg-slate-800"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      {budget.category}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getProgressColor(
                        budget.percentage
                      )}`}
                    >
                      {getStatusText(budget.percentage)}
                    </span>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                      ${budget.remaining.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="bg-gray-200 dark:bg-slate-700 rounded-full h-3 mb-4 overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(budget.percentage)} transition-all duration-300`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  ></div>
                </div>

                {/* Controles */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={budget.limit}
                      onBlur={(e) => {
                        const newLimit = parseFloat(e.target.value);
                        if (newLimit !== budget.limit) {
                          handleEditBudget(budget._id, newLimit);
                        }
                      }}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteBudget(budget._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition"
                  >
                    🗑️
                  </button>
                </div>

                {budget.percentage > 100 && (
                  <p className="text-red-600 dark:text-red-400 text-sm font-bold mt-3">
                    ⚠️ ¡Excedido por ${(budget.spent - budget.limit).toFixed(2)}!
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetsPage;
