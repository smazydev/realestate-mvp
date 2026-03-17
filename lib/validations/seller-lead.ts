import { z } from "zod";

export const createSellerLeadSchema = z.object({
  agent_id: z.string().uuid().optional(),
  property_address: z.string().min(1, "Property address is required").max(1000),
  owner_name: z.string().max(500).optional().nullable(),
  assigned_agent_id: z.string().uuid().optional().nullable(),
  tags: z.array(z.string().max(100)).max(20).optional().default([]),
  city: z.string().max(200).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  zip: z.string().max(20).optional().nullable(),
  source: z.string().max(200).optional().nullable(),
  status: z.string().max(100).optional().nullable(),
});

export const updateSellerLeadSchema = createSellerLeadSchema.partial();

export type CreateSellerLeadInput = z.infer<typeof createSellerLeadSchema>;
export type UpdateSellerLeadInput = z.infer<typeof updateSellerLeadSchema>;
