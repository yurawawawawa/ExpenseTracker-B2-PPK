import { getCurrentUser } from '@/lib/auth/session';
import { Transaction, FinancialSummary } from '@/lib/types';
import DashboardContent from '@/components/dashboard/dashboard-content';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  const supabase = await createClient();

  // Financial summary
  const { data: incomeData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', user.id)
    .eq('type', 'income');
  const totalIncome = incomeData?.reduce((sum, r) => sum + Number(r.amount), 0) ?? 0;

  const { data: expenseData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', user.id)
    .eq('type', 'expense');
  const totalExpense = expenseData?.reduce((sum, r) => sum + Number(r.amount), 0) ?? 0;

  const summary: FinancialSummary = {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };

  // Recent transactions (limit 5, newest first)
  const { data: recent } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(5);

  const recentTransactions: Transaction[] = recent ?? [];

  return (
    <DashboardContent
      userEmail={user.email ?? ''}
      summary={summary}
      recentTransactions={recentTransactions}
    />
  );
}
