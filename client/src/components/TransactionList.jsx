import React, { useState } from 'react';
import { MoreHorizontal, Edit2, Trash2, Check, X, Tag } from 'lucide-react';
import { displayFromISO } from '../utils/date';

export default function TransactionList({ transactions = [], onDelete, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const startEdit = (t) => {
    setEditingId(t._id);
    setEditData({
      text: t.text,
      amount: t.amount,
      category: t.category,
      date: t.date ? displayFromISO(t.date, 'en-CA') : '', // yyyy-mm-dd for input
    });
  };

  const saveEdit = async (id) => {
    if (onUpdate) await onUpdate(id, { ...editData });
    setEditingId(null);
    setEditData({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3 w-1/3">Descripción</th>
            <th className="px-4 py-3">Categoría</th>
            <th className="px-4 py-3 text-right">Monto</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {transactions.map((t) => {
            const isEditing = editingId === t._id;
            const positive = t.amount > 0;
            const dateStr = t.date ? displayFromISO(t.date, 'es-ES') : '-';

            if (isEditing) {
              return (
                <tr key={t._id} className="bg-slate-50 dark:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <input type="date" value={editData.date} onChange={(e) => setEditData({ ...editData, date: e.target.value })} className="w-full" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="text" value={editData.text} onChange={(e) => setEditData({ ...editData, text: e.target.value })} className="w-full" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="text" value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })} className="w-full" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input type="number" step="0.01" value={editData.amount} onChange={(e) => setEditData({ ...editData, amount: Number(e.target.value) })} className="w-32 text-right" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => saveEdit(t._id)} className="p-1 text-emerald-500"><Check size={16} /></button>
                      <button onClick={cancelEdit} className="p-1 text-slate-400"><X size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            }

            return (
              <tr key={t._id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{dateStr}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-slate-100">{t.text}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <Tag size={12} /> {t.category || 'Sin categoría'}
                  </span>
                </td>
                <td className={`px-4 py-3 text-right font-mono font-medium ${positive ? 'text-emerald-600' : 'text-slate-900 dark:text-slate-100'}`}>
                  {positive ? '+' : ''}{Math.abs(t.amount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </td>
                <td className="px-4 py-3 text-right relative">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(t)} className="p-1.5 text-slate-400 hover:text-blue-500"><Edit2 size={16} /></button>
                    <button onClick={() => onDelete && onDelete(t._id)} className="p-1.5 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
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
