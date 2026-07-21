import React, { useState, useEffect, useCallback } from 'react';
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

  const fetchFiltersData = useCallback(async () => {
    try {
      const accData = await api.accounts.getAccounts();
      setAccounts(accData);

      const catData = await api.categories.getCategories();
      setCategories(catData);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchTransactionsList = useCallback(async () => {
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
  }, [txPage, filterAcc, filterCat, filterStart, filterEnd]);

  useEffect(() => {
    fetchFiltersData();
  }, [fetchFiltersData]);

  useEffect(() => {
    fetchTransactionsList();
  }, [fetchTransactionsList]);

  const handleDownloadPdf = async () => {
    try {
      const blob = await api.reports.downloadPdf();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte_transacciones.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar PDF:', err);
      alert('Error al descargar el PDF de transacciones');
    }
  };

  const handleDownloadCsv = async () => {
    try {
      const blob = await api.reports.downloadCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte_transacciones.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar CSV:', err);
      alert('Error al descargar el CSV de transacciones');
    }
  };

  return (
    <div className="glass-card animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
          📜 Historial de Movimientos
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handleDownloadPdf} 
            className="btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            📄 PDF
          </button>
          <button 
            onClick={handleDownloadCsv} 
            className="btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            📊 CSV
          </button>
        </div>
      </div>

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
