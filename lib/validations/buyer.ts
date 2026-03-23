import { z } from "zod";

const locationSchema = z.object({
  city: z.string().min(1, "City is required").max(200).optional().or(z.literal("")),
  neighborhood: z.string().max(200).optional().nullable(),
  zip_code: z.string().max(20).optional().nullable(),
});

export const createBuyerSchema = z.object({
  agent_id: z.string().uuid().optional(), // required when admin creates for another agent
  buyer_name: z.string().min(1, "Buyer name is required").max(500),
  budget_min: z.coerce.number().min(0).optional().nullable(),
  budget_max: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  status: z.string().max(100).optional().nullable(),
  locations: z.array(locationSchema).min(0).max(50).optional().default([]),
});

export const updateBuyerSchema = createBuyerSchema.partial().extend({
  buyer_name: z.string().min(1).max(500).optional(),
});

export type CreateBuyerInput = z.infer<typeof createBuyerSchema>;
export type UpdateBuyerInput = z.infer<typeof updateBuyerSchema>;
