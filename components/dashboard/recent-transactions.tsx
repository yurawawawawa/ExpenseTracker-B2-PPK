import React from 'react';
import { Transaction } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { formatRupiah, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { ArrowDownLeft, ArrowUpRight, Edit2, Plus, ReceiptText, Trash2 } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
  hasError?: boolean;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
}

export default function RecentTransactions({ transactions, isLoading = false, hasError = false, onEdit, onDelete, onAdd }: RecentTransactionsProps) {
  if (hasError) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <CardTitle className="flex items-center justify-between text-sm text-slate-500">
          <span>Transaction history</span>
          <span className="text-xs font-medium">Newest first</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-5 sm:p-6" aria-label="Loading transactions">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-600"><ReceiptText className="size-6" /></span>
            <h3 className="mt-4 font-semibold text-slate-900">No transactions yet</h3>
            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">Add your first income or expense and it will appear here.</p>
            <Button onClick={onAdd} className="mt-5"><Plus className="size-4" /> Add transaction</Button>
          </div>
        ) : (
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                <TableHead className="px-6">Transaction</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className="group">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {tx.type === 'income' ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                      </span>
                      <div><p className="font-semibold text-slate-800">{tx.description || (tx.type === 'income' ? 'Income' : 'Expense')}</p><p className="mt-0.5 text-xs capitalize text-slate-400">{tx.type}</p></div>
                    </div>
                  </TableCell>
                  <TableCell><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{tx.category || 'Uncategorized'}</span></TableCell>
                  <TableCell className="text-slate-500">{tx.date ? formatDate(tx.date) : '-'}</TableCell>
                  <TableCell className={`text-right font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit?.(tx)} aria-label="Edit transaction" className="text-slate-400 hover:text-blue-600">
                      <Edit2 className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete?.(tx.id)} aria-label="Delete transaction" className="text-slate-400 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="size-4" />
                    </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
