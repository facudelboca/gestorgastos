import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function TransactionsView() {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [txPage, setTxPage] = useState(0);
  const [txTotalPages, setTxTotalPages] = useState(1);

  // Filters
  const [filterAcc, setFilterAcc] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  const fetchFiltersData = async () => {
    try {
      const accData = await api.accounts.getAccounts();
      setAccounts(accData);

      const catData = await api.categories.getCategories();
      setCategories(catData);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransactionsList = async () => {
    try {
      const data = await api.transactions.getTransactions({
        page: txPage,
        size: 8,
        accountId: filterAcc || null,
        categoryId: filterCat || null,
        startDate: filterStart || null,
        endDate: filterEnd || null
      });
      setTransactions(data.content || []);
      setTxTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error al filtrar transacciones', err);
    }
  };

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchTransactionsList();
  }, [filterAcc, filterCat, filterStart, filterEnd, txPage]);

  return (
    <div className="glass-card animate-fade-in">
      <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', fontWeight: '700' }}>
        📜 Historial de Movimientos
      </h2>

      {/* FILTROS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div style={{ flex: '1', minWidth: '150px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Cuenta</label>
          <select className="glass-input" value={filterAcc} onChange={e => { setFilterAcc(e.target.value); setTxPage(0); }}>
            <option value="">Todas</option>
            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
          </select>
        </div>
        <div style={{ flex: '1', minWidth: '150px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Categoría</label>
          <select className="glass-input" value={filterCat} onChange={e => { setFilterCat(e.target.value); setTxPage(0); }}>
            <option value="">Todas</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <div style={{ flex: '1', minWidth: '150px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Fecha Inicio</label>
          <input type="date" className="glass-input" value={filterStart} onChange={e => { setFilterStart(e.target.value); setTxPage(0); }} />
        </div>
        <div style={{ flex: '1', minWidth: '150px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Fecha Fin</label>
          <input type="date" className="glass-input" value={filterEnd} onChange={e => { setFilterEnd(e.target.value); setTxPage(0); }} />
        </div>
      </div>

      {/* LISTADO */}
      {transactions.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px', fontSize: '0.9rem' }}>
          No se encontraron movimientos registrados para los filtros seleccionados.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {transactions.map(tx => (
            <div key={tx.id} className="list-item" style={{ margin: '0' }}>
              <div>
                <strong style={{ fontSize: '0.9rem' }}>{tx.description || 'Movimiento'}</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Cuenta: {tx.accountName} | Categoría: {tx.categoryName} | Fecha: {new Date(tx.transactionDate).toLocaleDateString()}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${tx.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`} style={{ fontSize: '0.85rem' }}>
                  {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          ))}

          {/* PAGINACIÓN */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <button 
              onClick={() => setTxPage(p => Math.max(0, p - 1))} 
              disabled={txPage === 0} 
              className="btn-secondary" 
              style={{ padding: '6px 12px', opacity: txPage === 0 ? '0.5' : '1', cursor: txPage === 0 ? 'not-allowed' : 'pointer' }}
            >
              Anterior
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Página {txPage + 1} de {txTotalPages}</span>
            <button 
              onClick={() => setTxPage(p => Math.min(txTotalPages - 1, p + 1))} 
              disabled={txPage >= txTotalPages - 1} 
              className="btn-secondary" 
              style={{ padding: '6px 12px', opacity: txPage >= txTotalPages - 1 ? '0.5' : '1', cursor: txPage >= txTotalPages - 1 ? 'not-allowed' : 'pointer' }}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
