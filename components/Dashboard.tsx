import React, { useState, useMemo } from 'react';
import type { Transaction, Goal, Budget, Category } from '../types';
import { DollarSign, TrendingUp, TrendingDown, CheckCircle, Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Bar, XAxis, YAxis, CartesianGrid, ComposedChart } from 'recharts';
import { getFinancialInsights } from '../services/geminiService';
import { useTheme } from '../hooks/useTheme';

interface DashboardProps {
    summary: { income: number; expense: number; balance: number };
    transactions: Transaction[];
    goals: Goal[];
    budgets: Budget[];
    categories: Category[];
}

const StatCard: React.FC<{ title: string; amount: number; icon: React.ReactNode; color: string }> = ({ title, amount, icon, color }) => (
    <div className="bg-white dark:bg-brand-secondary p-6 rounded-xl shadow-lg flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </p>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ summary, transactions, goals, budgets, categories }) => {
    const { theme } = useTheme();
    const [insights, setInsights] = useState<string[]>([]);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);

    const isDark = theme === 'dark';
    const textColor = isDark ? '#F8F8F2' : '#1F2937'; // gray-800
    const gridColor = isDark ? '#44475A' : '#E5E7EB'; // gray-200
    const tooltipBg = isDark ? '#27293D' : '#FFFFFF';
    const tooltipBorder = isDark ? '#27293D' : '#E5E7EB';

    const handleGetInsights = async () => {
        setIsLoadingInsights(true);
        const newInsights = await getFinancialInsights(transactions);
        setInsights(newInsights);
        setIsLoadingInsights(false);
    };

    const expenseData = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            const existing = acc.find(item => item.name === t.category.name);
            if (existing) {
                existing.value += t.amount;
            } else {
                acc.push({ name: t.category.name, value: t.amount, color: t.category.color });
            }
            return acc;
        }, [] as { name: string; value: number; color: string }[]);

    const incomeData = transactions
        .filter(t => t.type === 'income' && t.incomeSource)
        .reduce((acc, t) => {
            const sourceName = t.incomeSource!.name;
            const existing = acc.find(item => item.name === sourceName);
            if (existing) {
                existing.value += t.amount;
            } else {
                acc.push({ name: sourceName, value: t.amount, color: t.incomeSource!.color });
            }
            return acc;
        }, [] as { name: string; value: number; color: string }[]);

    const recentTransactions = transactions.slice(0, 5);

    const monthlyData = transactions.reduce((acc, t) => {
        const month = new Date(t.date).toLocaleString('default', { month: 'short' });
        if (!acc[month]) {
            acc[month] = { name: month, income: 0, expense: 0 };
        }
        if (t.type === 'income') acc[month].income += t.amount;
        else acc[month].expense += t.amount;
        return acc;
    }, {} as { [key: string]: { name: string; income: number; expense: number } });

    const chartMonthlyData = Object.values(monthlyData).reverse();

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const totalGoalProgress = useMemo(() => {
        if (goals.length === 0) {
            return { totalCurrent: 0, totalTarget: 0, overallProgress: 0 };
        }
        const totalCurrent = goals.reduce((acc, goal) => acc + goal.currentAmount, 0);
        const totalTarget = goals.reduce((acc, goal) => acc + goal.targetAmount, 0);
        const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
        return { totalCurrent, totalTarget, overallProgress };
    }, [goals]);

    const budgetStatus = budgets.map(budget => {
        const category = categories.find(c => c.id === budget.categoryId);
        if (!category) return null;

        const spent = transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return t.type === 'expense' &&
                       t.category.id === budget.categoryId &&
                       transactionDate.getMonth() === currentMonth &&
                       transactionDate.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + t.amount, 0);
        
        const progress = (spent / budget.amount) * 100;
        return {
            name: category.name,
            spent,
            budget: budget.amount,
            progress: Math.min(progress, 100),
            isOver: progress > 100,
            progressRaw: progress,
        };
    }).filter((b): b is NonNullable<typeof b> => b !== null)
      .sort((a, b) => b.progressRaw - a.progressRaw);

    const getProgressColor = (progress: number) => {
        if (progress > 100) return 'bg-brand-danger';
        if (progress > 80) return 'bg-yellow-500';
        return 'bg-brand-accent';
    };


    return (
        <div className="space-y-8 pb-16 md:pb-0">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Balance" amount={summary.balance} icon={<DollarSign />} color="bg-blue-500/20 text-blue-400" />
                <StatCard title="Total Income" amount={summary.income} icon={<TrendingUp />} color="bg-brand-success/20 text-brand-success" />
                <StatCard title="Total Expense" amount={summary.expense} icon={<TrendingDown />} color="bg-brand-danger/20 text-brand-danger" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Charts & AI Insights */}
                <div className="lg:col-span-1 space-y-6">
                     <div className="bg-white dark:bg-brand-secondary p-6 rounded-xl shadow-lg">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Income Breakdown</h3>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={incomeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false}>
                                        {incomeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px' }} />
                                    <Legend wrapperStyle={{color: textColor}}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                     <div className="bg-white dark:bg-brand-secondary p-6 rounded-xl shadow-lg">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Expense Breakdown</h3>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false}>
                                        {expenseData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px' }} />
                                    <Legend wrapperStyle={{color: textColor}}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                     {goals.length > 0 && (
                        <div className="bg-white dark:bg-brand-secondary p-6 rounded-xl shadow-lg">
                            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center space-x-2">
                                <Target size={20} className="text-brand-text-secondary" />
                                <span>Overall Goal Progress</span>
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center font-semibold text-gray-800 dark:text-gray-100">
                                    <span>{totalGoalProgress.overallProgress.toFixed(1)}%</span>
                                    <span className="text-sm">
                                        {totalGoalProgress.totalCurrent.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                                        <span className="text-gray-500 dark:text-gray-400"> / {totalGoalProgress.totalTarget.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</span>
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-brand-primary rounded-full h-4">
                                    <div 
                                        className="bg-brand-text-secondary h-4 rounded-full transition-all duration-500" 
                                        style={{ width: `${totalGoalProgress.overallProgress}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                                    You're on your way to achieving your financial goals!
                                </p>
                            </div>
                        </div>
                    )}
                    {budgets.length > 0 && (
                        <div className="bg-white dark:bg-brand-secondary p-6 rounded-xl shadow-lg">
                            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Budget Status</h3>
                            <div className="space-y-4">
                                {budgetStatus.slice(0, 3).map(b => (
                                    <div key={b.name}>
                                        <div className="flex justify-between items-center mb-1 text-sm">
                                            <span className="font-medium">{b.name}</span>
                                            <span className={`font-semibold ${b.isOver ? 'text-brand-danger' : 'text-gray-600 dark:text-gray-300'}`}>
                                                {b.spent.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })} / {b.budget.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-brand-primary rounded-full h-2">
                                            <div className={`${getProgressColor(b.progressRaw)} h-2 rounded-full`} style={{ width: `${b.progress}%` }}></div>
                                        </div>
                                        {b.isOver && <p className="text-xs text-brand-danger mt-1 text-right">You've exceeded your budget!</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                     <div className="bg-white dark:bg-brand-secondary p-6 rounded-xl shadow-lg">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">AI Financial Advisor</h3>
                        <button onClick={handleGetInsights} disabled={isLoadingInsights} className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoadingInsights ? 'Analyzing...' : 'Get Insights'}
                        </button>
                        {insights.length > 0 && (
                            <ul className="mt-4 space-y-3 text-sm">
                                {insights.map((insight, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                        <CheckCircle className="text-brand-success mt-1 flex-shrink-0" size={16} />
                                        <span>{insight}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Cash Flow and Recent Transactions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-brand-secondary p-6 rounded-xl shadow-lg">
                         <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Cash Flow</h3>
                         <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <ComposedChart data={chartMonthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                    <XAxis dataKey="name" stroke={textColor} />
                                    <YAxis stroke={textColor} />
                                    <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px' }} />
                                    <Legend wrapperStyle={{color: textColor}}/>
                                    <Bar dataKey="income" fill="#50FA7B" name="Income" />
                                    <Bar dataKey="expense" fill="#FF5555" name="Expense" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-brand-secondary p-6 rounded-xl shadow-lg">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Recent Transactions</h3>
                         <ul className="space-y-4">
                            {recentTransactions.map(t => (
                                <li key={t.id} className="flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 rounded-full" style={{ backgroundColor: `${(t.type === 'income' ? t.incomeSource?.color : t.category.color) || '#808080'}30` }}>
                                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: (t.type === 'income' ? t.incomeSource?.color : t.category.color) || '#808080' }}></div>
                                        </div>
                                        <div>
                                            <p className="font-semibold">{t.description}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{(t.type === 'income' ? t.incomeSource?.name : t.category.name)} - {new Date(t.date).toLocaleDateString()}</p>

                                        </div>
                                    </div>
                                    <p className={`font-bold ${t.type === 'income' ? 'text-brand-success' : 'text-brand-danger'}`}>
                                        {t.type === 'income' ? '+' : '-'}
                                        {t.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;