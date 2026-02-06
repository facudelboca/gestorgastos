import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CATEGORIES = ['Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Otros', 'Casa'];

const BudgetManager = ({ token }) => {
  const [budgets, setBudgets] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Comida',
    limit: '',
    month: selectedMonth
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch budgets cuando cambia el mes
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

      // Actualizar lista con nuevo presupuesto
      setBudgets([...budgets, {
        ...response.data,
        spent: 0,
        remaining: response.data.limit,
        percentage: 0
      }]);

      setFormData({ category: 'Comida', limit: '', month: selectedMonth });
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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Presupuestos</h2>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

      {/* Selector de mes */}
      <div className="mb-6 flex items-center gap-4">
        <label className="font-semibold">Mes:</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border rounded px-3 py-2"
        />
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="ml-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Agregar Presupuesto
          </button>
        )}
      </div>

      {/* Formulario de agregar presupuesto */}
      {showForm && (
        <form onSubmit={handleAddBudget} className="bg-gray-50 p-4 rounded mb-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Límite ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                placeholder="0.00"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Crear
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Lista de presupuestos */}
      {loading ? (
        <p className="text-center text-gray-500">Cargando presupuestos...</p>
      ) : budgets.length === 0 ? (
        <p className="text-center text-gray-500">No hay presupuestos para este mes</p>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => (
            <div key={budget._id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{budget.category}</h3>
                  <p className="text-sm text-gray-600">
                    Gastado: ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded text-white text-sm font-semibold ${getProgressColor(budget.percentage)}`}>
                    {getStatusText(budget.percentage)}
                  </span>
                  <p className="text-lg font-bold text-gray-700 mt-1">${budget.remaining.toFixed(2)}</p>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(budget.percentage)} transition-all`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                ></div>
              </div>

              {/* Editar límite */}
              <div className="flex items-center gap-2">
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
                  className="flex-1 border rounded px-2 py-1 text-sm"
                />
                <button
                  onClick={() => handleDeleteBudget(budget._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>

              {budget.percentage > 100 && (
                <p className="text-red-500 text-sm font-semibold mt-2">
                  ⚠️ ¡Presupuesto excedido por ${(budget.spent - budget.limit).toFixed(2)}!
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BudgetManager;
