import React from 'react';
import { FinancialSummary } from '@/lib/types';
import { formatRupiah } from '@/lib/format';
import BalanceCard from './balance-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SummaryCardsProps {
  summary: FinancialSummary;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Total Income</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-medium text-green-600">{formatRupiah(summary.totalIncome)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Total Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-medium text-red-600">{formatRupiah(summary.totalExpense)}</p>
        </CardContent>
      </Card>
      <BalanceCard balance={summary.balance} />
    </div>
  );
}
