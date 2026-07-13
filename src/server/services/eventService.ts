import { prisma } from "@/server/db/prisma";
import { NotFoundError } from "@/server/errors";
import type { EventInput } from "@/server/validation/schemas";
import type { EventWithCounts } from "@/types";

function withCounts(event: {
  capacity: number | null;
  _count: { registrations: number };
  [key: string]: unknown;
}): EventWithCounts {
  const registrationCount = event._count.registrations;
  const spotsRemaining = event.capacity != null ? Math.max(event.capacity - registrationCount, 0) : null;
  const { _count, ...rest } = event;
  return { ...rest, registrationCount, spotsRemaining } as EventWithCounts;
}

export async function listUpcomingEvents(): Promise<EventWithCounts[]> {
  const events = await prisma.event.findMany({
    where: { endsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    include: {
      _count: {
        select: { registrations: { where: { status: { not: "CANCELLED" } } } },
      },
    },
  });

  return events.map(withCounts);
}

export async function listAllEventsForAdmin(): Promise<EventWithCounts[]> {
  const events = await prisma.event.findMany({
    orderBy: { startsAt: "desc" },
    include: {
      _count: {
        select: { registrations: { where: { status: { not: "CANCELLED" } } } },
      },
    },
  });

  return events.map(withCounts);
}

export async function getEventById(eventId: string): Promise<EventWithCounts> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      _count: {
        select: { registrations: { where: { status: { not: "CANCELLED" } } } },
      },
    },
  });

  if (!event) {
    throw new NotFoundError("Event not found.");
  }

  return withCounts(event);
}

export async function createEvent(input: EventInput) {
  return prisma.event.create({
    data: {
      title: input.title,
      description: input.description,
      location: input.location,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      capacity: input.capacity ?? null,
    },
  });
}

export async function updateEvent(eventId: string, input: EventInput) {
  const existing = await prisma.event.findUnique({ where: { id: eventId } });
  if (!existing) {
    throw new NotFoundError("Event not found.");
  }

  return prisma.event.update({
    where: { id: eventId },
    data: {
      title: input.title,
      description: input.description,
      location: input.location,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      capacity: input.capacity ?? null,
    },
  });
}

export async function deleteEvent(eventId: string) {
  const existing = await prisma.event.findUnique({ where: { id: eventId } });
  if (!existing) {
    throw new NotFoundError("Event not found.");
  }

  await prisma.event.delete({ where: { id: eventId } });
}
