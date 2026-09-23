import { createClient } from '@/lib/supabase/server';
import { FinancialSummary } from '@/lib/types';

export async function getFinancialSummary(userId: string): Promise<FinancialSummary> {
  const supabase = await createClient();

  // Income
  const { data: incomeData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'income');
  const totalIncome = incomeData?.reduce((sum, r) => sum + Number(r.amount), 0) ?? 0;

  // Expense
  const { data: expenseData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'expense');
  const totalExpense = expenseData?.reduce((sum, r) => sum + Number(r.amount), 0) ?? 0;

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}
