import { notFound } from "next/navigation";
import { getEventById } from "@/server/services/eventService";
import { EventForm } from "@/components/events/EventForm";
import { DeleteEventButton } from "@/components/events/DeleteEventButton";
import { Card } from "@/components/ui/Card";
import { NotFoundError } from "@/server/errors";

export default async function EditEventPage({ params }: { params: { eventId: string } }) {
  let event;
  try {
    event = await getEventById(params.eventId);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Edit event</h1>
        <DeleteEventButton eventId={event.id} />
      </div>
      <Card className="mt-6">
        <EventForm
          eventId={event.id}
          initialValues={{
            title: event.title,
            description: event.description,
            location: event.location,
            startsAt: event.startsAt,
            endsAt: event.endsAt,
            capacity: event.capacity,
          }}
        />
      </Card>
    </div>
  );
}

export const dynamic = "force-dynamic";
