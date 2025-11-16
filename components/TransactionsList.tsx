import React from 'react';
import type { Transaction } from '../types';
import { Trash2, TrendingDown, TrendingUp, Pencil } from 'lucide-react';

interface TransactionsListProps {
    transactions: Transaction[];
    deleteTransaction: (id: string) => void;
    onEditTransaction: (transaction: Transaction) => void;
}

const AiConfidenceIndicator: React.FC<{ confidence: number }> = ({ confidence }) => {
    const getConfidenceColor = () => {
        if (confidence > 0.8) return 'bg-brand-success'; // High confidence
        if (confidence > 0.5) return 'bg-yellow-500'; // Medium confidence
        return 'bg-brand-danger'; // Low confidence
    };

    return (
        <div className="group relative inline-block ml-2">
            <div className={`w-2.5 h-2.5 rounded-full ${getConfidenceColor()}`}></div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-brand-primary text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                AI Suggestion Confidence: {Math.round(confidence * 100)}%
            </div>
        </div>
    );
};


const TransactionsList: React.FC<TransactionsListProps> = ({ transactions, deleteTransaction, onEditTransaction }) => {
    const getTransactionLabel = (t: Transaction) => {
        return t.type === 'income' ? t.incomeSource?.name || 'Income' : t.category.name;
    }
    const getTransactionColor = (t: Transaction) => {
        return t.type === 'income' ? t.incomeSource?.color || t.category.color : t.category.color;
    }

    return (
        <div className="bg-white dark:bg-brand-secondary p-4 md:p-6 rounded-xl shadow-lg pb-20 md:pb-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">All Transactions</h2>
            {transactions.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-10">No transactions yet. Add one to get started!</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400">Description</th>
                                <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 hidden md:table-cell">Category / Source</th>
                                <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 hidden md:table-cell">Date</th>
                                <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-right">Amount</th>
                                <th className="p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-brand-primary">
                                    <td className="p-3">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-brand-success/20 text-brand-success' : 'bg-brand-danger/20 text-brand-danger'}`}>
                                                {t.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                            </div>
                                            <div>
                                               <p className="font-semibold text-gray-800 dark:text-gray-100">{t.description}</p>
                                               <p className="text-xs text-gray-500 dark:text-gray-400 md:hidden flex items-center">
                                                   {getTransactionLabel(t)}
                                                   {t.type === 'expense' && t.aiConfidence !== undefined && <AiConfidenceIndicator confidence={t.aiConfidence} />}
                                                   <span className="mx-1">-</span>
                                                   {new Date(t.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 hidden md:table-cell">
                                        <div className="flex items-center">
                                            <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: `${getTransactionColor(t)}30`, color: getTransactionColor(t) }}>
                                                {getTransactionLabel(t)}
                                            </span>
                                            {t.type === 'expense' && t.aiConfidence !== undefined && <AiConfidenceIndicator confidence={t.aiConfidence} />}
                                        </div>
                                    </td>
                                    <td className="p-3 text-gray-600 dark:text-gray-300 hidden md:table-cell">{new Date(t.date).toLocaleDateString()}</td>
                                    <td className={`p-3 font-bold text-right ${t.type === 'income' ? 'text-brand-success' : 'text-brand-danger'}`}>
                                        {t.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button onClick={() => onEditTransaction(t)} className="text-gray-500 hover:text-brand-accent dark:hover:text-brand-text-secondary p-2 rounded-full transition-colors" aria-label="Edit transaction">
                                                <Pencil size={18} />
                                            </button>
                                            <button onClick={() => deleteTransaction(t.id)} className="text-gray-500 hover:text-brand-danger p-2 rounded-full transition-colors" aria-label="Delete transaction">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TransactionsList;