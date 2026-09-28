"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Transaction } from '@/lib/types';
import SummaryCards from '@/components/dashboard/summary-cards';
import RecentTransactions from '@/components/dashboard/recent-transactions';
import BudgetSection from '@/components/dashboard/budget-section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AlertCircle, ArrowUpRight, Plus, Search, Sparkles } from 'lucide-react';
import { useProtectedUserName } from '@/components/dashboard/protected-user-context';

interface DashboardContentProps {
  page?: 'dashboard' | 'transactions';
}

export default function DashboardContent({ page = 'dashboard' }: DashboardContentProps) {
  const userName = useProtectedUserName();
  const isTransactionsPage = page === 'transactions';
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  
  // Filter states
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('');
  
  // Form states
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInFlight = useRef(false);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const query = new URLSearchParams();
      if (filterType !== 'all') query.append('type', filterType);
      if (filterCategory) query.append('category', filterCategory);
      
      const res = await fetch(`/api/transactions?${query.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Unable to load transactions');
      setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
    } catch (e) {
      console.error(e);
      setLoadError(e instanceof Error ? e.message : 'Unable to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [filterType, filterCategory]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const summary = transactions.reduce(
    (acc, tx) => {
      const amt = Number(tx.amount);
      if (tx.type === 'income') {
        acc.totalIncome += amt;
        acc.balance += amt;
      } else {
        acc.totalExpense += amt;
        acc.balance -= amt;
      }
      return acc;
    },
    { totalIncome: 0, totalExpense: 0, balance: 0 }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitInFlight.current) return;
    submitInFlight.current = true;
    setIsSubmitting(true);
    setFormError('');
    const payload = { amount: Number(amount), type, description, category, date };
    
    try {
      const url = '/api/transactions' + (editingId ? `?id=${editingId}` : '');
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        throw new Error(result.message ?? 'Unable to save transaction');
      }

      if (res.ok) {
        setIsOpen(false);
        resetForm();
        fetchTransactions();
      }
    } catch (e) {
      console.error(e);
      setFormError(e instanceof Error ? e.message : 'Unable to save transaction');
    } finally {
      submitInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchTransactions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setAmount(tx.amount.toString());
    setType(tx.type);
    setDescription(tx.description || '');
    setCategory(tx.category || '');
    // Ensure date format is YYYY-MM-DD
    const txDate = tx.date ? new Date(tx.date) : new Date();
    setDate(txDate.toISOString().split('T')[0]);
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormError('');
    setEditingId(null);
    setAmount('');
    setType('expense');
    setDescription('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 overflow-x-hidden px-4 py-6 sm:gap-9 sm:px-7 sm:py-7 lg:px-10 lg:py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Sparkles className="size-3.5" /> {isTransactionsPage ? 'Transaction management' : 'Financial overview'}
          </div>
          <h1 className="break-words text-[1.75rem] font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl">{isTransactionsPage ? 'Transactions' : `Welcome back, ${userName}`}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            {isTransactionsPage ? 'Add, review, and organize your income and expenses.' : 'See where your money goes and keep every financial goal within reach.'}
          </p>
        </div>

        {isTransactionsPage && <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} size="lg" className="w-full bg-blue-600 shadow-lg shadow-blue-600/20 hover:bg-blue-700 sm:w-auto"><Plus className="size-4" /> Add transaction</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Amount</Label>
                <Input type="number" required value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Input required value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Salary, Food" />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional" />
              </div>
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input type="date" required value={date} onChange={e => setDate(e.target.value)} />
              </div>
              {formError && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
              <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save transaction'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>}
      </div>

      {isTransactionsPage ? <section className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Cash flow</p>
            <div className="mt-1 flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">Transactions</h2>
              {!isLoading && !loadError && <span className="rounded-full bg-slate-200/70 px-2.5 py-1 text-xs font-bold text-slate-600">{transactions.length}</span>}
            </div>
            <p className="mt-1 text-sm text-slate-500">Your latest income and spending activity.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full border-slate-200 bg-white sm:w-[160px]"><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="income">Income only</SelectItem>
                <SelectItem value="expense">Expense only</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input className="w-full border-slate-200 bg-white pl-9 sm:w-[230px]" placeholder="Category..." value={filterCategory} onChange={e => setFilterCategory(e.target.value)} />
            </div>
          </div>
        </div>

        {loadError && (
          <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3"><AlertCircle className="size-5 shrink-0" /><div><p className="font-semibold">Transactions could not be loaded</p><p className="text-sm text-red-700">{loadError}</p></div></div>
            <Button variant="outline" onClick={fetchTransactions} className="border-red-200 bg-white text-red-700 hover:bg-red-100">Try again <ArrowUpRight className="size-4" /></Button>
          </div>
        )}

        <RecentTransactions transactions={transactions} isLoading={isLoading} hasError={Boolean(loadError)} onEdit={handleEdit} onDelete={handleDelete} onAdd={() => { resetForm(); setIsOpen(true); }} />
      </section> : <>
        <SummaryCards summary={summary} />
        <BudgetSection />
      </>}
    </div>
  );
}
