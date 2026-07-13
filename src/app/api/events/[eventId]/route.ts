import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { eventInputSchema } from "@/server/validation/schemas";
import { deleteEvent, updateEvent } from "@/server/services/eventService";
import { getCurrentSession } from "@/server/auth/session";
import { toApiError, UnauthorizedError } from "@/server/errors";

export async function PATCH(request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      throw new UnauthorizedError("You must be signed in to update an event.");
    }

    const body = await request.json();
    const input = eventInputSchema.parse(body);
    const event = await updateEvent(params.eventId, input);
    return NextResponse.json(event);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? "Invalid input." }, { status: 400 });
    }
    const { status, body } = toApiError(error);
    return NextResponse.json(body, { status });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      throw new UnauthorizedError("You must be signed in to delete an event.");
    }

    await deleteEvent(params.eventId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const { status, body } = toApiError(error);
    return NextResponse.json(body, { status });
  }
}
