"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BudgetSummary } from "@/lib/types";
import BudgetSummaryCards from "./budget-summary-cards";
import BudgetIndicator from "./budget-indicator";
import BudgetSetupDialog from "./budget-setup-dialog";
import MonthSelector from "./month-selector";

export default function BudgetSection() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary>({
    budget: null,
    totalExpense: 0,
    remaining: 0,
    percentage: 0,
    status: "safe",
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchBudgetSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/budgets?month=${selectedMonth}&year=${selectedYear}`,
        {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
      if (res.ok) {
        const data: BudgetSummary = await res.json();
        setBudgetSummary(data);
      }
    } catch (e) {
      console.error("Failed to fetch budget summary:", e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchBudgetSummary();
  }, [fetchBudgetSummary]);

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  return (
    <section className="flex flex-col gap-5">
      {/* Header: Title + Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            💰 Budget Management
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola dan pantau anggaran bulananmu
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <MonthSelector
            month={selectedMonth}
            year={selectedYear}
            onMonthChange={handleMonthChange}
          />
          <BudgetSetupDialog
            currentBudget={budgetSummary.budget}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onBudgetSaved={fetchBudgetSummary}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-lg bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          {/* Budget Summary Cards */}
          <BudgetSummaryCards budgetSummary={budgetSummary} />

          {/* Budget Indicator */}
          <BudgetIndicator budgetSummary={budgetSummary} />
        </>
      )}
    </section>
  );
}
