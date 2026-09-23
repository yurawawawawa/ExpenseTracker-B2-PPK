import { authenticateUser, InvalidCredentialsError, LoginValidationError } from "@/lib/auth/login";
import { getDatabase } from "@/lib/db";
import { createSession } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as { email?: string; password?: string };
    const database = getDatabase();
    const user = await authenticateUser(input.email ?? "", input.password ?? "", database);
    await createSession(user.id, database);
    return NextResponse.json({ message: "Login successful" });
  } catch (error: unknown) {
    if (error instanceof LoginValidationError) return NextResponse.json({ message: error.message }, { status: 400 });
    if (error instanceof InvalidCredentialsError) return NextResponse.json({ message: error.message }, { status: 401 });
    return NextResponse.json({ message: "Login could not be completed" }, { status: 500 });
  }
}