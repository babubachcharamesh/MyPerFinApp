export interface Category {
    id: string;
    name: string;
    color: string;
    isDefault?: boolean;
}

export interface IncomeSource {
    id: string;
    name: string;
    color: string;
    isDefault?: boolean;
}

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string; // ISO string
    type: 'income' | 'expense';
    category: Category;
    incomeSource?: IncomeSource;
    aiConfidence?: number; // Value from 0 to 1
}

export interface Goal {
    id:string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string; // ISO string
}

export interface Budget {
    categoryId: string;
    amount: number;
}

export interface Correction {
    description: string;
    correctedCategoryId: string;
}

export type View = 'dashboard' | 'transactions' | 'goals' | 'budget' | 'reports' | 'settings';