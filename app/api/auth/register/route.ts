import {
  DuplicateEmailError,
  registerUser,
  RegistrationValidationError,
  type RegisterInput,
} from "@/lib/auth/register";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as Partial<RegisterInput>;
    await registerUser({
      name: input.name ?? "",
      email: input.email ?? "",
      password: input.password ?? "",
    });

    return NextResponse.json({ message: "Registration successful" }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof RegistrationValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    if (error instanceof DuplicateEmailError) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { message: "Registration could not be completed" },
      { status: 500 },
    );
  }
}