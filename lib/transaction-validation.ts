export const TRANSACTION_TYPES = ["income", "expense"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export class TransactionValidationError extends Error {}

function invalid(message: string): never {
  throw new TransactionValidationError(message);
}

export function validateAmount(value: unknown): number {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 9999999999999.99) invalid("Amount must be a positive number");
  if (Math.round(amount * 100) !== amount * 100) invalid("Amount may have at most two decimal places");
  return amount;
}

export function validateType(value: unknown): TransactionType {
  if (value !== "income" && value !== "expense") invalid("Type must be income or expense");
  return value;
}

export function validateDate(value: unknown): string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) invalid("Date must use YYYY-MM-DD format");
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) invalid("Date is invalid");
  return value;
}

export function validateMonth(value: string): { year: number; month: number } {
  const match = MONTH_PATTERN.exec(value);
  if (!match) invalid("Month must use YYYY-MM format");
  return { year: Number(match[1]), month: Number(match[2]) };
}

export function validateText(value: unknown, field: string, maxLength: number): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string" || value.length > maxLength) invalid(`${field} is invalid`);
  return value.trim() || null;
}

export function assertPlainObject(value: unknown): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) invalid("Request body must be an object");
}