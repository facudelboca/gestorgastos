import { useState, useEffect, useRef } from 'react';

export default function Filters({ filters, onFiltersChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const debounceTimeoutRef = useRef(null);

  // Sincronizar localFilters cuando filters prop cambia desde afuera
  useEffect(() => {
    setLocalFilters(filters);
  }, []);

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
              <input
                type="text"
                value={localFilters.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="Ej: Comida, Transporte"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
