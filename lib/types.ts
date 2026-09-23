export interface Transaction {
  /** Unique identifier of the transaction */
  id: string;
  /** Supabase user id that owns this transaction */
  user_id: string;
  /** Monetary amount – use positive numbers; sign is interpreted by `type` */
  amount: number;
  /** Type of transaction */
  type: 'income' | 'expense';
  /** Optional description provided by the user */
  description?: string;
  /** ISO timestamp when the transaction was created */
  created_at?: string;
}
