import { z } from "zod";

export const createAgentSchema = z.object({
  user_id: z.string().uuid("Select a user (profile)"),
  display_name: z.string().max(500).optional().nullable(),
  email: z.string().email("Valid email required").max(500),
  brokerage_name: z.string().max(500).optional().nullable(),
});

export const updateAgentSchema = z.object({
  display_name: z.string().max(500).optional().nullable(),
  email: z.string().email().max(500).optional(),
  brokerage_name: z.string().max(500).optional().nullable(),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
