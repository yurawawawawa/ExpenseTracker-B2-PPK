"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BudgetSummary } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { ShieldCheck, AlertTriangle, XCircle } from "lucide-react";

interface BudgetIndicatorProps {
  budgetSummary: BudgetSummary;
}

const STATUS_CONFIG = {
  safe: {
    label: "Aman",
    description: "Pengeluaran masih dalam batas budget",
    color: "text-emerald-600 dark:text-emerald-400",
    bgBar: "bg-emerald-500",
    bgTrack: "bg-emerald-100 dark:bg-emerald-900/30",
    bgBadge: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
    icon: ShieldCheck,
  },
  warning: {
    label: "Mendekati Batas",
    description: "Pengeluaran mendekati batas budget",
    color: "text-amber-600 dark:text-amber-400",
    bgBar: "bg-amber-500",
    bgTrack: "bg-amber-100 dark:bg-amber-900/30",
    bgBadge: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    icon: AlertTriangle,
  },
  danger: {
    label: "Melebihi Budget",
    description: "Pengeluaran telah melebihi batas budget!",
    color: "text-red-600 dark:text-red-400",
    bgBar: "bg-red-500",
    bgTrack: "bg-red-100 dark:bg-red-900/30",
    bgBadge: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
    icon: XCircle,
  },
};

export default function BudgetIndicator({ budgetSummary }: BudgetIndicatorProps) {
  const { budget, percentage, status } = budgetSummary;
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const [showAlert, setShowAlert] = useState(false);

  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;
  const cappedPercentage = Math.min(percentage, 100);

  useEffect(() => {
    // Animate progress bar
    const timer = setTimeout(() => {
      setAnimatedWidth(cappedPercentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [cappedPercentage]);

  useEffect(() => {
    // Show alert for danger status
    if (status === "danger" && budget) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, [status, budget]);

  if (!budget) {
    return (
      <Card className="border border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-3 mb-3">
            <ShieldCheck className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-sm text-muted-foreground">
            Belum ada budget untuk bulan ini.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Buat budget untuk mulai memantau pengeluaranmu.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Alert Banner */}
      {showAlert && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <XCircle className="h-5 w-5 text-red-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              Peringatan: Budget Terlampaui!
            </p>
            <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5">
              Pengeluaranmu telah melebihi budget yang ditetapkan sebesar{" "}
              <span className="font-semibold">{formatRupiah(Math.abs(budgetSummary.remaining))}</span>
            </p>
          </div>
          <button
            onClick={() => setShowAlert(false)}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Progress Card */}
      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Penggunaan Budget
            </CardTitle>
            <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.bgBadge}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {config.label}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Percentage Display */}
            <div className="flex items-baseline justify-between">
              <span className={`text-3xl font-bold tabular-nums ${config.color}`}>
                {percentage.toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground">
                {formatRupiah(budgetSummary.totalExpense)} / {formatRupiah(Number(budget.amount))}
              </span>
            </div>

            {/* Progress Bar */}
            <div className={`relative h-3 w-full rounded-full overflow-hidden ${config.bgTrack}`}>
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${config.bgBar}`}
                style={{ width: `${animatedWidth}%` }}
              />
            </div>

            {/* Status Description */}
            <p className="text-xs text-muted-foreground">
              {config.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
