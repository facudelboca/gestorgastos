function Header({ balance }) {
  const formatted = balance.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
  });

  const positive = balance >= 0;

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-50 tracking-tight">
          Personal Expense Tracker
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Controla tus gastos e ingresos de forma sencilla.
        </p>
      </div>

      <div
        className={`inline-flex flex-col items-end px-4 py-3 rounded-xl border text-right ${
          positive
            ? 'border-emerald-500/40 bg-emerald-500/10'
            : 'border-rose-500/40 bg-rose-500/10'
        }`}
      >
        <span className="text-xs uppercase tracking-wide text-slate-400">
          Balance total
        </span>
        <span className="text-xl font-semibold">
          {formatted}
        </span>
      </div>
    </header>
  );
}

export default Header;

