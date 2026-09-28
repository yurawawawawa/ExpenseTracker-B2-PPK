import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";
import {
  DuplicateEmailError,
  registerUser,
  RegistrationValidationError,
} from "./register";
import type { DatabaseClient } from "../db";

function databaseFor(rows: Array<{ id: string; name?: string; email?: string }>): DatabaseClient {
  return {
    async query() {
      return { rows };
    },
  } as DatabaseClient;
}

describe("registerUser", () => {
  it("rejects empty fields", async () => {
    await expect(
      registerUser({ name: "", email: "", password: "" }, databaseFor([])),
    ).rejects.toBeInstanceOf(RegistrationValidationError);
  });

  it("rejects invalid email", async () => {
    await expect(
      registerUser({ name: "Ayu", email: "not-an-email", password: "secret123" }, databaseFor([])),
    ).rejects.toThrow("valid email");
  });

  it("rejects a duplicate email", async () => {
    await expect(
      registerUser(
        { name: "Ayu", email: "ayu@example.com", password: "secret123" },
        databaseFor([{ id: "existing" }]),
      ),
    ).rejects.toBeInstanceOf(DuplicateEmailError);
  });

  it("maps a database unique violation to a duplicate email error", async () => {
    const database = {
      async query(_text, values = []) {
        if (values.length === 1) return { rows: [] };
        throw { code: "23505" };
      },
    } as DatabaseClient;

    await expect(
      registerUser(
        { name: "Ayu", email: "ayu@example.com", password: "secret123" },
        database,
      ),
    ).rejects.toBeInstanceOf(DuplicateEmailError);
  });

  it("stores a bcrypt hash and returns the created account", async () => {
    let insertedValues: readonly unknown[] = [];
    const database = {
      async query(_text, values = []) {
        if (values.length === 1) return { rows: [] };
        insertedValues = values;
        return { rows: [{ id: "new-id", name: "Ayu", email: "ayu@example.com" }] };
      },
    } as DatabaseClient;

    const account = await registerUser(
      { name: " Ayu ", email: "AYU@EXAMPLE.COM", password: "secret123" },
      database,
    );

    expect(account).toEqual({ id: "new-id", name: "Ayu", email: "ayu@example.com" });
    expect(insertedValues[0]).toBe("Ayu");
    expect(insertedValues[1]).toBe("ayu@example.com");
    expect(insertedValues[2]).not.toBe("secret123");
    await expect(bcrypt.compare("secret123", String(insertedValues[2]))).resolves.toBe(true);
  });
});