import React, { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Transaction, Goal, Category, View, Budget, Correction, IncomeSource } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionsList from './components/TransactionsList';
import Goals from './components/Goals';
import Reports from './components/Reports';
import AddTransactionModal from './components/AddTransactionModal';
import EditTransactionModal from './components/EditTransactionModal';
import BudgetView from './components/Budget';
import Settings from './components/Settings';
import { Plus } from 'lucide-react';
import { getCategoryFromGemini } from './services/geminiService';
import { useTheme } from './hooks/useTheme';

const DEFAULT_CATEGORIES: Category[] = [
    { id: 'cat1', name: 'Groceries', color: '#FFB86C', isDefault: true },
    { id: 'cat2', name: 'Utilities', color: '#FF79C6', isDefault: true },
    { id: 'cat3', name: 'Transport', color: '#8BE9FD', isDefault: true },
    { id: 'cat4', name: 'Entertainment', color: '#50FA7B', isDefault: true },
    { id: 'cat5', name: 'Health', color: '#FF5555', isDefault: true },
    { id: 'cat6', name: 'Shopping', color: '#BD93F9', isDefault: true },
    { id: 'cat7', name: 'Income', color: '#F1FA8C', isDefault: true },
    { id: 'cat8', name: 'Other', color: '#6272A4', isDefault: true },
];

const DEFAULT_INCOME_SOURCES: IncomeSource[] = [
    { id: 'is1', name: 'Salary', color: '#50FA7B', isDefault: true },
    { id: 'is2', name: 'Freelance', color: '#8BE9FD', isDefault: true },
    { id: 'is3', name: 'Investments', color: '#BD93F9', isDefault: true },
    { id: 'is4', name: 'Other', color: '#F1FA8C', isDefault: true },
];


const App: React.FC = () => {
    const { theme } = useTheme();
    const [view, setView] = useState<View>('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
    const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
    const [categories, setCategories] = useLocalStorage<Category[]>('categories', DEFAULT_CATEGORIES);
    const [incomeSources, setIncomeSources] = useLocalStorage<IncomeSource[]>('incomeSources', DEFAULT_INCOME_SOURCES);
    const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', []);
    const [corrections, setCorrections] = useLocalStorage<Correction[]>('corrections', []);
    const [isCategorizing, setIsCategorizing] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

    const addTransaction = async (transaction: Omit<Transaction, 'id' | 'category' | 'aiConfidence' | 'incomeSource'>, details: { incomeSourceId?: string }) => {
        if (transaction.type === 'expense') {
            setIsCategorizing(true);
            try {
                const { category: categoryName, confidence } = await getCategoryFromGemini(transaction.description, categories.filter(c => c.name !== 'Income'), corrections);
                const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase()) || categories.find(c => c.name === 'Other');
                
                const newTransaction: Transaction = {
                    ...transaction,
                    id: `txn-${Date.now()}`,
                    category: category || categories.find(c => c.name === 'Other')!,
                    aiConfidence: confidence,
                };
                setTransactions(prev => [newTransaction, ...prev]);
            } catch (error) {
                console.error("Failed to categorize transaction:", error);
                const otherCategory = categories.find(c => c.name === 'Other')!;
                 const newTransaction: Transaction = {
                    ...transaction,
                    id: `txn-${Date.now()}`,
                    category: otherCategory,
                    aiConfidence: 0,
                };
                setTransactions(prev => [newTransaction, ...prev]);
            } finally {
                setIsCategorizing(false);
                setIsModalOpen(false);
            }
        } else { // Income transaction
            const incomeCategory = categories.find(c => c.name === 'Income')!;
            const incomeSource = incomeSources.find(is => is.id === details.incomeSourceId) || incomeSources.find(is => is.name === 'Other');
            const newTransaction: Transaction = {
                ...transaction,
                id: `txn-${Date.now()}`,
                category: incomeCategory,
                incomeSource,
            };
            setTransactions(prev => [newTransaction, ...prev]);
            setIsModalOpen(false);
        }
    };

    const deleteTransaction = (id: string) => {
        setTransactions(transactions.filter(t => t.id !== id));
    };

    const handleOpenEditModal = (transaction: Transaction) => {
        setTransactionToEdit(transaction);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setTransactionToEdit(null);
        setIsEditModalOpen(false);
    };

    const updateTransaction = (updatedTransaction: Transaction) => {
        const originalTransaction = transactions.find(t => t.id === updatedTransaction.id);

        if (originalTransaction && originalTransaction.type === 'expense' && originalTransaction.aiConfidence !== undefined && originalTransaction.category.id !== updatedTransaction.category.id) {
            const newCorrection: Correction = {
                description: updatedTransaction.description,
                correctedCategoryId: updatedTransaction.category.id,
            };
            setCorrections(prev => [...prev.filter(c => c.description !== newCorrection.description), newCorrection]);
        }

        const finalTransaction = { ...updatedTransaction };
        if(finalTransaction.type === 'expense') {
            delete finalTransaction.aiConfidence;
        }

        setTransactions(transactions.map(t => t.id === finalTransaction.id ? finalTransaction : t));
        handleCloseEditModal();
    };
    
    const addGoal = (goal: Omit<Goal, 'id' | 'currentAmount'>) => {
        const newGoal: Goal = {
            ...goal,
            id: `goal-${Date.now()}`,
            currentAmount: 0,
        };
        setGoals(prev => [...prev, newGoal]);
    };
    
    const updateGoal = (id: string, amount: number) => {
        setGoals(goals.map(g => g.id === id ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) } : g));
    };

    const deleteGoal = (id: string) => {
        setGoals(goals.filter(g => g.id !== id));
    };

    const setBudget = (categoryId: string, amount: number) => {
        setBudgets(prev => {
            const existingIndex = prev.findIndex(b => b.categoryId === categoryId);
            
            if (amount <= 0) {
                if (existingIndex > -1) {
                    return prev.filter(b => b.categoryId !== categoryId);
                }
                return prev;
            }
            
            if (existingIndex > -1) {
                const updatedBudgets = [...prev];
                updatedBudgets[existingIndex] = { ...updatedBudgets[existingIndex], amount };
                return updatedBudgets;
            } 
            
            return [...prev, { categoryId, amount }];
        });
    };
    
    // Category Management
    const addCategory = (item: Omit<Category, 'id'>) => {
        const newCategory: Category = { ...item, id: `cat-${Date.now()}` };
        setCategories(prev => [...prev, newCategory]);
    };
    const updateCategory = (id: string, item: Omit<Category, 'id'>) => {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, ...item } : c));
    };
    const deleteCategory = (id: string) => {
        const otherCategory = categories.find(c => c.name === 'Other' && c.isDefault);
        if (!otherCategory || id === otherCategory.id) return; // Cannot delete 'Other'

        // Re-assign transactions
        setTransactions(prev => prev.map(t => {
            if (t.type === 'expense' && t.category.id === id) {
                return { ...t, category: otherCategory };
            }
            return t;
        }));
        
        // Delete budgets associated with the category
        setBudgets(prev => prev.filter(b => b.categoryId !== id));

        // Delete the category
        setCategories(prev => prev.filter(c => c.id !== id));
    };

    // Income Source Management
    const addIncomeSource = (item: Omit<IncomeSource, 'id'>) => {
        const newSource: IncomeSource = { ...item, id: `is-${Date.now()}` };
        setIncomeSources(prev => [...prev, newSource]);
    };
    const updateIncomeSource = (id: string, item: Omit<IncomeSource, 'id'>) => {
        setIncomeSources(prev => prev.map(s => s.id === id ? { ...s, ...item } : s));
    };
    const deleteIncomeSource = (id: string) => {
        const otherSource = incomeSources.find(s => s.name === 'Other' && s.isDefault);
        if (!otherSource || id === otherSource.id) return; // Cannot delete 'Other'

        // Re-assign transactions
        setTransactions(prev => prev.map(t => {
            if (t.type === 'income' && t.incomeSource?.id === id) {
                return { ...t, incomeSource: otherSource };
            }
            return t;
        }));

        // Delete the income source
        setIncomeSources(prev => prev.filter(s => s.id !== id));
    };

    const financialSummary = useMemo(() => {
        const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        const balance = income - expense;
        return { income, expense, balance };
    }, [transactions]);

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <Dashboard summary={financialSummary} transactions={transactions} goals={goals} budgets={budgets} categories={categories} />;
            case 'transactions':
                return <TransactionsList transactions={transactions} deleteTransaction={deleteTransaction} onEditTransaction={handleOpenEditModal} />;
            case 'goals':
                return <Goals goals={goals} addGoal={addGoal} updateGoal={updateGoal} deleteGoal={deleteGoal} balance={financialSummary.balance} />;
            case 'budget':
                return <BudgetView budgets={budgets} setBudget={setBudget} transactions={transactions} categories={categories} />;
            case 'reports':
                return <Reports transactions={transactions} />;
            case 'settings':
                return <Settings 
                            categories={categories}
                            incomeSources={incomeSources}
                            addCategory={addCategory}
                            updateCategory={updateCategory}
                            deleteCategory={deleteCategory}
                            addIncomeSource={addIncomeSource}
                            updateIncomeSource={updateIncomeSource}
                            deleteIncomeSource={deleteIncomeSource}
                        />;
            default:
                return <Dashboard summary={financialSummary} transactions={transactions} goals={goals} budgets={budgets} categories={categories} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-brand-primary font-sans text-gray-800 dark:text-brand-text">
            <Header activeView={view} setView={setView} />
            <main className="p-4 md:p-8 pt-20 md:pt-24 max-w-7xl mx-auto">
                {renderView()}
            </main>
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-20 right-6 md:bottom-10 md:right-10 bg-brand-accent hover:bg-brand-accent-hover text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-brand-primary focus:ring-brand-accent"
                aria-label="Add Transaction"
            >
                <Plus size={28} />
            </button>
            {isModalOpen && (
                <AddTransactionModal
                    onClose={() => setIsModalOpen(false)}
                    onAddTransaction={addTransaction}
                    categories={categories}
                    incomeSources={incomeSources}
                    isCategorizing={isCategorizing}
                />
            )}
            {isEditModalOpen && transactionToEdit && (
                <EditTransactionModal
                    onClose={handleCloseEditModal}
                    onUpdateTransaction={updateTransaction}
                    transaction={transactionToEdit}
                    categories={categories}
                    incomeSources={incomeSources}
                />
            )}
        </div>
    );
};

export default App;