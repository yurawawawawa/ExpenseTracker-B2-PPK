import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/format';
import { getBalanceVisibility, setBalanceVisibility } from '@/lib/cookies';

interface BalanceCardProps {
  balance: number;
}

export default function BalanceCard({ balance }: BalanceCardProps) {
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-muted-foreground">Balance</CardTitle>
        <Button variant="ghost" size="sm" onClick={toggle}>
          {visibility === 'show' ? 'Hide' : 'Show'}
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-medium">
          {visibility === 'show' ? formatRupiah(balance) : '••••••••'}
        </p>
      </CardContent>
    </Card>
  );
}
