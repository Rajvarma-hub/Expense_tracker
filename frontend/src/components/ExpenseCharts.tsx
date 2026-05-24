import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';
import { useCurrencyStore } from '../store/currencyStore';
import type { Expense } from '../types';

interface ExpenseChartsProps {
  expenses: Expense[];
}

const COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#a855f7',
];

const ExpenseCharts = ({ expenses }: ExpenseChartsProps) => {
  const { formatAmount } = useCurrencyStore();
  const chartData = useMemo(() => {
    const categoryMap = new Map<string, number>();

    expenses.forEach((expense) => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.amount);
    });

    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount: Number(amount.toFixed(2)) }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const monthlyData = useMemo(() => {
    const monthMap = new Map<string, { income: number; expense: number }>();

    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const current = monthMap.get(monthKey) || { income: 0, expense: 0 };

      if (expense.amount_type === 'credit') {
        current.income += expense.amount;
      } else {
        current.expense += expense.amount;
      }

      monthMap.set(monthKey, current);
    });

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month,
        income: Number(data.income.toFixed(2)),
        expense: Number(data.expense.toFixed(2)),
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [expenses]);

  const trendData = useMemo(() => {
    const dayMap = new Map<string, number>();

    const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedExpenses.forEach((expense) => {
      if (expense.amount_type === 'debit') {
        const date = new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const current = dayMap.get(date) || 0;
        dayMap.set(date, current + expense.amount);
      }
    });

    return Array.from(dayMap.entries())
      .map(([date, amount]) => ({ date, amount: Number(amount.toFixed(2)) }));
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <div className="glass bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl border border-white/20 p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-2xl mb-4">
          <BarChart3 className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
          Add expenses to see beautiful charts
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Expenses by Category
            </h3>
          </div>
        </div>
        <div className="p-6">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatAmount(value)}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400 py-12">
              No data available
            </p>
          )}
        </div>
      </div>

      <div className="glass bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Monthly Income vs Expenses
            </h3>
          </div>
        </div>
        <div className="p-6">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  formatter={(value: number) => formatAmount(value)}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                <Bar
                  dataKey="income"
                  fill="#10b981"
                  name="Income"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  fill="#ef4444"
                  name="Expenses"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400 py-12">
              No data available
            </p>
          )}
        </div>
      </div>

      <div className="glass bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl border border-white/20 overflow-hidden lg:col-span-2">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Daily Spending Trend
            </h3>
          </div>
        </div>
        <div className="p-6">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  formatter={(value: number) => formatAmount(value)}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#06b6d4"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                  name="Spent"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400 py-12">
              No spending data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseCharts;
