
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: Category;
  date: Date;
  type: 'income' | 'expense';
}

export type Category = 
  | 'food' 
  | 'transportation' 
  | 'housing' 
  | 'entertainment' 
  | 'utilities' 
  | 'healthcare' 
  | 'education' 
  | 'shopping' 
  | 'personal' 
  | 'investments' 
  | 'income' 
  | 'other';

export interface Budget {
  category: Category;
  limit: number;
  spent: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  budgets: Budget[];
}
