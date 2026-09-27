import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db";
import { Transaction } from "@/lib/types";


export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const date = searchParams.get("date"); // YYYY-MM-DD
    const month = searchParams.get("month"); // YYYY-MM

    let query = `SELECT * FROM transactions WHERE user_id = $1`;
    const values: any[] = [user.id];
    let paramIndex = 2;

    if (type && type !== "all") {
      query += ` AND type = $${paramIndex++}`;
      values.push(type);
    }
    if (category && category !== "all" && category !== "") {
      query += ` AND category ILIKE $${paramIndex++}`;
      values.push(`%${category}%`);
    }
    if (date) {
      query += ` AND date = $${paramIndex++}`;
      values.push(date);
    } else if (month) {
      // Month format: '2026-09'
      const [yearStr, monthStr] = month.split('-');
      if (yearStr && monthStr) {
        query += ` AND EXTRACT(YEAR FROM date) = $${paramIndex++} AND EXTRACT(MONTH FROM date) = $${paramIndex++}`;
        values.push(parseInt(yearStr), parseInt(monthStr));
      }
    }

    query += ` ORDER BY date DESC, created_at DESC`;

    const db = getDatabase();
    const result = await db.query(query, values);

    return NextResponse.json({ transactions: result.rows });
  } catch (error: any) {
    console.error("GET transactions error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { amount, type, description, category, date } = body;

    if (amount === undefined || !type || !date) {
      return NextResponse.json({ message: "Amount, type, and date are required" }, { status: 400 });
    }

    const db = getDatabase();
    const result = await db.query<Transaction>(
      `INSERT INTO transactions (user_id, amount, type, description, category, date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user.id, amount, type, description, category, date]
    );

    return NextResponse.json({ transaction: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error("POST transaction error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ message: "Missing transaction id" }, { status: 400 });

    const updates = await request.json();
    const { amount, type, description, category, date } = updates;

    const db = getDatabase();
    // Validate ownership
    const existing = await db.query('SELECT id FROM transactions WHERE id = $1 AND user_id = $2', [id, user.id]);
    if (existing.rows.length === 0) return NextResponse.json({ message: "Not found or forbidden" }, { status: 404 });

    const result = await db.query<Transaction>(
      `UPDATE transactions 
       SET amount = COALESCE($1, amount), 
           type = COALESCE($2, type), 
           description = COALESCE($3, description), 
           category = COALESCE($4, category), 
           date = COALESCE($5, date)
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [amount, type, description, category, date, id, user.id]
    );

    return NextResponse.json({ transaction: result.rows[0] });
  } catch (error: any) {
    console.error("PUT transaction error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ message: "Missing transaction id" }, { status: 400 });

    const db = getDatabase();
    const result = await db.query(
      `DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, user.id]
    );

    if (result.rows.length === 0) return NextResponse.json({ message: "Not found or forbidden" }, { status: 404 });

    return new NextResponse('', { status: 204 });
  } catch (error: any) {
    console.error("DELETE transaction error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
