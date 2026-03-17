import { z } from "zod";

export const updateProfileSchema = z.object({
  full_name: z.string().max(500).optional().nullable(),
  email: z.string().email().max(500).optional().nullable(),
  role: z.enum(["admin", "agent"]).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
