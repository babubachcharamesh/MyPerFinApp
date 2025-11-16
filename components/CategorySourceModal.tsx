import React, { useState, useEffect } from 'react';
import type { Category, IncomeSource } from '../types';

type Item = Omit<Category, 'id' | 'isDefault'> | Omit<IncomeSource, 'id' | 'isDefault'>;
type EditableItem = Category | IncomeSource;

interface CategorySourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Item, id?: string) => void;
    itemToEdit: EditableItem | null;
    type: 'Category' | 'Income Source';
}

const CategorySourceModal: React.FC<CategorySourceModalProps> = ({ isOpen, onClose, onSave, itemToEdit, type }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#BD93F9');

    useEffect(() => {
        if (itemToEdit) {
            setName(itemToEdit.name);
            setColor(itemToEdit.color);
        } else {
            // Reset for new item
            setName('');
            setColor('#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'));
        }
    }, [itemToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave({ name: name.trim(), color }, itemToEdit?.id);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-brand-secondary rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
                    {itemToEdit ? `Edit ${type}` : `Add New ${type}`}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-brand-primary border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-white focus:ring-brand-accent focus:border-brand-accent"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="color" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Color</label>
                        <div className="flex items-center space-x-3">
                             <input
                                id="color"
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="h-10 w-10 p-1 bg-white dark:bg-brand-primary border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                            />
                             <input
                                type="text"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-brand-primary border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-white focus:ring-brand-accent focus:border-brand-accent"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-white font-semibold">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategorySourceModal;
