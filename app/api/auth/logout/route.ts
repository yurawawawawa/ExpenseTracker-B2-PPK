import { destroySession } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await destroySession();
  } finally {
    return NextResponse.json({ message: "Logout successful" });
  }
}