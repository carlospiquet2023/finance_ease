
import { Category, Transaction } from "@/types/finance";

// Sample initial data
export const sampleCategories: { name: Category; icon: string; color: string }[] = [
  { name: 'food', icon: '🍔', color: '#f97316' },
  { name: 'transportation', icon: '🚗', color: '#3b82f6' }, 
  { name: 'housing', icon: '🏠', color: '#8b5cf6' },
  { name: 'entertainment', icon: '🎮', color: '#ec4899' },
  { name: 'utilities', icon: '💡', color: '#f59e0b' },
  { name: 'healthcare', icon: '🏥', color: '#ef4444' },
  { name: 'education', icon: '📚', color: '#10b981' },
  { name: 'shopping', icon: '🛍️', color: '#6366f1' },
  { name: 'personal', icon: '👤', color: '#14b8a6' },
  { name: 'investments', icon: '📈', color: '#84cc16' },
  { name: 'income', icon: '💰', color: '#4ade80' },
  { name: 'other', icon: '❓', color: '#9ca3af' }
];

// Tradução de categorias para português
export const categoryTranslations: Record<Category, string> = {
  food: 'Alimentação',
  transportation: 'Transporte',
  housing: 'Moradia',
  entertainment: 'Entretenimento',
  utilities: 'Serviços',
  healthcare: 'Saúde',
  education: 'Educação',
  shopping: 'Compras',
  personal: 'Pessoal',
  investments: 'Investimentos',
  income: 'Receita',
  other: 'Outros'
};

export const translateCategory = (category: Category): string => {
  return categoryTranslations[category] || category;
};

export const getCategoryDetails = (category: Category) => {
  return sampleCategories.find(cat => cat.name === category) || sampleCategories[sampleCategories.length - 1];
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const calculateTotals = (transactions: Transaction[]) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses
  };
};

export const getInitialTransactions = (): Transaction[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  return [
    {
      id: '1',
      amount: 3500,
      description: 'Salário',
      category: 'income',
      date: today,
      type: 'income'
    },
    {
      id: '2',
      amount: 150,
      description: 'Supermercado',
      category: 'food',
      date: yesterday,
      type: 'expense'
    },
    {
      id: '3',
      amount: 200,
      description: 'Uber',
      category: 'transportation',
      date: yesterday,
      type: 'expense'
    },
    {
      id: '4',
      amount: 500,
      description: 'Aluguel',
      category: 'housing',
      date: lastWeek,
      type: 'expense'
    },
    {
      id: '5',
      amount: 100,
      description: 'Streaming',
      category: 'entertainment',
      date: lastWeek,
      type: 'expense'
    }
  ];
};
