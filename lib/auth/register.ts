import bcrypt from "bcryptjs";
import { getDatabase, type DatabaseClient } from "../db";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export class RegistrationValidationError extends Error {}
export class DuplicateEmailError extends Error {}

function validateInput(input: RegisterInput) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (!name || !email || !input.password) {
    throw new RegistrationValidationError("Name, email, and password are required");
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new RegistrationValidationError("Enter a valid email address");
  }

  return { name, email };
}

export async function registerUser(
  input: RegisterInput,
  database?: DatabaseClient,
) {
  const { name, email } = validateInput(input);
  const databaseClient = database ?? getDatabase();
  const existing = await databaseClient.query<{ id: string }>(
    "SELECT id FROM users WHERE email = $1 LIMIT 1",
    [email],
  );

  if (existing.rows.length > 0) {
    throw new DuplicateEmailError("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    const result = await databaseClient.query<{ id: string; name: string; email: string }>(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, passwordHash],
    );

    return result.rows[0];
  } catch (error: unknown) {
    if (isUniqueViolation(error)) {
      throw new DuplicateEmailError("An account with this email already exists");
    }
    throw error;
  }
}

function isUniqueViolation(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}