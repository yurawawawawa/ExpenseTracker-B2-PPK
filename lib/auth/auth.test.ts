import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";
import { authenticateUser, InvalidCredentialsError } from "./login";
import { findUserByToken, hashSessionToken, invalidateSessionToken } from "./session";
import type { DatabaseClient } from "../db";

describe("authentication", () => {
  it("rejects empty login fields", async () => {
    await expect(authenticateUser("", "", {} as DatabaseClient)).rejects.toThrow("required");
  });

  it("logs in with a valid password", async () => {
    const hash = await bcrypt.hash("correct-password", 4);
    const database = { query: async () => ({ rows: [{ id: "user-1", password_hash: hash }] }) } as DatabaseClient;
    await expect(authenticateUser("USER@example.com", "correct-password", database)).resolves.toEqual({ id: "user-1" });
  });

  it("rejects invalid credentials without identifying the failed field", async () => {
    const hash = await bcrypt.hash("correct-password", 4);
    const database = { query: async () => ({ rows: [{ id: "user-1", password_hash: hash }] }) } as DatabaseClient;
    await expect(authenticateUser("user@example.com", "wrong-password", database)).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("accepts a valid session and rejects an expired session", async () => {
    process.env.SESSION_SECRET = "test-secret";
    const database = {
      query: async (_sql: string, values?: readonly unknown[]) => ({
        rows: values?.[0] === hashSessionToken("expired") ? [] : [{ id: "user-1", name: "Ayu", email: "ayu@example.com" }],
      }),
    } as DatabaseClient;
    await expect(findUserByToken("valid", database)).resolves.toMatchObject({ id: "user-1" });
    await expect(findUserByToken("expired", database)).resolves.toBeNull();
  });

  it("invalidates a session on logout", async () => {
    process.env.SESSION_SECRET = "test-secret";
    let deletedToken = "";
    const database = {
      query: async (_sql: string, values?: readonly unknown[]) => {
        deletedToken = String(values?.[0]);
        return { rows: [] };
      },
    } as DatabaseClient;
    await invalidateSessionToken("logout-token", database);
    expect(deletedToken).toBe(hashSessionToken("logout-token"));
  });
});