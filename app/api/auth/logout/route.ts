import { destroySession } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ message: "Logout successful" });
  } catch (error: unknown) {
    console.error("Logout error:", error);
    return NextResponse.json({ message: "Logout could not be completed" }, { status: 500 });
  }
}