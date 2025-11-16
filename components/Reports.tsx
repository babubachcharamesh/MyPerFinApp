import React from 'react';
import type { Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useTheme } from '../hooks/useTheme';

interface ReportsProps {
    transactions: Transaction[];
}

const Reports: React.FC<ReportsProps> = ({ transactions }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const textColor = isDark ? '#F8F8F2' : '#1F2937'; // gray-800
    const gridColor = isDark ? '#44475A' : '#E5E7EB'; // gray-200
    const tooltipBg = isDark ? '#27293D' : '#FFFFFF';
    const tooltipBorder = isDark ? '#27293D' : '#E5E7EB';
    
    // Fix: Added explicit type for the accumulator 'acc' to ensure correct type inference for monthlySummary.
    const monthlySummary = transactions.reduce((acc: { [key: string]: { name: string; income: number; expense: number; balance: number } }, t) => {
        const monthYear = new Date(t.date).toISOString().slice(0, 7); // YYYY-MM
        if (!acc[monthYear]) {
            acc[monthYear] = { name: new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' }), income: 0, expense: 0, balance: 0 };
        }
        if (t.type === 'income') {
            acc[monthYear].income += t.amount;
        } else {
            acc[monthYear].expense += t.amount;
        }
        acc[monthYear].balance = acc[monthYear].income - acc[monthYear].expense;
        return acc;
    }, {} as { [key: string]: { name: string; income: number; expense: number; balance: number } });

    const monthlyData = Object.values(monthlySummary).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

    // Fix: Added explicit type for the accumulator 'acc' to ensure correct type inference for cumulativeBalanceData.
    const cumulativeBalanceData = monthlyData.reduce((acc: { name: string; balance: number }[], month, index) => {
        const prevBalance = index > 0 ? acc[index - 1].balance : 0;
        acc.push({ name: month.name, balance: prevBalance + month.balance });
        return acc;
    }, [] as { name: string; balance: number }[]);

    const categorySpending = transactions
        .filter(t => t.type === 'expense')
        // Fix: Added explicit type for the accumulator 'acc' to ensure correct type inference for categorySpending.
        .reduce((acc: { [key: string]: { name: string; total: number; color: string } }, t) => {
            const catName = t.category.name;
            if (!acc[catName]) {
                acc[catName] = { name: catName, total: 0, color: t.category.color };
            }
            acc[catName].total += t.amount;
            return acc;
        }, {} as { [key: string]: { name: string; total: number; color: string } });

    const categoryData = Object.values(categorySpending).sort((a, b) => b.total - a.total);

    const incomeBySource = transactions
        .filter(t => t.type === 'income' && t.incomeSource)
        .reduce((acc: { [key: string]: { name: string; total: number; color: string } }, t) => {
            const sourceName = t.incomeSource!.name;
            if(!acc[sourceName]) {
                 acc[sourceName] = { name: sourceName, total: 0, color: t.incomeSource!.color };
            }
            acc[sourceName].total += t.amount;
            return acc;
        }, {} as { [key: string]: { name: string; total: number; color: string } });
    
    const incomeSourceData = Object.values(incomeBySource).sort((a,b) => b.total - a.total);

    return (
        <div className="space-y-8 pb-16 md:pb-0">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Reports</h2>
            
            <div className="bg-white dark:bg-brand-secondary p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Monthly Income vs Expense</h3>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="name" stroke={textColor} />
                            <YAxis stroke={textColor} />
                            <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px' }}/>
                            <Legend wrapperStyle={{color: textColor}}/>
                            <Bar dataKey="income" fill="#50FA7B" name="Income" />
                            <Bar dataKey="expense" fill="#FF5555" name="Expense" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-brand-secondary p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Spending by Category</h3>
                     <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="total" stroke={textColor} tickFormatter={(value) => `$${value}`} />
                                <YAxis dataKey="name" type="category" stroke={textColor} width={80} />
                                <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px' }}/>
                                <Bar dataKey="total" name="Total Spent" fill="#BD93F9" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white dark:bg-brand-secondary p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Income by Source</h3>
                     <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <BarChart data={incomeSourceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="total" stroke={textColor} tickFormatter={(value) => `$${value}`} />
                                <YAxis dataKey="name" type="category" stroke={textColor} width={80} />
                                <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px' }}/>
                                <Bar dataKey="total" name="Total Income" fill="#8BE9FD" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-brand-secondary p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Balance Over Time</h3>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <LineChart data={cumulativeBalanceData}>
                             <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="name" stroke={textColor} />
                            <YAxis stroke={textColor} />
                            <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px' }}/>
                            <Legend wrapperStyle={{color: textColor}}/>
                            <Line type="monotone" dataKey="balance" stroke="#8BE9FD" strokeWidth={2} name="Account Balance" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Reports;