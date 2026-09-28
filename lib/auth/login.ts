import bcrypt from "bcryptjs";
import { getDatabase, type DatabaseClient } from "../db";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class LoginValidationError extends Error {}
export class InvalidCredentialsError extends Error {}

export async function authenticateUser(
  emailInput: string,
  password: string,
  database: DatabaseClient = getDatabase(),
) {
  const email = emailInput.trim().toLowerCase();
  if (!email || !password) throw new LoginValidationError("Email and password are required");
  if (!EMAIL_PATTERN.test(email)) throw new LoginValidationError("Enter a valid email address");

  const result = await database.query<{ id: string; password_hash: string }>(
    "SELECT id, password_hash FROM users WHERE email = $1 LIMIT 1",
    [email],
  );
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new InvalidCredentialsError("Invalid email or password");
  }
  return { id: user.id };
}