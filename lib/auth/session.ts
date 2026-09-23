import crypto from "node:crypto";
import { cookies } from "next/headers";
import { getDatabase, type DatabaseClient } from "../db";

const COOKIE_NAME = "expense_tracker_session";
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7;

type SessionUser = { id: string; name: string; email: string };

function maxAge() {
  const configured = Number(process.env.SESSION_MAX_AGE_SECONDS);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_MAX_AGE;
}

function sessionHash(token: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("Missing required session configuration: SESSION_SECRET");
  return crypto.createHmac("sha256", secret).update(token).digest("hex");
}

export function hashSessionToken(token: string) {
  return sessionHash(token);
}

function newToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export async function createSession(userId: string, database: DatabaseClient = getDatabase()) {
  const token = newToken();
  const expiresAt = new Date(Date.now() + maxAge() * 1000);
  await database.query(
    "INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
    [userId, sessionHash(token), expiresAt],
  );

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAge(),
  });
}

export async function getCurrentUser(database: DatabaseClient = getDatabase()): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  return findUserByToken(token, database);
}

export async function findUserByToken(token: string, database: DatabaseClient) {
  if (!token) return null;

  const result = await database.query<SessionUser>(
    `SELECT users.id, users.name, users.email
     FROM sessions JOIN users ON users.id = sessions.user_id
     WHERE sessions.token_hash = $1 AND sessions.expires_at > NOW()
     LIMIT 1`,
    [sessionHash(token)],
  );
  return result.rows[0] ?? null;
}

export async function invalidateSessionToken(token: string, database: DatabaseClient) {
  await database.query("DELETE FROM sessions WHERE token_hash = $1", [sessionHash(token)]);
}

export async function destroySession(database: DatabaseClient = getDatabase()) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) await invalidateSessionToken(token, database);
  cookieStore.delete(COOKIE_NAME);
}

export { COOKIE_NAME, DEFAULT_MAX_AGE };