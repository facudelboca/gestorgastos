import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit } from 'lucide-react';

const CategoriesPage = ({ token, onChange }) => {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/v1/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      setError('Error al cargar categorías');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const res = await axios.post('http://localhost:5000/api/v1/categories', { name: newName.trim() }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories((c) => [...c, res.data]);
      onChange && onChange();
      setNewName('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear la categoría');
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditingName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const submitEdit = async () => {
    if (!editingName.trim()) return;
    try {
      await axios.put(`http://localhost:5000/api/v1/categories/${editingId}`, { name: editingName.trim() }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories((c) => c.map(x => x._id === editingId ? { ...x, name: editingName.trim() } : x));
      onChange && onChange();
      cancelEdit();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo actualizar la categoría');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar categoría? Esto no afecta transacciones existentes.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories((c) => c.filter(x => x._id !== id));
      onChange && onChange();
    } catch (err) {
      setError('No se pudo eliminar la categoría');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold">Categorías</h2>
      {error && <div className="text-rose-500">{error}</div>}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nueva categoría"
          className="flex-1 border rounded px-3 py-2"
        />
        <button className="bg-emerald-500 text-white px-4 py-2 rounded flex items-center gap-1">
          <Plus size={16} /> Agregar
        </button>
      </form>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <ul className="divide-y">
          {categories.map((cat) => (
            <li key={cat._id} className="py-2 flex items-center justify-between">
              {editingId === cat._id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="border rounded px-2 py-1 flex-1"
                  />
                  <button onClick={submitEdit} className="text-emerald-500">Guardar</button>
                  <button onClick={cancelEdit} className="text-slate-400">Cancelar</button>
                </div>
              ) : (
                <>
                  <span>{cat.name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(cat)} className="text-slate-500 hover:text-slate-800">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(cat._id)} className="text-rose-500 hover:text-rose-800">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoriesPage;
