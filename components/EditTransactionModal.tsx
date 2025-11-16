import React, { useState, useEffect } from 'react';
import type { Transaction, Category, IncomeSource } from '../types';

interface EditTransactionModalProps {
    onClose: () => void;
    onUpdateTransaction: (transaction: Transaction) => void;
    transaction: Transaction;
    categories: Category[];
    incomeSources: IncomeSource[];
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ onClose, onUpdateTransaction, transaction, categories, incomeSources }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [categoryId, setCategoryId] = useState('');
    const [incomeSourceId, setIncomeSourceId] = useState('');


    useEffect(() => {
        if (transaction) {
            setDescription(transaction.description);
            setAmount(String(transaction.amount));
            setDate(transaction.date.split('T')[0]);
            setType(transaction.type);
            if (transaction.type === 'expense') {
                setCategoryId(transaction.category.id);
            } else {
                setIncomeSourceId(transaction.incomeSource?.id || '');
            }
        }
    }, [transaction]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if(type === 'expense') {
            const selectedCategory = categories.find(c => c.id === categoryId);
            if (description && amount && date && selectedCategory) {
                onUpdateTransaction({
                    ...transaction,
                    description,
                    amount: parseFloat(amount),
                    date,
                    type,
                    category: selectedCategory,
                });
            }
        } else { // income
            const selectedIncomeSource = incomeSources.find(i => i.id === incomeSourceId);
             const incomeCategory = categories.find(c => c.name === 'Income')!;
            if (description && amount && date && selectedIncomeSource) {
                onUpdateTransaction({
                    ...transaction,
                    description,
                    amount: parseFloat(amount),
                    date,
                    type,
                    category: incomeCategory,
                    incomeSource: selectedIncomeSource,
                });
            }
        }
    };

    if (!transaction) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-brand-secondary rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Edit Transaction</h2>
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
                    { type === 'expense' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Category</label>
                            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-gray-100 dark:bg-brand-primary border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-white focus:ring-brand-accent focus:border-brand-accent" required>
                                {categories.filter(c => c.name !== 'Income').map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
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
                        <button type="submit" className="px-4 py-2 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-white font-semibold">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTransactionModal;