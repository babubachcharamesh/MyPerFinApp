import React, { useState } from 'react';
import type { Transaction, Category, IncomeSource } from '../types';

interface AddTransactionModalProps {
    onClose: () => void;
    onAddTransaction: (transaction: Omit<Transaction, 'id' | 'category' | 'aiConfidence' | 'incomeSource'>, details: { incomeSourceId?: string }) => void;
    categories: Category[];
    incomeSources: IncomeSource[];
    isCategorizing: boolean;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose, onAddTransaction, categories, incomeSources, isCategorizing }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [incomeSourceId, setIncomeSourceId] = useState(incomeSources[0]?.id || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description && amount && date) {
            onAddTransaction({
                description,
                amount: parseFloat(amount),
                date,
                type,
            }, { incomeSourceId: type === 'income' ? incomeSourceId : undefined });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-brand-secondary rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Add New Transaction</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Type</label>
                        <div className="flex space-x-2">
                            <button type="button" onClick={() => setType('expense')} className={`w-full py-2 rounded-lg font-semibold ${type === 'expense' ? 'bg-brand-danger text-white' : 'bg-gray-200 dark:bg-brand-primary text-gray-700 dark:text-gray-300'}`}>Expense</button>
                            <button type="button" onClick={() => setType('income')} className={`w-full py-2 rounded-lg font-semibold ${type === 'income' ? 'bg-brand-success text-white' : 'bg-gray-200 dark:bg-brand-primary text-gray-700 dark:text-gray-300'}`}>Income</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Description</label>
                        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Coffee with friends" className="w-full bg-gray-100 dark:bg-brand-primary border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-white focus:ring-brand-accent focus:border-brand-accent" required/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Amount</label>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-gray-100 dark:bg-brand-primary border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-white focus:ring-brand-accent focus:border-brand-accent" required/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-100 dark:bg-brand-primary border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-white focus:ring-brand-accent focus:border-brand-accent" required/>
                    </div>
                    {type === 'income' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Income Source</label>
                            <select value={incomeSourceId} onChange={(e) => setIncomeSourceId(e.target.value)} className="w-full bg-gray-100 dark:bg-brand-primary border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-white focus:ring-brand-accent focus:border-brand-accent" required>
                                {incomeSources.map(source => (
                                    <option key={source.id} value={source.id}>{source.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold">Cancel</button>
                        <button type="submit" disabled={isCategorizing} className="px-4 py-2 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-white font-semibold disabled:opacity-50 disabled:cursor-wait">
                            {isCategorizing ? 'AI Categorizing...' : 'Add Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTransactionModal;