import React from 'react';
import { FinancialSummary } from '@/lib/types';
import { formatRupiah } from '@/lib/format';
import BalanceCard from './balance-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface SummaryCardsProps {
  summary: FinancialSummary;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="overflow-hidden transition-transform duration-200 hover:-translate-y-0.5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-slate-500">Total income</CardTitle>
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><ArrowDownLeft className="size-5" /></span>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tracking-tight text-slate-950">{formatRupiah(summary.totalIncome)}</p>
          <p className="mt-1 text-xs font-medium text-emerald-600">Money received</p>
        </CardContent>
      </Card>
      <Card className="overflow-hidden transition-transform duration-200 hover:-translate-y-0.5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-slate-500">Total expense</CardTitle>
          <span className="grid size-10 place-items-center rounded-xl bg-rose-50 text-rose-600"><ArrowUpRight className="size-5" /></span>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tracking-tight text-slate-950">{formatRupiah(summary.totalExpense)}</p>
          <p className="mt-1 text-xs font-medium text-rose-600">Money spent</p>
        </CardContent>
      </Card>
      <BalanceCard balance={summary.balance} />
    </div>
  );
}
