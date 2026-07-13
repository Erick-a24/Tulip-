import { notFound } from "next/navigation";
import { getEventById } from "@/server/services/eventService";
import { RegistrationForm } from "@/components/registrations/RegistrationForm";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { NotFoundError } from "@/server/errors";

function formatDateRange(startsAt: Date, endsAt: Date) {
  const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "long", timeStyle: "short" });
  return `${dateFormatter.format(startsAt)} – ${dateFormatter.format(endsAt)}`;
}

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: { eventId: string } }) {
  let event;
  try {
    event = await getEventById(params.eventId);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  const isFull = event.spotsRemaining === 0;
  const isClosed = event.endsAt < new Date();

  return (
    <div className="grid gap-6 sm:grid-cols-5">
      <div className="sm:col-span-3">
        <h1 className="text-2xl font-semibold text-slate-900">{event.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{formatDateRange(event.startsAt, event.endsAt)}</p>
        <p className="mt-1 text-sm text-slate-500">{event.location}</p>
        {event.spotsRemaining != null ? (
          <Badge tone={isFull ? "danger" : "success"} className="mt-3">
            {isFull ? "Full" : `${event.spotsRemaining} spots left`}
          </Badge>
        ) : null}
        <p className="mt-4 whitespace-pre-line text-sm text-slate-700">{event.description}</p>
      </div>

      <div className="sm:col-span-2">
        <Card>
          <h2 className="text-base font-semibold text-slate-900">Register</h2>
          {isClosed ? (
            <p className="mt-3 text-sm text-slate-500">Registration is closed for this event.</p>
          ) : isFull ? (
            <p className="mt-3 text-sm text-slate-500">This event is full.</p>
          ) : (
            <div className="mt-3">
              <RegistrationForm eventId={event.id} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
