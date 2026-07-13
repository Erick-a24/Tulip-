import { NextRequest, NextResponse } from "next/server";
import { getEventById } from "@/server/services/eventService";
import { listRegistrationsForEvent } from "@/server/services/registrationService";
import { getCurrentSession } from "@/server/auth/session";
import { toApiError, UnauthorizedError } from "@/server/errors";
import { toCsv } from "@/server/csv";

export async function GET(_request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      throw new UnauthorizedError("You must be signed in to export registrations.");
    }

    const event = await getEventById(params.eventId);
    const registrations = await listRegistrationsForEvent(params.eventId);

    const rows = [
      ["Name", "Email", "Phone", "Status", "Checked in at", "Registered at"],
      ...registrations.map((registration) => [
        registration.attendee.name,
        registration.attendee.email,
        registration.attendee.phone ?? "",
        registration.status,
        registration.checkedInAt ? registration.checkedInAt.toISOString() : "",
        registration.createdAt.toISOString(),
      ]),
    ];

    const csv = toCsv(rows);
    const filename = `${event.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-registrations.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const { status, body } = toApiError(error);
    return NextResponse.json(body, { status });
  }
}
