import axios from 'axios';
import type {
  LoginCredentials,
  AddExpenseData,
  UpdateExpenseData,
  Expense,
  ChatMessage,
  ChatResponse,
  ResetPasswordData
} from '../types';

function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL?.trim();
  if (raw) {
    return raw.replace(/\/+$/, '');
  }
  return '/api';
}

const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: LoginCredentials) => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await axios.post(`${API_BASE_URL}/token`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }

    return response.data;
  },

  register: async (data: LoginCredentials) => {
    const response = await api.post('/register', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData) => {
    const response = await api.post(
      `/Forgotpassword?email=${encodeURIComponent(data.email)}&newpassword=${encodeURIComponent(data.newpassword)}`
    );
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

export const expenseAPI = {
  getExpenses: async (): Promise<Expense[]> => {
    const response = await api.get('/getexpense');
    return response.data;
  },

  addExpense: async (data: AddExpenseData): Promise<Expense> => {
    const response = await api.post('/addexpense', data);
    return response.data;
  },

  updateExpense: async (expenseId: number, data: UpdateExpenseData): Promise<Expense> => {
    const response = await api.post(`/update_expense/${expenseId}`, data);
    return response.data;
  },

  deleteExpense: async (expenseId: number): Promise<void> => {
    await api.delete(`/delete_expense/${expenseId}`);
  },

  deleteMultipleExpenses: async (expenseIds: number[]): Promise<void> => {
    await api.delete('/multiple_items', {
      data: { items: expenseIds },
    });
  },
};

export const chatAPI = {
  sendMessage: async (message: ChatMessage): Promise<ChatResponse> => {
    const response = await api.post('/chat', message);
    return response.data;
  },
};

export default api;


