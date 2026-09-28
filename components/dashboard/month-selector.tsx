"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface MonthSelectorProps {
  month: number;
  year: number;
  onMonthChange: (month: number, year: number) => void;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function MonthSelector({ month, year, onMonthChange }: MonthSelectorProps) {
  const now = new Date();
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  const goPrev = () => {
    if (month === 1) {
      onMonthChange(12, year - 1);
    } else {
      onMonthChange(month - 1, year);
    }
  };

  const goNext = () => {
    if (month === 12) {
      onMonthChange(1, year + 1);
    } else {
      onMonthChange(month + 1, year);
    }
  };

  const goToday = () => {
    onMonthChange(now.getMonth() + 1, now.getFullYear());
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md hover:bg-background"
          onClick={goPrev}
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 px-3 min-w-[160px] justify-center">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-semibold">
            {MONTH_NAMES[month - 1]} {year}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md hover:bg-background"
          onClick={goNext}
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {!isCurrentMonth && (
        <Button
          variant="ghost"
          size="sm"
          onClick={goToday}
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50"
        >
          Bulan Ini
        </Button>
      )}
    </div>
  );
}
