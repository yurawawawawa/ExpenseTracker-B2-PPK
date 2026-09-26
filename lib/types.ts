export interface Transaction {
  /** Unique identifier of the transaction */
  id: string;
  /** User id that owns this transaction */
  user_id: string;
  /** Monetary amount – use positive numbers; sign is interpreted by `type` */
  amount: number;
  /** Type of transaction */
  type: 'income' | 'expense';
  /** Optional description provided by the user */
  description?: string;
  /** Optional category for the transaction */
  category?: string;
  /** Date of the transaction (ISO date string) */
  date?: string;
  /** ISO timestamp when the transaction was created */
  created_at?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
