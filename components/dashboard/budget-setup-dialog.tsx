"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Budget } from "@/lib/types";
import { Settings2 } from "lucide-react";

interface BudgetSetupDialogProps {
  currentBudget: Budget | null;
  selectedMonth: number;
  selectedYear: number;
  onBudgetSaved: () => void;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function BudgetSetupDialog({
  currentBudget,
  selectedMonth,
  selectedYear,
  onBudgetSaved,
}: BudgetSetupDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(
    currentBudget ? String(Number(currentBudget.amount)) : ""
  );
  const [month, setMonth] = useState(String(selectedMonth));
  const [year, setYear] = useState(String(selectedYear));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setAmount(currentBudget ? String(Number(currentBudget.amount)) : "");
      setMonth(String(selectedMonth));
      setYear(String(selectedYear));
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: parseInt(month),
          year: parseInt(year),
          amount: parseFloat(amount),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal menyimpan budget");
      }

      setIsOpen(false);
      onBudgetSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
        >
          <Settings2 className="h-4 w-4" />
          {currentBudget ? "Edit Budget" : "Atur Budget"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Settings2 className="h-5 w-5 text-blue-600" />
            {currentBudget ? "Edit Budget Bulanan" : "Atur Budget Bulanan"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Bulan</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((name, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Tahun</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-medium">Nominal Budget (Rp)</Label>
            <Input
              type="number"
              required
              min="1"
              step="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Contoh: 2000000"
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              Masukkan batas pengeluaran maksimal untuk bulan {MONTH_NAMES[parseInt(month) - 1]} {year}
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            {isLoading ? "Menyimpan..." : "Simpan Budget"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
