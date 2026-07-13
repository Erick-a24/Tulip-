import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { eventInputSchema } from "@/server/validation/schemas";
import { createEvent } from "@/server/services/eventService";
import { getCurrentSession } from "@/server/auth/session";
import { toApiError, UnauthorizedError } from "@/server/errors";

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      throw new UnauthorizedError("You must be signed in to create an event.");
    }

    const body = await request.json();
    const input = eventInputSchema.parse(body);
    const event = await createEvent(input);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? "Invalid input." }, { status: 400 });
    }
    const { status, body } = toApiError(error);
    return NextResponse.json(body, { status });
  }
}
