function IncomeExpenses({ income, expense }) {
  const incomeFormatted = income.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
  });

  const expenseFormatted = expense.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
  });

  return (
    <section className="grid grid-cols-2 gap-4">
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-emerald-300">
          Ingresos
        </p>
        <p className="text-lg font-semibold text-emerald-200 mt-1">
          {incomeFormatted}
        </p>
      </div>
      <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-rose-300">
          Gastos
        </p>
        <p className="text-lg font-semibold text-rose-200 mt-1">
          {expenseFormatted}
        </p>
      </div>
    </section>
  );
}

export default IncomeExpenses;

