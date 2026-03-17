import { z } from "zod";

export const sendMatchEmailSchema = z.object({
  recipient_email: z.string().email("Valid email required"),
  subject: z.string().min(1, "Subject is required").max(500),
  body: z.string().max(10000).optional().default(""),
  property_id: z.string().uuid().optional().nullable(),
  buyer_id: z.string().uuid().optional().nullable(),
});

export type SendMatchEmailInput = z.infer<typeof sendMatchEmailSchema>;
