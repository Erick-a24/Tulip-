import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { loginSchema } from "@/server/validation/schemas";
import { login } from "@/server/services/authService";
import { setSessionCookie } from "@/server/auth/session";
import { toApiError } from "@/server/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = loginSchema.parse(body);
    const token = await login(input);
    await setSessionCookie(token);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? "Invalid input." }, { status: 400 });
    }
    const { status, body } = toApiError(error);
    return NextResponse.json(body, { status });
  }
}
