import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = [
  '#fb7185',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#6366f1',
  '#a855f7',
];

function ExpensesChart({ transactions }) {
  const data = Object.values(
    transactions
      .filter((t) => t.amount < 0)
      .reduce((acc, t) => {
        const key = t.category || 'Otros';
        const value = Math.abs(t.amount);

        if (!acc[key]) {
          acc[key] = { name: key, value: 0 };
        }
        acc[key].value += value;
        return acc;
      }, {})
  );

  const hasData = data.length > 0;

  return (
    <section className="h-64">
      <h2 className="text-sm font-semibold tracking-wide text-slate-300 uppercase mb-3">
        Gastos por categoría
      </h2>

      <div className="w-full h-full rounded-xl border border-slate-800 bg-slate-900/80 flex items-center justify-center px-2">
        {!hasData ? (
          <p className="text-xs text-slate-500 text-center px-4">
            Aún no hay gastos para mostrar. Agrega una transacción marcada como
            gasto.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="80%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#020617',
                  borderRadius: '0.5rem',
                  border: '1px solid #1f2937',
                  fontSize: '0.75rem',
                }}
                formatter={(value) =>
                  value.toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                  })
                }
              />
              <Legend
                wrapperStyle={{
                  fontSize: '0.7rem',
                  color: '#9ca3af',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

export default ExpensesChart;

