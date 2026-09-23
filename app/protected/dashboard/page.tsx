import { createClient } from '@/lib/supabase/server';
import { Transaction, FinancialSummary } from '@/lib/types';
import DashboardContent from '@/components/dashboard/dashboard-content';

export const dynamic = 'force-dynamic'; // fetch fresh data on each request

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getClaims();
  const user = userData?.claims;
  if (!user) {
    // fallback, but auth middleware should redirect already
    return null;
  }

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
