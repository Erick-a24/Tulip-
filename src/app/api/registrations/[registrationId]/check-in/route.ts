import { NextRequest, NextResponse } from "next/server";
import { checkIn } from "@/server/services/registrationService";
import { getCurrentSession } from "@/server/auth/session";
import { toApiError, UnauthorizedError } from "@/server/errors";

export async function POST(_request: NextRequest, { params }: { params: { registrationId: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      throw new UnauthorizedError("You must be signed in to check in an attendee.");
    }

    const registration = await checkIn(params.registrationId);
    return NextResponse.json(registration);
  } catch (error) {
    const { status, body } = toApiError(error);
    return NextResponse.json(body, { status });
  }
}
