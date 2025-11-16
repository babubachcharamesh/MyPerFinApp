
import React, { useMemo, useState } from 'react';
import type { Budget, Category, Transaction } from '../types';
import { AlertTriangle, BadgeCheck, PiggyBank } from 'lucide-react';

interface BudgetProps {
    budgets: Budget[];
    setBudget: (categoryId: string, amount: number) => void;
    transactions: Transaction[];
    categories: Category[];
}

interface BudgetEntryProps {
    category: Category;
    budgetAmount: number;
    spentAmount: number;
    onBudgetChange: (categoryId: string, amount: number) => void;
}

const BudgetEntry: React.FC<BudgetEntryProps> = ({ category, budgetAmount, spentAmount, onBudgetChange }) => {
    const [inputValue, setInputValue] = useState(budgetAmount > 0 ? String(budgetAmount) : '');

    const handleBlur = () => {
        const amount = parseFloat(inputValue);
        onBudgetChange(category.id, isNaN(amount) ? 0 : amount);
    };

    const progress = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
    const progressCapped = Math.min(progress, 100);

    const getProgressColor = () => {
        if (progress > 100) return 'bg-brand-danger';
        if (progress > 80) return 'bg-yellow-500';
        return 'bg-brand-accent';
    };

    const StatusIcon = () => {
        if (budgetAmount <= 0) return null;
        if (progress > 100) return <AlertTriangle className="text-brand-danger" />;
        if (progress > 80) return <AlertTriangle className="text-yellow-500" />;
        return <BadgeCheck className="text-brand-success" />;
    };

    return (
        <div className="bg-white dark:bg-brand-secondary p-4 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                <div className="flex items-center space-x-3 w-full md:w-1/3">
                    <div className="w-2 h-6 rounded" style={{ backgroundColor: category.color }}></div>
                    <span className="font-bold text-gray-900 dark:text-white">{category.name}</span>
                </div>

                <div className="w-full md:w-1/3">
                    <div className="flex justify-between text-xs mb-1">
                        <span className={`font-semibold ${progress > 100 ? 'text-brand-danger' : 'text-gray-600 dark:text-gray-300'}`}>
                            {spentAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} Spent
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                            of {budgetAmount > 0 ? budgetAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'No Budget'}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-brand-primary rounded-full h-2">
                        <div className={`${getProgressColor()} h-2 rounded-full`} style={{ width: `${progressCapped}%` }}></div>
                    </div>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-1/3 justify-start md:justify-end">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input
                            type="number"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onBlur={handleBlur}
                            placeholder="Set Budget"
                            className="bg-gray-100 dark:bg-brand-primary border border-gray-300 dark:border-gray-600 rounded-md w-32 pl-6 pr-2 py-1.5 text-sm focus:ring-brand-accent focus:border-brand-accent"
                        />
                    </div>
                    <div className="w-6 h-6 flex items-center justify-center">
                        <StatusIcon />
                    </div>
                </div>
            </div>
        </div>
    );
};


const BudgetView: React.FC<BudgetProps> = ({ budgets, setBudget, transactions, categories }) => {

    const monthlySpending = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        return transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return t.type === 'expense' &&
                       transactionDate.getMonth() === currentMonth &&
                       transactionDate.getFullYear() === currentYear;
            })
            .reduce((acc, t) => {
                acc[t.category.id] = (acc[t.category.id] || 0) + t.amount;
                return acc;
            }, {} as { [categoryId: string]: number });
    }, [transactions]);
    
    const expenseCategories = useMemo(() => {
        return categories.filter(c => c.name.toLowerCase() !== 'income');
    }, [categories]);

    return (
        <div className="space-y-8 pb-16 md:pb-0">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                <PiggyBank size={32} className="text-brand-text-secondary" />
                <span>Monthly Budgets</span>
            </h2>

            <div className="space-y-4">
                {expenseCategories.map(category => {
                    const budget = budgets.find(b => b.categoryId === category.id);
                    const spent = monthlySpending[category.id] || 0;
                    return (
                        <BudgetEntry
                            key={category.id}
                            category={category}
                            budgetAmount={budget?.amount || 0}
                            spentAmount={spent}
                            onBudgetChange={setBudget}
                        />
                    );
                })}
            </div>
             {expenseCategories.length === 0 && (
                <div className="text-center py-10 col-span-full bg-white dark:bg-brand-secondary rounded-lg">
                    <PiggyBank size={48} className="mx-auto text-gray-500 dark:text-gray-600" />
                    <p className="mt-4 text-gray-500 dark:text-gray-400">No expense categories found. Add transactions to create categories.</p>
                </div>
            )}
        </div>
    );
};

export default BudgetView;