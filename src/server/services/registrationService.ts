import crypto from "crypto";
import { prisma } from "@/server/db/prisma";
import { ConflictError, NotFoundError, ValidationError } from "@/server/errors";
import type { RegistrationInput } from "@/server/validation/schemas";
import type { RegistrationWithAttendee, RegistrationWithEvent } from "@/types";

function generateCheckInCode(): string {
  return crypto.randomBytes(5).toString("hex").toUpperCase();
}

export async function registerAttendee(
  eventId: string,
  input: RegistrationInput
): Promise<RegistrationWithEvent> {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    throw new NotFoundError("Event not found.");
  }

  if (event.endsAt < new Date()) {
    throw new ValidationError("Registration is closed — this event has already ended.");
  }

  const attendee = await prisma.attendee.upsert({
    where: { email: input.email },
    update: { name: input.name, phone: input.phone || null },
    create: { name: input.name, email: input.email, phone: input.phone || null },
  });

  const existingRegistration = await prisma.registration.findUnique({
    where: { eventId_attendeeId: { eventId, attendeeId: attendee.id } },
    include: { event: true, attendee: true },
  });

  if (existingRegistration) {
    return existingRegistration as RegistrationWithEvent;
  }

  if (event.capacity != null) {
    const activeCount = await prisma.registration.count({
      where: { eventId, status: { not: "CANCELLED" } },
    });
    if (activeCount >= event.capacity) {
      throw new ConflictError("This event is full.");
    }
  }

  const registration = await prisma.registration.create({
    data: {
      eventId,
      attendeeId: attendee.id,
      checkInCode: generateCheckInCode(),
    },
    include: { event: true, attendee: true },
  });

  return registration as RegistrationWithEvent;
}

export async function getRegistrationById(registrationId: string): Promise<RegistrationWithEvent> {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { event: true, attendee: true },
  });

  if (!registration) {
    throw new NotFoundError("Registration not found.");
  }

  return registration as RegistrationWithEvent;
}

export async function listRegistrationsForEvent(eventId: string): Promise<RegistrationWithAttendee[]> {
  const registrations = await prisma.registration.findMany({
    where: { eventId },
    include: { attendee: true },
    orderBy: { createdAt: "asc" },
  });

  return registrations as RegistrationWithAttendee[];
}

export async function checkIn(registrationId: string): Promise<RegistrationWithAttendee> {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { attendee: true },
  });

  if (!registration) {
    throw new NotFoundError("Registration not found.");
  }

  if (registration.status === "CANCELLED") {
    throw new ValidationError("This registration was cancelled and cannot be checked in.");
  }

  if (registration.status === "CHECKED_IN") {
    return registration as RegistrationWithAttendee;
  }

  const updated = await prisma.registration.update({
    where: { id: registrationId },
    data: { status: "CHECKED_IN", checkedInAt: new Date() },
    include: { attendee: true },
  });

  return updated as RegistrationWithAttendee;
}
