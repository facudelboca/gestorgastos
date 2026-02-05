import { useState } from 'react';

const DEFAULT_CATEGORY = 'Otros';

const CATEGORIES = [
  'Comida',
  'Transporte',
  'Salario',
  'Ocio',
  'Servicios',
  'Salud',
  'Otros',
];

function AddTransaction({ onAdd }) {
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense'); // 'income' | 'expense'
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numericAmount = Number(amount);

    if (!text || !amount || Number.isNaN(numericAmount)) {
      return;
    }

    // Convertimos el monto a positivo o negativo según el tipo
    const signedAmount =
      type === 'income'
        ? Math.abs(numericAmount)
        : -Math.abs(numericAmount);

    const newTransaction = {
      text: text.trim(),
      amount: signedAmount,
      category: category || DEFAULT_CATEGORY,
    };

    try {
      setSubmitting(true);
      await onAdd(newTransaction);
      // Limpiar formulario después de añadir
      setText('');
      setAmount('');
      setType('expense');
      setCategory(DEFAULT_CATEGORY);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <h2 className="text-sm font-semibold tracking-wide text-slate-300 uppercase mb-3">
        Agregar transacción
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 bg-slate-900/80 border border-slate-800 rounded-xl p-4"
      >
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Descripción</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-lg bg-slate-950/60 border border-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder="Ej: Cena con amigos"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-400">
              Monto (siempre positivo)
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg bg-slate-950/60 border border-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="Ej: 50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Tipo</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 text-xs px-2 py-2 rounded-lg border ${
                  type === 'income'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-100'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300'
                }`}
              >
                Ingreso
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 text-xs px-2 py-2 rounded-lg border ${
                  type === 'expense'
                    ? 'border-rose-500 bg-rose-500/20 text-rose-100'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300'
                }`}
              >
                Gasto
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">Categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg bg-slate-950/60 border border-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 text-sm font-medium px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Guardando...' : 'Agregar transacción'}
        </button>
      </form>
    </section>
  );
}

export default AddTransaction;

