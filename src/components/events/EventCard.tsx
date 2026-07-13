import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { EventWithCounts } from "@/types";

function formatDateRange(startsAt: Date, endsAt: Date) {
  const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });
  return `${dateFormatter.format(startsAt)} – ${dateFormatter.format(endsAt)}`;
}

export function EventCard({ event }: { event: EventWithCounts }) {
  const isFull = event.spotsRemaining === 0;

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">{event.title}</h3>
          {isFull ? (
            <Badge tone="danger">Full</Badge>
          ) : event.spotsRemaining != null ? (
            <Badge tone="success">{event.spotsRemaining} spots left</Badge>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-slate-500">{formatDateRange(event.startsAt, event.endsAt)}</p>
        <p className="mt-1 text-sm text-slate-500">{event.location}</p>
      </Card>
    </Link>
  );
}
