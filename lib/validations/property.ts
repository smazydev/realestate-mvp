import { z } from "zod";

export const createPropertySearchSchema = z.object({
  agent_id: z.string().uuid().optional(), // required when admin creates for another agent
  raw_address: z.string().min(1, "Address is required").max(1000),
  normalized_address: z.string().max(1000).optional().nullable(),
  city: z.string().max(200).optional().nullable(),
  neighborhood: z.string().max(200).optional().nullable(),
  zip_code: z.string().max(20).optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  price: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export const updatePropertySearchSchema = createPropertySearchSchema.partial();

export type CreatePropertySearchInput = z.infer<typeof createPropertySearchSchema>;
export type UpdatePropertySearchInput = z.infer<typeof updatePropertySearchSchema>;
