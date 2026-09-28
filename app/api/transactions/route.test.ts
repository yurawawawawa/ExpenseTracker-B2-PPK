import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, GET, POST, PUT } from "./route";

const { getCurrentUser, query } = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  query: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({ getCurrentUser }));
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }));

function request(url: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(`http://localhost${url}`, init);
}

describe("transaction API authorization and validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUser.mockResolvedValue({ id: "user-1", name: "Ayu", email: "ayu@example.com" });
    query.mockResolvedValue({ rows: [] });
  });

  it("requires a session for protected reads", async () => {
    getCurrentUser.mockResolvedValue(null);

    const response = await GET(request("/api/transactions"));

    expect(response.status).toBe(401);
    expect(query).not.toHaveBeenCalled();
  });

  it("scopes filtered history to the authenticated user", async () => {
    const response = await GET(request("/api/transactions?type=expense&month=2026-09"));

    expect(response.status).toBe(200);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("WHERE user_id = $1"),
      ["user-1", "expense", 2026, 9],
    );
  });

  it("rejects invalid transaction input before writing", async () => {
    const response = await POST(
      request("/api/transactions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: 10, type: "transfer", date: "2026-09-28" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });

  it("does not update another user's transaction", async () => {
    const response = await PUT(
      request("/api/transactions?id=123e4567-e89b-12d3-a456-426614174000", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: 99 }),
      }),
    );

    expect(response.status).toBe(404);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("WHERE id = $2 AND user_id = $3"),
      [99, "123e4567-e89b-12d3-a456-426614174000", "user-1"],
    );
  });

  it("does not delete another user's transaction", async () => {
    const response = await DELETE(
      request("/api/transactions?id=123e4567-e89b-12d3-a456-426614174000", { method: "DELETE" }),
    );

    expect(response.status).toBe(404);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("WHERE id = $1 AND user_id = $2"),
      ["123e4567-e89b-12d3-a456-426614174000", "user-1"],
    );
  });
});