import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const DEFAULT_CATEGORIES = ['Comida', 'Transporte', 'Salario', 'Ocio', 'Servicios', 'Salud', 'Otros'];

export default function Filters({ filters, onFiltersChange, categories: propCategories }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [categories, setCategories] = useState(propCategories || DEFAULT_CATEGORIES);
  const debounceTimeoutRef = useRef(null);

  // Sincronizar localFilters cuando filters prop cambia desde afuera
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Traer categorías cuando se monte si no fueron proporcionadas por props
  useEffect(() => {
    if (propCategories) return;
    const loadCats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/v1/categories', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data) setCategories(res.data);
      } catch (e) {
        console.warn('No se pudieron cargar categorías en filtros', e);
      }
    };
    loadCats();
  }, [propCategories]);

  const handleChange = (field, value) => {
    const updatedFilters = {
      ...localFilters,
      [field]: value,
    };
    setLocalFilters(updatedFilters);

    // Debounce: solo llamar a onFiltersChange después de 500ms sin cambios
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      onFiltersChange(updatedFilters);
    }, 500);
  };

  const handleReset = () => {
    const resetFilters = {
      searchText: '',
      category: '',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: '',
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some((val) => val !== '');

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
          hasActiveFilters
            ? 'bg-blue-600/30 text-blue-300 border border-blue-600/50'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
        }`}
      >
        🔍 Filtros
        {hasActiveFilters && <span className="text-xs bg-blue-600 px-2 py-1 rounded">Activo</span>}
      </button>

      {isOpen && (
        <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda por texto */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Buscar descripción
              </label>
              <input
                type="text"
                value={localFilters.searchText}
                onChange={(e) => handleChange('searchText', e.target.value)}
                placeholder="Ej: supermercado"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Categoría
              </label>
              <select
                value={localFilters.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                {categories.map(cat => {
                  const name = typeof cat === 'string' ? cat : cat.name || cat;
                  const id = typeof cat === 'string' ? cat : cat._id || cat;
                  return (
                    <option key={id} value={name}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Monto mínimo */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Monto mínimo
              </label>
              <input
                type="number"
                value={localFilters.minAmount}
                onChange={(e) => handleChange('minAmount', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Monto máximo */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Monto máximo
              </label>
              <input
                type="number"
                value={localFilters.maxAmount}
                onChange={(e) => handleChange('maxAmount', e.target.value)}
                placeholder="999999"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Fecha inicio */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Desde
              </label>
              <input
                type="date"
                value={localFilters.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Fecha fin */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={localFilters.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="w-full mt-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-semibold transition"
            >
              ✕ Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
