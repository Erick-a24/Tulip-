"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

function toDateTimeLocal(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

type EventFormValues = {
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  capacity: string;
};

type EventFormProps = {
  eventId?: string;
  initialValues?: {
    title: string;
    description: string;
    location: string;
    startsAt: Date;
    endsAt: Date;
    capacity: number | null;
  };
};

export function EventForm({ eventId, initialValues }: EventFormProps) {
  const router = useRouter();
  const isEditing = Boolean(eventId);

  const [values, setValues] = useState<EventFormValues>({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    location: initialValues?.location ?? "",
    startsAt: initialValues ? toDateTimeLocal(initialValues.startsAt) : "",
    endsAt: initialValues ? toDateTimeLocal(initialValues.endsAt) : "",
    capacity: initialValues?.capacity != null ? String(initialValues.capacity) : "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      title: values.title,
      description: values.description,
      location: values.location,
      startsAt: values.startsAt,
      endsAt: values.endsAt,
      capacity: values.capacity ? Number(values.capacity) : null,
    };

    try {
      const response = await fetch(isEditing ? `/api/events/${eventId}` : "/api/events", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div>
        <Label htmlFor="title">Event title</Label>
        <Input
          id="title"
          value={values.title}
          onChange={(event) => updateField("title", event.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={4}
          value={values.description}
          onChange={(event) => updateField("description", event.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={values.location}
          onChange={(event) => updateField("location", event.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="startsAt">Starts at</Label>
          <Input
            id="startsAt"
            type="datetime-local"
            value={values.startsAt}
            onChange={(event) => updateField("startsAt", event.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="endsAt">Ends at</Label>
          <Input
            id="endsAt"
            type="datetime-local"
            value={values.endsAt}
            onChange={(event) => updateField("endsAt", event.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="capacity">Capacity (optional)</Label>
        <Input
          id="capacity"
          type="number"
          min={1}
          value={values.capacity}
          onChange={(event) => updateField("capacity", event.target.value)}
          placeholder="Leave blank for unlimited"
        />
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : isEditing ? "Save changes" : "Create event"}
      </Button>
    </form>
  );
}
