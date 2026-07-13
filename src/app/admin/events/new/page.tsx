import { EventForm } from "@/components/events/EventForm";
import { Card } from "@/components/ui/Card";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900">Create event</h1>
      <Card className="mt-6">
        <EventForm />
      </Card>
    </div>
  );
}
