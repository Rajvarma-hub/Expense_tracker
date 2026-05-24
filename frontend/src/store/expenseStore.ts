import { create } from 'zustand';
import type { Expense } from '../types';
import { expenseAPI } from '../services/api';

interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  fetchExpenses: () => Promise<void>;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: number, expense: Expense) => void;
  removeExpense: (id: number) => void;
  removeMultipleExpenses: (ids: number[]) => void;
  setExpenses: (expenses: Expense[]) => void;
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: [],
  loading: false,
  error: null,
  
  fetchExpenses: async () => {
    set({ loading: true, error: null });
    try {
      const expenses = await expenseAPI.getExpenses();
      const sortedExpenses = expenses.sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return b.id - a.id;
      });
      set({ expenses: sortedExpenses, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  addExpense: (expense) => {
    set((state) => ({ expenses: [expense, ...state.expenses] }));
  },
  
  updateExpense: (id, expense) => {
    set((state) => {
      const updated = state.expenses.map((e) => (e.id === id ? expense : e));
      return {
        expenses: updated.sort((a, b) => {
          if (a.created_at && b.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return b.id - a.id;
        }),
      };
    });
  },
  
  removeExpense: (id) => {
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }));
  },
  
  removeMultipleExpenses: (ids) => {
    set((state) => ({
      expenses: state.expenses.filter((e) => !ids.includes(e.id)),
    }));
  },
  
  setExpenses: (expenses) => {
    set({ expenses });
  },
}));

