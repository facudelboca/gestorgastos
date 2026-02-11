import React from 'react';

const Pagination = ({ pagination, onPageChange, onLimitChange }) => {
  const { page, limit, total, pages } = pagination;

  if (pages <= 1) {
    return null;
  }

  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="text-sm text-slate-600 dark:text-slate-300">
        Mostrando <span className="font-semibold">{startIndex}</span> a{' '}
        <span className="font-semibold">{endIndex}</span> de{' '}
        <span className="font-semibold">{total}</span> transacciones
      </div>

      <div className="flex items-center gap-2">
        {/* Botones de navegación */}
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
          title="Primera página"
        >
          « Primera
        </button>

        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
        >
          ‹ Anterior
        </button>

        {/* Números de página */}
        <div className="flex gap-1">
          {pages <= 5 ? (
            // Si hay 5 páginas o menos, mostrar todas
            Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`px-3 py-1 text-sm rounded border ${p === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
              >
                {p}
              </button>
            ))
          ) : (
            // Si hay más de 5 páginas, mostrar páginas alrededor de la actual
            <>
              {page > 3 && (
                <>
                  <button
                    onClick={() => onPageChange(1)}
                    className="px-3 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  >
                    1
                  </button>
                  <span className="px-1 text-slate-400">...</span>
                </>
              )}

              {Array.from(
                { length: Math.min(5, pages) },
                (_, i) => {
                  const start = Math.max(1, page - 2);
                  return start + i;
                }
              )
                .filter((p) => p <= pages)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`px-3 py-1 text-sm rounded border ${p === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                  >
                    {p}
                  </button>
                ))}

              {page < pages - 2 && (
                <>
                  <span className="px-1 text-slate-400">...</span>
                  <button
                    onClick={() => onPageChange(pages)}
                    className="px-3 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  >
                    {pages}
                  </button>
                </>
              )}
            </>
          )}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
        >
          Siguiente ›
        </button>

        <button
          onClick={() => onPageChange(pages)}
          disabled={page === pages}
          className="px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
          title="Última página"
        >
          Última »
        </button>
      </div>

      {/* Selector de límite de resultados por página */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Por página:</label>
        <select
          value={limit}
          onChange={(e) => onLimitChange(parseInt(e.target.value))}
          className="px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
};

export default Pagination;
