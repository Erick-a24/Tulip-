"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import type { RegistrationWithAttendee } from "@/types";

const statusTone = {
  REGISTERED: "neutral",
  CHECKED_IN: "success",
  CANCELLED: "danger",
} as const;

export function RegistrationTable({ registrations }: { registrations: RegistrationWithAttendee[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return registrations;
    return registrations.filter(
      (registration) =>
        registration.attendee.name.toLowerCase().includes(normalized) ||
        registration.attendee.email.toLowerCase().includes(normalized)
    );
  }, [registrations, query]);

  async function handleCheckIn(registrationId: string) {
    setPendingId(registrationId);
    await fetch(`/api/registrations/${registrationId}/check-in`, { method: "POST" });
    setPendingId(null);
    router.refresh();
  }

  if (registrations.length === 0) {
    return <p className="text-sm text-slate-500">No one has registered for this event yet.</p>;
  }

  return (
    <div>
      <Input
        type="search"
        placeholder="Search by name or email…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="mb-4 max-w-sm"
        aria-label="Search attendees"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500">No attendees match &quot;{query}&quot;.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[560px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Attendee</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Contact</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((registration) => (
                <tr key={registration.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{registration.attendee.name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <div>{registration.attendee.email}</div>
                    {registration.attendee.phone ? (
                      <div className="text-slate-400">{registration.attendee.phone}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone[registration.status]}>{registration.status.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {registration.status === "REGISTERED" ? (
                      <Button
                        variant="secondary"
                        onClick={() => handleCheckIn(registration.id)}
                        disabled={pendingId === registration.id}
                      >
                        {pendingId === registration.id ? "Checking in…" : "Check in"}
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
