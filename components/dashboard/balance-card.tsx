"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/format';
import { getBalanceVisibility, setBalanceVisibility } from '@/lib/cookies';
import { Eye, EyeOff, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  balance: number;
  className?: string;
}

export default function BalanceCard({ balance, className }: BalanceCardProps) {
  const [visibility, setVisibility] = useState<'show' | 'hide'>('show');

  useEffect(() => {
    const v = getBalanceVisibility();
    setVisibility(v);
  }, []);

  const toggle = () => {
    const newVis = visibility === 'show' ? 'hide' : 'show';
    setVisibility(newVis);
    setBalanceVisibility(newVis);
  };

  return (
    <Card className={cn("border-0 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-600/20 transition-transform duration-200 hover:-translate-y-0.5", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 sm:p-6 sm:pb-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white/15"><Wallet className="size-5" /></span>
          <CardTitle className="text-sm font-medium text-blue-100">Current balance</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={toggle} className="text-white hover:bg-white/15 hover:text-white" aria-label={visibility === 'show' ? 'Hide balance' : 'Show balance'}>
          {visibility === 'show' ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-1 sm:p-6 sm:pt-0">
        <p className="text-xl font-bold tracking-tight sm:text-2xl">
          {visibility === 'show' ? formatRupiah(balance) : '••••••••'}
        </p>
        <p className="mt-1 text-xs font-medium text-blue-100">Available across all transactions</p>
      </CardContent>
    </Card>
  );
}
