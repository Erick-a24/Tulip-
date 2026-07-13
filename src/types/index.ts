import type { Event, Attendee, Registration } from "@prisma/client";

export type { Event, Attendee, Registration };

// SQLite has no native enum support, so Registration.status is a plain
// string column. This is the set of values application code ever writes.
export type RegistrationStatusValue = "REGISTERED" | "CHECKED_IN" | "CANCELLED";

export type EventWithCounts = Event & {
  registrationCount: number;
  spotsRemaining: number | null;
};

export type RegistrationWithAttendee = Omit<Registration, "status"> & {
  status: RegistrationStatusValue;
  attendee: Attendee;
};

export type RegistrationWithEvent = Omit<Registration, "status"> & {
  status: RegistrationStatusValue;
  event: Event;
  attendee: Attendee;
};
