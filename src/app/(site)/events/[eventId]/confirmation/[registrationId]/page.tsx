import Link from "next/link";
import { notFound } from "next/navigation";
import { getRegistrationById } from "@/server/services/registrationService";
import { generateCheckInQrCode } from "@/server/qrcode";
import { Card } from "@/components/ui/Card";
import { NotFoundError } from "@/server/errors";

function formatDateRange(startsAt: Date, endsAt: Date) {
  const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "long", timeStyle: "short" });
  return `${dateFormatter.format(startsAt)} – ${dateFormatter.format(endsAt)}`;
}

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  params,
}: {
  params: { eventId: string; registrationId: string };
}) {
  let registration;
  try {
    registration = await getRegistrationById(params.registrationId);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  if (registration.eventId !== params.eventId) {
    notFound();
  }

  const qrCodeDataUrl = await generateCheckInQrCode(registration.checkInCode);

  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="text-2xl font-semibold text-slate-900">You&apos;re registered!</h1>
      <p className="mt-2 text-sm text-slate-500">
        Thanks, {registration.attendee.name}. Here is your confirmation for {registration.event.title}.
      </p>

      <Card className="mt-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrCodeDataUrl}
          alt="Check-in QR code"
          className="mx-auto h-48 w-48"
        />
        <p className="mt-4 text-xs uppercase tracking-wide text-slate-400">Check-in code</p>
        <p className="mt-1 font-mono text-lg font-semibold text-slate-900">{registration.checkInCode}</p>
        <p className="mt-4 text-sm text-slate-500">
          {formatDateRange(registration.event.startsAt, registration.event.endsAt)}
        </p>
        <p className="text-sm text-slate-500">{registration.event.location}</p>
      </Card>

      <p className="mt-4 text-sm text-slate-500">
        Show this code at check-in on the day of the event.
      </p>

      <Link
        href="/"
        className="mt-6 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Back to events
      </Link>
    </div>
  );
}
