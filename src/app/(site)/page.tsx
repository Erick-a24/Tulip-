import { listUpcomingEvents } from "@/server/services/eventService";
import { EventCard } from "@/components/events/EventCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await listUpcomingEvents();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Upcoming events</h1>
      <p className="mt-1 text-sm text-slate-500">Register below to reserve your spot.</p>

      {events.length === 0 ? (
        <p className="mt-8 text-sm text-slate-500">There are no upcoming events right now. Check back soon.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
