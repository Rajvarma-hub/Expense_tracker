import { create } from 'zustand';
import type { Currency } from '../types';
import { CURRENCIES } from '../types';

interface CurrencyState {
  selectedCurrency: Currency;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number) => string;
}

const getStoredCurrency = (): Currency => {
  const stored = localStorage.getItem('selected-currency');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const found = CURRENCIES.find(c => c.code === parsed.code);
      if (found) return found;
    } catch (e) {
    }
  }
  return CURRENCIES.find(c => c.code === 'USD') || CURRENCIES[0];
};

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  selectedCurrency: getStoredCurrency(),
  
  setCurrency: (currency: Currency) => {
    localStorage.setItem('selected-currency', JSON.stringify(currency));
    set({ selectedCurrency: currency });
  },
  
  formatAmount: (amount: number) => {
    const currency = get().selectedCurrency;
    const formatted = Math.abs(amount).toFixed(2);
    
    if (currency.position === 'before') {
      return `${currency.symbol}${formatted}`;
    } else {
      return `${formatted} ${currency.symbol}`;
    }
  },
}));

