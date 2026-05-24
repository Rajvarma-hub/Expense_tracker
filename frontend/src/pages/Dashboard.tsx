import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, MessageSquare, TrendingUp, TrendingDown, DollarSign, Wallet, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useExpenseStore } from '../store/expenseStore';
import { useCurrencyStore } from '../store/currencyStore';
import { authAPI } from '../services/api';
import ExpenseList from '../components/ExpenseList';
import AddExpenseModal from '../components/AddExpenseModal';
import EditExpenseModal from '../components/EditExpenseModal';
import ExpenseCharts from '../components/ExpenseCharts';
import ChatPanel from '../components/ChatPanel';
import CurrencySelector from '../components/CurrencySelector';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [editingExpense, setEditingExpense] = useState<number | null>(null);
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { expenses, fetchExpenses, loading } = useExpenseStore();
  const { formatAmount } = useCurrencyStore();

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleLogout = () => {
    authAPI.logout();
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const totalIncome = expenses
    .filter((e) => e.amount_type === 'credit')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = expenses
    .filter((e) => e.amount_type === 'debit')
    .reduce((sum, e) => sum + e.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <header className="relative z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg flex items-center justify-center">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold gradient-text">
                  Expense Tracker
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Manage your finances efficiently
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 relative">
              <CurrencySelector />
              <button
                onClick={() => setShowChatPanel(!showChatPanel)}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold relative z-10"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="hidden sm:inline">AI Assistant</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold relative z-10"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Total Balance
                </p>
                <p className={`text-4xl font-extrabold ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatAmount(balance)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {balance >= 0 ? 'Positive' : 'Negative'}
                </p>
              </div>
              <div className={`p-4 rounded-2xl ${balance >= 0 ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-red-400 to-pink-500'} shadow-lg`}>
                <DollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="glass bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Total Income
                </p>
                <p className="text-4xl font-extrabold text-green-600 dark:text-green-400">
                  {formatAmount(totalIncome)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  All credits
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="glass bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400 to-pink-500 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Total Expenses
                </p>
                <p className="text-4xl font-extrabold text-red-600 dark:text-red-400">
                  {formatAmount(totalExpenses)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  All debits
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-400 to-pink-500 shadow-lg">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <ExpenseCharts expenses={expenses} />
        </div>

        <div className="glass bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Your Expenses
              </h2>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Expense
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading expenses...</p>
              </div>
            ) : (
              <ExpenseList
                expenses={expenses}
                onEdit={(id) => setEditingExpense(id)}
              />
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddExpenseModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchExpenses();
          }}
        />
      )}

      {editingExpense && (
        <EditExpenseModal
          expenseId={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSuccess={() => {
            setEditingExpense(null);
            fetchExpenses();
          }}
        />
      )}

      {showChatPanel && (
        <ChatPanel 
          onClose={() => setShowChatPanel(false)}
          onExpenseChange={fetchExpenses}
        />
      )}
    </div>
  );
};

export default Dashboard;
