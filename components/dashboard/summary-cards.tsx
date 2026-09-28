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
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
      <Card className="overflow-hidden transition-transform duration-200 hover:-translate-y-0.5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 sm:p-6 sm:pb-3">
          <CardTitle className="text-sm font-medium text-slate-500">Total income</CardTitle>
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 sm:size-10"><ArrowDownLeft className="size-4 sm:size-5" /></span>
        </CardHeader>
        <CardContent className="p-4 pt-1 sm:p-6 sm:pt-0">
          <p className="text-lg font-bold tracking-tight text-slate-950 sm:text-2xl">{formatRupiah(summary.totalIncome)}</p>
          <p className="mt-1 text-xs font-medium text-emerald-600">Money received</p>
        </CardContent>
      </Card>
      <Card className="overflow-hidden transition-transform duration-200 hover:-translate-y-0.5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 sm:p-6 sm:pb-3">
          <CardTitle className="text-sm font-medium text-slate-500">Total expense</CardTitle>
          <span className="grid size-9 place-items-center rounded-xl bg-rose-50 text-rose-600 sm:size-10"><ArrowUpRight className="size-4 sm:size-5" /></span>
        </CardHeader>
        <CardContent className="p-4 pt-1 sm:p-6 sm:pt-0">
          <p className="text-lg font-bold tracking-tight text-slate-950 sm:text-2xl">{formatRupiah(summary.totalExpense)}</p>
          <p className="mt-1 text-xs font-medium text-rose-600">Money spent</p>
        </CardContent>
      </Card>
      <BalanceCard balance={summary.balance} className="col-span-2 md:col-span-1" />
    </div>
  );
}
