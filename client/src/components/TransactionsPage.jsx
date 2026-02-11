
import React, { useState } from 'react';
import AddTransaction from './AddTransaction';
import Filters from './Filters';
import TransactionList from './TransactionList';
import Pagination from './Pagination';
import ExportData from './ExportData';
import { Plus, Filter, Download } from 'lucide-react';

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {/* Header is handled in Layout, but we can add specific controls here */}
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowAddModal(!showAddModal)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm shadow-emerald-500/20"
          >
            <Plus size={18} />
            Add Transaction
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${showFilters
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
          >
            <Filter size={18} />
            Filters
          </button>
          <div className="hidden sm:block">
            <ExportData transactions={transactions} />
          </div>
        </div>
      </div>

      {/* Expandable Sections */}
      {showAddModal && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">New Transaction</h3>
            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">Cancel</button>
          </div>
          <AddTransaction onAdd={(data) => { onAdd(data); setShowAddModal(false); }} />
        </div>
      )}

      {showFilters && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 animate-in slide-in-from-top-4 fade-in duration-200">
          <Filters filters={filters} onFiltersChange={onFiltersChange} />
        </div>
      )}

      {/* Transactions Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400">No transactions found.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-emerald-500 font-medium mt-2 hover:underline"
            >
              Create your first transaction
            </button>
          </div>
        ) : (
          <>
            <TransactionList
              transactions={transactions}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />

            <div className="border-t border-slate-100 dark:border-slate-800 p-4">
              <Pagination
                pagination={pagination}
                onPageChange={onPageChange}
                onLimitChange={onLimitChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
