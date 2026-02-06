import { useState } from 'react';

function TransactionList({ transactions, onDelete, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleEditStart = (transaction) => {
    setEditingId(transaction._id);
    setEditData({
      text: transaction.text,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date ? transaction.date.split('T')[0] : '',
    });
  };

  const handleEditChange = (field, value) => {
    setEditData({
      ...editData,
      [field]: value,
    });
  };

  const handleEditSave = async (id) => {
    await onUpdate(id, editData);
    setEditingId(null);
    setEditData({});
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditData({});
  };

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
          const isEditing = editingId === t._id;

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

          if (isEditing) {
            return (
              <div
                key={t._id}
                className="rounded-lg border border-blue-600/50 bg-slate-900/80 p-3 text-sm"
              >
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editData.text}
                    onChange={(e) => handleEditChange('text', e.target.value)}
                    placeholder="Descripción"
                    className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      value={editData.amount}
                      onChange={(e) =>
                        handleEditChange('amount', parseFloat(e.target.value))
                      }
                      placeholder="Monto"
                      className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={editData.category}
                      onChange={(e) => handleEditChange('category', e.target.value)}
                      placeholder="Categoría"
                      className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={editData.date}
                      onChange={(e) => handleEditChange('date', e.target.value)}
                      className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSave(t._id)}
                      className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition"
                    >
                      ✓ Guardar
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="flex-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs font-semibold transition"
                    >
                      ✕ Cancelar
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={t._id}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col flex-1">
                <span className="font-medium text-slate-100">{t.text}</span>
                <div className="flex gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {t.category}
                  </span>
                  {dateStr && <span>{dateStr}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <span
                  className={`font-semibold ${
                    positive ? 'text-emerald-300' : 'text-rose-300'
                  }`}
                >
                  {positive ? '+' : ''}
                  {amountFormatted}
                </span>
                <button
                  onClick={() => handleEditStart(t)}
                  className="text-xs px-2 py-1 rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-blue-300 transition-colors"
                >
                  ✎ Editar
                </button>
                <button
                  onClick={() => onDelete(t._id)}
                  className="text-xs px-2 py-1 rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-rose-300 transition-colors"
                >
                  🗑 Eliminar
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

