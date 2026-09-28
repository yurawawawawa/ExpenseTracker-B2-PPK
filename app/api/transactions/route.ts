import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db";
import { Transaction } from "@/lib/types";
import {
  assertPlainObject,
  TransactionValidationError,
  validateAmount,
  validateDate,
  validateMonth,
  validateText,
  validateType,
} from "../../../lib/transaction-validation";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

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
    const values: unknown[] = [user.id];
    let paramIndex = 2;

    if (type && type !== "all") {
      validateType(type);
      query += ` AND type = $${paramIndex++}`;
      values.push(type);
    }
    if (category && category !== "all" && category !== "") {
      validateText(category, "Category", 100);
      query += ` AND category ILIKE $${paramIndex++}`;
      values.push(`%${category}%`);
    }
    if (date) {
      validateDate(date);
      query += ` AND date = $${paramIndex++}`;
      values.push(date);
    } else if (month) {
      const { year, month: monthNumber } = validateMonth(month);
      query += ` AND EXTRACT(YEAR FROM date) = $${paramIndex++} AND EXTRACT(MONTH FROM date) = $${paramIndex++}`;
      values.push(year, monthNumber);
    }

    query += ` ORDER BY date DESC, created_at DESC`;

    const db = getDatabase();
    const result = await db.query(query, values);

    return NextResponse.json({ transactions: result.rows });
  } catch (error: unknown) {
    if (error instanceof TransactionValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    console.error("GET transactions error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body: unknown = await request.json();
    assertPlainObject(body);
    const { amount, type, description, category, date } = body;

    if (amount === undefined || !type || !date) {
      return NextResponse.json({ message: "Amount, type, and date are required" }, { status: 400 });
    }

    const validatedAmount = validateAmount(amount);
    const validatedType = validateType(type);
    const validatedDate = validateDate(date);
    const validatedDescription = validateText(description, "Description", 2000);
    const validatedCategory = validateText(category, "Category", 100);

    const db = getDatabase();
    const result = await db.query<Transaction>(
      `INSERT INTO transactions (user_id, amount, type, description, category, date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user.id, validatedAmount, validatedType, validatedDescription, validatedCategory, validatedDate]
    );

    return NextResponse.json({ transaction: result.rows[0] }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof SyntaxError) return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    if (error instanceof TransactionValidationError) return NextResponse.json({ message: error.message }, { status: 400 });
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
    if (!id || !isUuid(id)) return NextResponse.json({ message: "Invalid transaction id" }, { status: 400 });

    const updates: unknown = await request.json();
    assertPlainObject(updates);
    const fields: string[] = [];
    const values: unknown[] = [];

    if (Object.prototype.hasOwnProperty.call(updates, "amount")) {
      fields.push(`amount = $${values.length + 1}`);
      values.push(validateAmount(updates.amount));
    }
    if (Object.prototype.hasOwnProperty.call(updates, "type")) {
      fields.push(`type = $${values.length + 1}`);
      values.push(validateType(updates.type));
    }
    if (Object.prototype.hasOwnProperty.call(updates, "description")) {
      fields.push(`description = $${values.length + 1}`);
      values.push(validateText(updates.description, "Description", 2000));
    }
    if (Object.prototype.hasOwnProperty.call(updates, "category")) {
      fields.push(`category = $${values.length + 1}`);
      values.push(validateText(updates.category, "Category", 100));
    }
    if (Object.prototype.hasOwnProperty.call(updates, "date")) {
      fields.push(`date = $${values.length + 1}`);
      values.push(validateDate(updates.date));
    }
    if (fields.length === 0) return NextResponse.json({ message: "At least one field is required" }, { status: 400 });

    const db = getDatabase();

    const result = await db.query<Transaction>(
      `UPDATE transactions SET ${fields.join(", ")} WHERE id = $${values.length + 1} AND user_id = $${values.length + 2} RETURNING *`,
      [...values, id, user.id]
    );

    if (result.rows.length === 0) return NextResponse.json({ message: "Not found or forbidden" }, { status: 404 });

    return NextResponse.json({ transaction: result.rows[0] });
  } catch (error: unknown) {
    if (error instanceof SyntaxError) return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    if (error instanceof TransactionValidationError) return NextResponse.json({ message: error.message }, { status: 400 });
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
    if (!id || !isUuid(id)) return NextResponse.json({ message: "Invalid transaction id" }, { status: 400 });

    const db = getDatabase();
    const result = await db.query(
      `DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, user.id]
    );

    if (result.rows.length === 0) return NextResponse.json({ message: "Not found or forbidden" }, { status: 404 });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error("DELETE transaction error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
