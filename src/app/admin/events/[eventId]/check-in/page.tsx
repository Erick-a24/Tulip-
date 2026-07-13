import { notFound } from "next/navigation";
import { getEventById } from "@/server/services/eventService";
import { listRegistrationsForEvent } from "@/server/services/registrationService";
import { RegistrationTable } from "@/components/registrations/RegistrationTable";
import { NotFoundError } from "@/server/errors";

export default async function CheckInPage({ params }: { params: { eventId: string } }) {
  let event;
  try {
    event = await getEventById(params.eventId);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  const registrations = await listRegistrationsForEvent(params.eventId);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{event.title} — Check-in</h1>
          <p className="mt-1 text-sm text-slate-500">
            {event.registrationCount} registered
            {event.spotsRemaining != null ? ` (${event.spotsRemaining} spots remaining)` : ""}
          </p>
        </div>
        <a
          href={`/api/events/${event.id}/registrations/export`}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
        >
          Export CSV
        </a>
      </div>

      <div className="mt-6">
        <RegistrationTable registrations={registrations} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
