import React from 'react';
import { Transaction } from '@/lib/types';
import SummaryCards from '@/components/dashboard/summary-cards';
import RecentTransactions from '@/components/dashboard/recent-transactions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface DashboardContentProps {
  userEmail: string;
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
  recentTransactions: Transaction[];
}

export default function DashboardContent({ userEmail, summary, recentTransactions }: DashboardContentProps) {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Welcome, {userEmail}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Here is an overview of your finances.</p>
        </CardContent>
      </Card>

      <SummaryCards summary={summary} />

      <RecentTransactions transactions={recentTransactions} />
    </div>
  );
}
