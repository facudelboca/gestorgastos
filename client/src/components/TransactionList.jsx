
import { useState } from 'react';
import { MoreHorizontal, Edit2, Trash2, Check, X, Tag } from 'lucide-react';

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
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3 w-1/3">Payee / Description</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {transactions.map((t) => {
            const isEditing = editingId === t._id;
            const positive = t.amount > 0;
            const dateStr = t.date ? new Date(t.date).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }) : '-';

            if (isEditing) {
              return (
                <tr key={t._id} className="bg-slate-50 dark:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={editData.date}
                      onChange={(e) => handleEditChange('date', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editData.text}
                      onChange={(e) => handleEditChange('text', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm"
                      placeholder="Description"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editData.category}
                      onChange={(e) => handleEditChange('category', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm"
                      placeholder="Category"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      value={editData.amount}
                      onChange={(e) => handleEditChange('amount', parseFloat(e.target.value))}
                      className="w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm text-right ml-auto"
                      placeholder="Amount"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEditSave(t._id)} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded">
                        <Check size={16} />
                      </button>
                      <button onClick={handleEditCancel} className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }

            return (
              <tr key={t._id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                  {dateStr}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {t.text}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <Tag size={12} />
                    {t.category || 'Uncategorized'}
                  </span>
                </td>
                <td className={`px-4 py-3 text-right font-mono font-medium ${positive ? 'text-emerald-600' : 'text-slate-900 dark:text-slate-100'}`}>
                  {positive ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right relative">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditStart(t)}
                      className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(t._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionList;
