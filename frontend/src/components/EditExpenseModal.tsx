import { useState, useEffect } from 'react';
import { X, Tag, DollarSign, Calendar, Edit } from 'lucide-react';
import { expenseAPI } from '../services/api';
import { useExpenseStore } from '../store/expenseStore';
import toast from 'react-hot-toast';

interface EditExpenseModalProps {
  expenseId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const EditExpenseModal = ({ expenseId, onClose, onSuccess }: EditExpenseModalProps) => {
  const { expenses } = useExpenseStore();
  const expense = expenses.find((e) => e.id === expenseId);
  
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expense) {
      setFormData({
        category: expense.category,
        amount: expense.amount.toString(),
        date: expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
      });
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await expenseAPI.updateExpense(expenseId, {
        category: formData.category,
        amount: parseFloat(formData.amount),
        date: formData.date,
      });
      toast.success('Expense updated successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  if (!expense) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20 relative">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500"></div>
        
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Edit className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold gradient-text">
              Edit Expense
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-500" />
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200 hover:border-purple-300"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-purple-500" />
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200 hover:border-purple-300"
              required
              min="0"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-200 hover:border-purple-300"
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            >
              <span className="relative z-10">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </span>
                ) : (
                  'Update Expense'
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;
