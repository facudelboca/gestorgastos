function TransactionList({ transactions, onDelete }) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold tracking-wide text-slate-300 uppercase">
          Últimas transacciones
        </h2>
        <span className="text-xs text-slate-500">
          {transactions.length} registro(s)
        </span>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {transactions.length === 0 && (
          <p className="text-sm text-slate-500">
            Aún no hay transacciones. Agrega la primera para comenzar.
          </p>
        )}

        {transactions.map((t) => {
          const positive = t.amount > 0;
          const amountFormatted = t.amount.toLocaleString('es-ES', {
            style: 'currency',
            currency: 'EUR',
          });

          const date = t.date ? new Date(t.date) : null;
          const dateStr = date
            ? date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
              })
            : '';

          return (
            <div
              key={t._id}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col">
                <span className="font-medium text-slate-100">{t.text}</span>
                <div className="flex gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {t.category}
                  </span>
                  {dateStr && <span>{dateStr}</span>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`font-semibold ${
                    positive ? 'text-emerald-300' : 'text-rose-300'
                  }`}
                >
                  {positive ? '+' : ''}
                  {amountFormatted}
                </span>
                <button
                  onClick={() => onDelete(t._id)}
                  className="text-xs px-2 py-1 rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-rose-300 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TransactionList;

