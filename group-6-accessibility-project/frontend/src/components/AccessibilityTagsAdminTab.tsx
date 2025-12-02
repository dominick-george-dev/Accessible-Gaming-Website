import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface AccessibilityTag {
    id: number;
    tag: string;
    category: string;
    createdAt: string;
    updatedAt: string;
}

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
}

const AccessibilityTagsAdminTab: React.FC = () => {
    const [tags, setTags] = useState<AccessibilityTag[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingTag, setEditingTag] = useState<AccessibilityTag | null>(null);

    // Form states
    const [newTag, setNewTag] = useState({ tag: '', category: '' });
    const [editTag, setEditTag] = useState({ tag: '', category: '' });

    const [toasts, setToasts] = useState<Toast[]>([]);

    // Categories for dropdown
    const categories = [
        'Visual',
        'Hearing',
        'Motor',
        'Cognitive',
        'Controls',
        'Interface',
        'Audio',
        'Other'
    ];

    const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { id, message, type };
        setToasts(prev => [...prev, newToast]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            console.log('Fetching accessibility tags...');
            const response = await fetch('http://localhost:3000/accessibility-tags');
            console.log('Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Fetched tags:', data);
                setTags(data);
            } else {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.error('Network error:', error);
            addToast('Failed to load accessibility tags', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTag = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newTag.tag.trim() || !newTag.category.trim()) {
            addToast('Please fill in all fields', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            const tagData = {
                tag: newTag.tag.trim(),
                category: newTag.category.trim()
            };
            const response = await fetch('http://localhost:3000/accessibility-tags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(tagData),
            });

            if (response.ok) {
                addToast('Accessibility tag added successfully!', 'success');
                setNewTag({ tag: '', category: '' });
                setShowAddForm(false);
                fetchTags();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add accessibility tag');
            }
        } catch (error) {
            console.error('Error adding accessibility tag:', error);
            addToast(error instanceof Error ? error.message : 'Failed to add accessibility tag', 'error');
        }
    };

    const handleUpdateTag = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingTag || !editTag.tag.trim() || !editTag.category.trim()) {
            addToast('Please fill in all fields', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            const updateData = {
                tag: editTag.tag.trim(),
                category: editTag.category.trim()
            };
            const response = await fetch(`http://localhost:3000/accessibility-tags/${editingTag.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            });

            if (response.ok) {
                addToast('Accessibility tag updated successfully!', 'success');
                setEditingTag(null);
                setEditTag({ tag: '', category: '' });
                fetchTags();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update accessibility tag');
            }
        } catch (error) {
            console.error('Error updating accessibility tag:', error);
            addToast(error instanceof Error ? error.message : 'Failed to update accessibility tag', 'error');
        }
    };

    const handleDeleteTag = async (tagId: number) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:3000/accessibility-tags/${tagId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                addToast('Accessibility tag deleted successfully!', 'success');
                fetchTags();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete accessibility tag');
            }
        } catch (error) {
            console.error('Error deleting accessibility tag:', error);
            addToast(error instanceof Error ? error.message : 'Failed to delete accessibility tag', 'error');
        }
    };

    const startEditing = (tag: AccessibilityTag) => {
        setEditingTag(tag);
        setEditTag({ tag: tag.tag, category: tag.category });
        setShowAddForm(false);
    };

    const cancelEditing = () => {
        setEditingTag(null);
        setEditTag({ tag: '', category: '' });
    };

    const ToastContainer = () => (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-center justify-between p-4 rounded-lg shadow-lg min-w-80 max-w-md transform transition-all duration-300 ease-in-out ${toast.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                        : toast.type === 'error'
                            ? 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                            : toast.type === 'warning'
                                ? 'bg-yellow-50 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300'
                                : 'bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                        {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                        {toast.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                        {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
                        <span className="font-medium">{toast.message}</span>
                    </div>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="ml-4 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                        aria-label="Close notification"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer />
            <div className="space-y-6 px-4 py-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Manage Accessibility Tags
                    </h2>
                    <button
                        onClick={() => {
                            setShowAddForm(true);
                            setEditingTag(null);
                            setNewTag({ tag: '', category: '' });
                        }}
                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        + Add New Tag
                    </button>
                </div>
                {showAddForm && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                            Add New Accessibility Tag
                        </h3>
                        <form onSubmit={handleAddTag} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tag Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newTag.tag}
                                        onChange={(e) => setNewTag({ ...newTag, tag: e.target.value })}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="e.g., Subtitles, Color Blind Support"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={newTag.category}
                                        onChange={(e) => setNewTag({ ...newTag, category: e.target.value })}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Add Tag
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Edit Tag Form */}
                {editingTag && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-blue-200 shadow">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                            Edit Accessibility Tag
                        </h3>
                        <form onSubmit={handleUpdateTag} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tag Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editTag.tag}
                                        onChange={(e) => setEditTag({ ...editTag, tag: e.target.value })}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={editTag.category}
                                        onChange={(e) => setEditTag({ ...editTag, category: e.target.value })}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Update Tag
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelEditing}
                                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tags List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                            All Accessibility Tags ({tags.length})
                        </h3>

                        {tags.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                No accessibility tags found. Add your first tag above!
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                Tag Name
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                Category
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                Created
                                            </th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tags.map((tag) => (
                                            <tr
                                                key={tag.id}
                                                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                                                    {tag.tag}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                        {tag.category}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                                    {new Date(tag.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => startEditing(tag)}
                                                            className="text-black hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 px-3 py-1 rounded transition-colors font-medium"
                                                        >
                                                            Edit
                                                        </button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 px-3 py-1 rounded transition-colors font-medium">
                                                                    Delete
                                                                </button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Accessibility Tag</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete "{tag.tag}"? This will affect all games using this tag and cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDeleteTag(tag.id)}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AccessibilityTagsAdminTab;