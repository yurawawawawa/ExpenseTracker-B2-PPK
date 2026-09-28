import bcrypt from "bcryptjs";
import { getDatabase, type DatabaseClient } from "../db";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RegisterInput = { name: string; email: string; password: string };
export class RegistrationValidationError extends Error {}
export class DuplicateEmailError extends Error {}

export async function registerUser(input: RegisterInput, database?: DatabaseClient) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name || !email || !input.password) {
    throw new RegistrationValidationError("Name, email, and password are required");
  }
  if (name.length > 120) throw new RegistrationValidationError("Name is too long");
  if (!EMAIL_PATTERN.test(email)) {
    throw new RegistrationValidationError("Enter a valid email address");
  }
  if (input.password.length < 8 || input.password.length > 72) {
    throw new RegistrationValidationError("Password must be between 8 and 72 characters");
  }

  const databaseClient = database ?? getDatabase();
  const existing = await databaseClient.query<{ id: string }>(
    "SELECT id FROM users WHERE email = $1 LIMIT 1",
    [email],
  );
  if (existing.rows.length > 0) throw new DuplicateEmailError();

  try {
    const passwordHash = await bcrypt.hash(input.password, 12);
    const result = await databaseClient.query<{ id: string; name: string; email: string }>(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, passwordHash],
    );
    return result.rows[0];
  } catch (error: unknown) {
    if (isUniqueViolation(error)) throw new DuplicateEmailError();
    throw error;
  }
}

function isUniqueViolation(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}