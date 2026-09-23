export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  description?: string | null;
  category?: string | null;
  date: string; // ISO string
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
