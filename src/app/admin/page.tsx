import Link from "next/link";
import { listAllEventsForAdmin } from "@/server/services/eventService";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

function formatDateRange(startsAt: Date, endsAt: Date) {
  const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });
  return `${dateFormatter.format(startsAt)} – ${dateFormatter.format(endsAt)}`;
}

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const events = await listAllEventsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Events</h1>
        <Link href="/admin/events/new">
          <Button>New event</Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="mt-8 text-sm text-slate-500">No events yet. Create your first one.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-slate-900">{event.title}</h2>
                  <Badge tone="neutral">
                    {event.registrationCount} registered
                    {event.spotsRemaining != null ? ` / ${event.registrationCount + event.spotsRemaining}` : ""}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">{formatDateRange(event.startsAt, event.endsAt)}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/events/${event.id}/check-in`}>
                  <Button variant="secondary">Check-in</Button>
                </Link>
                <Link href={`/admin/events/${event.id}`}>
                  <Button variant="secondary">Edit</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
