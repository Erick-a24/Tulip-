import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { registrationInputSchema } from "@/server/validation/schemas";
import { registerAttendee } from "@/server/services/registrationService";
import { toApiError } from "@/server/errors";

export async function POST(request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const body = await request.json();
    const input = registrationInputSchema.parse(body);
    const registration = await registerAttendee(params.eventId, input);
    return NextResponse.json({ registrationId: registration.id }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? "Invalid input." }, { status: 400 });
    }
    const { status, body } = toApiError(error);
    return NextResponse.json(body, { status });
  }
}
