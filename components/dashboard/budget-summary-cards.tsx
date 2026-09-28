"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { BudgetSummary } from "@/lib/types";
import { Wallet, TrendingDown, PiggyBank } from "lucide-react";

interface BudgetSummaryCardsProps {
  budgetSummary: BudgetSummary;
}

export default function BudgetSummaryCards({ budgetSummary }: BudgetSummaryCardsProps) {
  const { budget, totalExpense, remaining } = budgetSummary;
  const budgetAmount = budget ? Number(budget.amount) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Budget */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/80 to-white dark:from-blue-950/30 dark:to-card transition-all duration-300 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Budget Bulan Ini
          </CardTitle>
          <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-2">
            <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {budgetAmount > 0 ? formatRupiah(budgetAmount) : "Belum diatur"}
          </p>
          {!budget && (
            <p className="text-xs text-muted-foreground mt-1">
              Atur budget untuk mulai tracking
            </p>
          )}
        </CardContent>
      </Card>

      {/* Total Pengeluaran */}
      <Card className="border-l-4 border-l-rose-500 bg-gradient-to-br from-rose-50/80 to-white dark:from-rose-950/30 dark:to-card transition-all duration-300 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pengeluaran Bulan Ini
          </CardTitle>
          <div className="rounded-full bg-rose-100 dark:bg-rose-900/50 p-2">
            <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {formatRupiah(totalExpense)}
          </p>
        </CardContent>
      </Card>

      {/* Sisa Budget */}
      <Card
        className={`border-l-4 transition-all duration-300 hover:shadow-md bg-gradient-to-br ${
          remaining >= 0
            ? "border-l-emerald-500 from-emerald-50/80 to-white dark:from-emerald-950/30 dark:to-card"
            : "border-l-red-500 from-red-50/80 to-white dark:from-red-950/30 dark:to-card"
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Sisa Budget
          </CardTitle>
          <div
            className={`rounded-full p-2 ${
              remaining >= 0
                ? "bg-emerald-100 dark:bg-emerald-900/50"
                : "bg-red-100 dark:bg-red-900/50"
            }`}
          >
            <PiggyBank
              className={`h-4 w-4 ${
                remaining >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            />
          </div>
        </CardHeader>
        <CardContent>
          <p
            className={`text-2xl font-bold ${
              remaining >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {budgetAmount > 0 ? formatRupiah(remaining) : "-"}
          </p>
          {budgetAmount > 0 && remaining < 0 && (
            <p className="text-xs text-red-500 mt-1 font-medium">
              Melebihi budget!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
