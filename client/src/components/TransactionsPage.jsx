import React from 'react';
import AddTransaction from './AddTransaction';
import Filters from './Filters';
import TransactionList from './TransactionList';
import Pagination from './Pagination';
import ExportData from './ExportData';

const TransactionsPage = ({
  transactions,
  filters,
  onFiltersChange,
  onAdd,
  onDelete,
  onUpdate,
  pagination,
  onPageChange,
  onLimitChange,
  loading,
}) => {
  return (
    <div className="space-y-6">
      {/* Add Transaction Form */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          ➕ Nueva Transacción
        </h2>
        <AddTransaction onAdd={onAdd} />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          🔍 Filtros
        </h2>
        <Filters filters={filters} onFiltersChange={onFiltersChange} />
      </div>

      {/* Export Buttons */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          📥 Descargar Datos
        </h3>
        <ExportData transactions={transactions} />
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          📋 Transacciones ({pagination.total})
        </h2>

        {loading ? (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400">
            Cargando transacciones...
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400">
            No hay transacciones. ¡Crea una nueva!
          </div>
        ) : (
          <>
            <TransactionList
              transactions={transactions}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />

            <Pagination
              pagination={pagination}
              onPageChange={onPageChange}
              onLimitChange={onLimitChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
