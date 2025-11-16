import React, { useState } from 'react';
import type { Category, IncomeSource } from '../types';
import { Plus, Edit, Trash2, Tag, Landmark } from 'lucide-react';
import CategorySourceModal from './CategorySourceModal';

type Item = Category | IncomeSource;
type ItemType = 'Category' | 'Income Source';

interface SettingsProps {
    categories: Category[];
    incomeSources: IncomeSource[];
    addCategory: (item: Omit<Category, 'id'>) => void;
    updateCategory: (id: string, item: Omit<Category, 'id'>) => void;
    deleteCategory: (id: string) => void;
    addIncomeSource: (item: Omit<IncomeSource, 'id'>) => void;
    updateIncomeSource: (id: string, item: Omit<IncomeSource, 'id'>) => void;
    deleteIncomeSource: (id: string) => void;
}

const Settings: React.FC<SettingsProps> = ({
    categories,
    incomeSources,
    addCategory,
    updateCategory,
    deleteCategory,
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
    const [modalType, setModalType] = useState<ItemType>('Category');

    const handleOpenModal = (item: Item | null, type: ItemType) => {
        setItemToEdit(item);
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setItemToEdit(null);
    };

    const handleSave = (item: Omit<Item, 'id' | 'isDefault'>, id?: string) => {
        if (modalType === 'Category') {
            if (id) {
                updateCategory(id, item);
            } else {
                addCategory(item);
            }
        } else {
            if (id) {
                updateIncomeSource(id, item);
            } else {
                addIncomeSource(item);
            }
        }
        handleCloseModal();
    };

    const handleDelete = (id: string, type: ItemType) => {
        if (window.confirm(`Are you sure you want to delete this ${type.toLowerCase()}? Transactions using it will be moved to 'Other'.`)) {
            if (type === 'Category') {
                deleteCategory(id);
            } else {
                deleteIncomeSource(id);
            }
        }
    };
    
    const expenseCategories = categories.filter(c => c.name !== 'Income');

    const renderList = (title: string, items: Item[], type: ItemType) => (
        <div className="bg-white dark:bg-brand-secondary p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    {type === 'Category' ? <Tag className="mr-2" /> : <Landmark className="mr-2" />}
                    {title}
                </h3>
                <button
                    onClick={() => handleOpenModal(null, type)}
                    className="flex items-center space-x-2 bg-brand-accent hover:bg-brand-accent-hover text-white font-semibold px-4 py-2 rounded-lg transition"
                >
                    <Plus size={18} />
                    <span>Add New</span>
                </button>
            </div>
            <ul className="space-y-3">
                {items.map(item => (
                    <li key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-brand-primary rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{item.name} {item.isDefault && <span className="text-xs text-gray-500">(Default)</span>}</span>
                        </div>
                        {!item.isDefault && (
                            <div className="flex items-center space-x-2">
                                <button onClick={() => handleOpenModal(item, type)} className="text-gray-500 hover:text-brand-accent dark:hover:text-brand-text-secondary p-2 rounded-full transition-colors">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => handleDelete(item.id, type)} className="text-gray-500 hover:text-brand-danger p-2 rounded-full transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div className="space-y-8 pb-16 md:pb-0">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>
            {renderList('Manage Expense Categories', expenseCategories, 'Category')}
            {renderList('Manage Income Sources', incomeSources, 'Income Source')}

            <CategorySourceModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                itemToEdit={itemToEdit}
                type={modalType}
            />
        </div>
    );
};

export default Settings;
