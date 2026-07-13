"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this event? All registrations for it will be removed too. This cannot be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    await fetch(`/api/events/${eventId}`, { method: "DELETE" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <Button variant="danger" onClick={handleDelete} disabled={deleting}>
      {deleting ? "Deleting…" : "Delete event"}
    </Button>
  );
}
