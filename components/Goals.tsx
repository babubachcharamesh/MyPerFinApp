
import React, { useState } from 'react';
import type { Goal } from '../types';
import { Target, Plus, Trash2 } from 'lucide-react';

interface GoalsProps {
    goals: Goal[];
    addGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
    updateGoal: (id: string, amount: number) => void;
    deleteGoal: (id: string) => void;
    balance: number;
}

const GoalCard: React.FC<{ goal: Goal; onContribute: (id: string, amount: number) => void; onDelete: (id: string) => void; }> = ({ goal, onContribute, onDelete }) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const [contribution, setContribution] = useState('');

    const handleContribute = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(contribution);
        if (!isNaN(amount) && amount > 0) {
            onContribute(goal.id, amount);
            setContribution('');
        }
    };

    return (
        <div className="bg-white dark:bg-brand-secondary p-5 rounded-xl shadow-lg space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">{goal.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
                </div>
                <button onClick={() => onDelete(goal.id)} className="text-gray-500 hover:text-brand-danger p-1 rounded-full"><Trash2 size={18}/></button>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                    <span className="text-brand-success">{goal.currentAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    <span className="text-gray-500 dark:text-gray-400">{goal.targetAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-brand-primary rounded-full h-2.5">
                    <div className="bg-brand-accent h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            <form onSubmit={handleContribute} className="flex space-x-2">
                <input type="number" value={contribution} onChange={e => setContribution(e.target.value)} placeholder="Amount" className="w-full bg-gray-100 dark:bg-brand-primary border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm focus:ring-brand-accent focus:border-brand-accent"/>
                <button type="submit" className="bg-brand-accent hover:bg-brand-accent-hover text-white px-4 py-1.5 rounded-md text-sm font-semibold">Contribute</button>
            </form>
        </div>
    );
};

const Goals: React.FC<GoalsProps> = ({ goals, addGoal, updateGoal, deleteGoal, balance }) => {
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState('');

    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(targetAmount);
        if (name && !isNaN(amount) && amount > 0 && deadline) {
            addGoal({ name, targetAmount: amount, deadline });
            setName('');
            setTargetAmount('');
            setDeadline('');
        }
    };

    return (
        <div className="space-y-8 pb-16 md:pb-0">
            <div className="bg-white dark:bg-brand-secondary p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Add New Goal</h2>
                <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Goal Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Vacation Fund" className="w-full bg-gray-100 dark:bg-brand-primary border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-brand-accent focus:border-brand-accent"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Target Amount</label>
                        <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="1000" className="w-full bg-gray-100 dark:bg-brand-primary border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-brand-accent focus:border-brand-accent"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Deadline</label>
                        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full bg-gray-100 dark:bg-brand-primary border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-brand-accent focus:border-brand-accent"/>
                    </div>
                     <button type="submit" className="md:col-start-4 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition duration-300">
                        <Plus size={20} />
                        <span>Add Goal</span>
                    </button>
                </form>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {goals.map(goal => (
                    <GoalCard key={goal.id} goal={goal} onContribute={updateGoal} onDelete={deleteGoal}/>
                 ))}
            </div>
             {goals.length === 0 && (
                <div className="text-center py-10 col-span-full">
                    <Target size={48} className="mx-auto text-gray-500 dark:text-gray-600" />
                    <p className="mt-4 text-gray-500 dark:text-gray-400">You have no financial goals yet. Add one above to start saving!</p>
                </div>
            )}
        </div>
    );
};

export default Goals;