import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db";
import { Budget } from "@/lib/types";

// GET /api/budgets?month=9&year=2026
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const db = getDatabase();

    if (month && year) {
      // Get specific budget for month/year
      const result = await db.query<Budget>(
        `SELECT * FROM budgets WHERE user_id = $1 AND month = $2 AND year = $3 LIMIT 1`,
        [user.id, parseInt(month), parseInt(year)]
      );

      // Also get total expense for that month
      const expenseResult = await db.query<{ total: string }>(
        `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
         WHERE user_id = $1 AND type = 'expense' 
         AND EXTRACT(MONTH FROM date) = $2 
         AND EXTRACT(YEAR FROM date) = $3`,
        [user.id, parseInt(month), parseInt(year)]
      );

      const budget = result.rows[0] || null;
      const totalExpense = parseFloat(expenseResult.rows[0]?.total || "0");
      const budgetAmount = budget ? parseFloat(String(budget.amount)) : 0;
      const remaining = budgetAmount - totalExpense;
      const percentage = budgetAmount > 0 ? (totalExpense / budgetAmount) * 100 : 0;

      let status: "safe" | "warning" | "danger" = "safe";
      if (percentage >= 100) {
        status = "danger";
      } else if (percentage >= 80) {
        status = "warning";
      }

      return NextResponse.json({
        budget,
        totalExpense,
        remaining,
        percentage: Math.round(percentage * 100) / 100,
        status,
      });
    } else {
      // Get all budgets for user
      const result = await db.query<Budget>(
        `SELECT * FROM budgets WHERE user_id = $1 ORDER BY year DESC, month DESC`,
        [user.id]
      );
      return NextResponse.json({ budgets: result.rows });
    }
  } catch (error: any) {
    console.error("GET budgets error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/budgets - Create or update budget
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { month, year, amount } = body;

    if (!month || !year || amount === undefined) {
      return NextResponse.json({ message: "Month, year, and amount are required" }, { status: 400 });
    }

    const parsedMonth = parseInt(month);
    const parsedYear = parseInt(year);
    const parsedAmount = parseFloat(amount);

    if (parsedMonth < 1 || parsedMonth > 12) {
      return NextResponse.json({ message: "Month must be between 1 and 12" }, { status: 400 });
    }
    if (parsedYear < 2000 || parsedYear > 2100) {
      return NextResponse.json({ message: "Year must be between 2000 and 2100" }, { status: 400 });
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ message: "Amount must be a positive number" }, { status: 400 });
    }

    const db = getDatabase();

    // Upsert: insert or update if exists
    const result = await db.query<Budget>(
      `INSERT INTO budgets (user_id, month, year, amount)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, month, year) 
       DO UPDATE SET amount = $4, updated_at = NOW()
       RETURNING *`,
      [user.id, parsedMonth, parsedYear, parsedAmount]
    );

    return NextResponse.json({ budget: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error("POST budget error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/budgets?id=<uuid>
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Missing budget id" }, { status: 400 });

    const db = getDatabase();
    const result = await db.query(
      `DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "Not found or forbidden" }, { status: 404 });
    }

    return new NextResponse("", { status: 204 });
  } catch (error: any) {
    console.error("DELETE budget error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
