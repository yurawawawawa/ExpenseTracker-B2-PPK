"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Transaction } from '@/lib/types';
import SummaryCards from '@/components/dashboard/summary-cards';
import RecentTransactions from '@/components/dashboard/recent-transactions';
import BudgetSection from '@/components/dashboard/budget-section';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface DashboardContentProps {
  userName: string;
}

export default function DashboardContent({ userName }: DashboardContentProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
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
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (e) {
      console.error(e);
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
    setEditingId(null);
    setAmount('');
    setType('expense');
    setDescription('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:py-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <Card className="flex-1 border-none bg-transparent shadow-none">
          <CardHeader className="px-0 pt-0">
            <p className="mb-2 text-sm font-medium text-primary">Financial overview</p>
            <CardTitle className="text-[32px] leading-tight tracking-tight text-slate-900">Welcome, {userName}</CardTitle>
            <p className="text-muted-foreground">Track your income, expenses, and balance in one place.</p>
          </CardHeader>
        </Card>

        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="w-full sm:w-auto">Add Transaction</Button>
          </DialogTrigger>
          <DialogContent>
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
              <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save transaction'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <SummaryCards summary={summary} />

      <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:flex-row sm:items-center">
        <h3 className="text-sm font-semibold text-slate-700">Filter transactions</h3>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full bg-white sm:w-[170px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income Only</SelectItem>
            <SelectItem value="expense">Expense Only</SelectItem>
          </SelectContent>
        </Select>
        <Input
          className="w-full bg-white sm:max-w-[240px]"
          placeholder="Filter by category..." 
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)} 
        />
      </div>

      <RecentTransactions 
        transactions={transactions} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
    </div>
  );
}
