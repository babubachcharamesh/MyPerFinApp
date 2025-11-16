
import React from 'react';
import type { View } from '../types';
import { LayoutDashboard, List, Target, BarChart3, Bot, PiggyBank, Sun, Moon, Settings } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
    activeView: View;
    setView: (view: View) => void;
}

const NavItem: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col md:flex-row items-center justify-center md:justify-start space-y-1 md:space-y-0 md:space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            isActive
                ? 'bg-brand-accent text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-brand-secondary hover:text-gray-900 dark:hover:text-white'
        }`}
    >
        {icon}
        <span className="hidden md:inline">{label}</span>
    </button>
);

const Header: React.FC<HeaderProps> = ({ activeView, setView }) => {
    const { theme, toggleTheme } = useTheme();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'transactions', label: 'Transactions', icon: <List size={20} /> },
        { id: 'goals', label: 'Goals', icon: <Target size={20} /> },
        { id: 'budget', label: 'Budget', icon: <PiggyBank size={20} /> },
        { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-brand-secondary/80 backdrop-blur-sm shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-2">
                        <Bot className="h-8 w-8 text-brand-text-secondary" />
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Zenith</h1>
                    </div>
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-2">
                        {navItems.map(item => (
                            <NavItem
                                key={item.id}
                                label={item.label}
                                icon={item.icon}
                                isActive={activeView === item.id}
                                onClick={() => setView(item.id as View)}
                            />
                        ))}
                         <button onClick={toggleTheme} className="ml-4 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-brand-secondary p-2 rounded-full transition-colors">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                    </nav>
                     {/* Mobile Theme Toggle */}
                    <div className="md:hidden">
                        <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-brand-secondary p-2 rounded-full transition-colors">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                    </div>
                </div>
            </div>
             {/* Mobile Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-brand-secondary border-t border-gray-200 dark:border-gray-700 flex justify-around p-1">
                {navItems.map(item => (
                     <button
                        key={item.id}
                        onClick={() => setView(item.id as View)}
                        className={`flex flex-col items-center justify-center w-full py-2 rounded-lg transition-colors duration-200 ${
                            activeView === item.id
                                ? 'bg-brand-accent text-white'
                                : 'text-gray-600 dark:text-gray-300'
                        }`}
                    >
                        {item.icon}
                        <span className="text-xs">{item.label}</span>
                    </button>
                ))}
            </nav>
        </header>
    );
};

export default Header;