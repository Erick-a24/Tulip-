import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const eventInputSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters.").max(120),
    description: z.string().trim().min(1, "Description is required.").max(2000),
    location: z.string().trim().min(1, "Location is required.").max(200),
    startsAt: z.coerce.date({ errorMap: () => ({ message: "Start date/time is required." }) }),
    endsAt: z.coerce.date({ errorMap: () => ({ message: "End date/time is required." }) }),
    capacity: z.coerce.number().int().positive().nullable().optional(),
  })
  .refine((data) => data.endsAt > data.startsAt, {
    message: "End time must be after the start time.",
    path: ["endsAt"],
  });

export const registrationInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type EventInput = z.infer<typeof eventInputSchema>;
export type RegistrationInput = z.infer<typeof registrationInputSchema>;
