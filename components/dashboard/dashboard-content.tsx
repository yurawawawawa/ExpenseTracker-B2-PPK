"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/lib/types';
import SummaryCards from '@/components/dashboard/summary-cards';
import RecentTransactions from '@/components/dashboard/recent-transactions';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface DashboardContentProps {
  userEmail: string;
}

export default function DashboardContent({ userEmail }: DashboardContentProps) {
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
    const payload = { amount: Number(amount), type, description, category, date };
    
    try {
      const url = '/api/transactions' + (editingId ? `?id=${editingId}` : '');
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsOpen(false);
        resetForm();
        fetchTransactions();
      }
    } catch (e) {
      console.error(e);
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
    <div className="flex flex-col gap-8 max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center">
        <Card className="flex-1 border-none shadow-none bg-transparent">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl">Welcome, {userEmail}</CardTitle>
            <p className="text-muted-foreground">Here is an overview of your finances.</p>
          </CardHeader>
        </Card>

        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Add Transaction</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
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
              <Button type="submit" className="w-full mt-2">Save</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <SummaryCards summary={summary} />

      <div className="flex gap-4 items-center">
        <h3 className="font-semibold text-lg">Filters:</h3>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income Only</SelectItem>
            <SelectItem value="expense">Expense Only</SelectItem>
          </SelectContent>
        </Select>
        <Input 
          className="max-w-[200px]" 
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
