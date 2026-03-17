"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateCurrentAgent, isAdmin } from "@/lib/auth";
import { createPropertySearchSchema, updatePropertySearchSchema, type CreatePropertySearchInput, type UpdatePropertySearchInput } from "@/lib/validations/property";
import { runMatching } from "@/lib/matching/engine";
import { revalidatePath } from "next/cache";

type Result = { success: true; id?: string } | { success: false; error: string };

function resolvePropertyAgentId(agentId: string | undefined, currentAgentId: string | null): string | null {
  if (agentId) return agentId;
  return currentAgentId;
}

export async function createPropertySearch(formData: CreatePropertySearchInput): Promise<Result> {
  const currentAgent = await getOrCreateCurrentAgent();
  const admin = await isAdmin();
  if (!currentAgent && !admin) return { success: false, error: "Not authenticated" };

  const parsed = createPropertySearchSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const agentId = resolvePropertyAgentId(parsed.data.agent_id, currentAgent?.id ?? null);
  if (!agentId) return { success: false, error: "Agent required (select agent as admin or sign in as agent)" };

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("property_searches")
    .insert({
      agent_id: agentId,
      raw_address: parsed.data.raw_address.trim(),
      normalized_address: parsed.data.normalized_address ?? null,
      city: parsed.data.city ?? null,
      neighborhood: parsed.data.neighborhood ?? null,
      zip_code: parsed.data.zip_code ?? null,
      lat: parsed.data.lat ?? null,
      lng: parsed.data.lng ?? null,
      price: parsed.data.price ?? null,
      notes: parsed.data.notes ?? null,
    })
    .select("id")
    .single();

  if (error || !row) return { success: false, error: error?.message ?? "Failed to create property" };

  await runMatching(row.id);
  revalidatePath("/address-search");
  revalidatePath("/property-searches");
  revalidatePath(`/property-searches/${row.id}`);
  return { success: true, id: row.id };
}

export async function updatePropertySearch(id: string, formData: UpdatePropertySearchInput): Promise<Result> {
  const agent = await getOrCreateCurrentAgent();
  const admin = await isAdmin();
  if (!agent && !admin) return { success: false, error: "Not authenticated" };

  const parsed = updatePropertySearchSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const supabase = await createClient();
  const updates: Record<string, unknown> = { ...parsed.data };
  let q = supabase.from("property_searches").update(updates).eq("id", id);
  if (!admin && agent) q = q.eq("agent_id", agent.id);
  const { error } = await q;
  if (error) return { success: false, error: error.message };

  await runMatching(id);
  revalidatePath("/address-search");
  revalidatePath("/property-searches");
  revalidatePath(`/property-searches/${id}`);
  return { success: true };
}

export async function deletePropertySearch(id: string): Promise<Result> {
  const agent = await getOrCreateCurrentAgent();
  const admin = await isAdmin();
  if (!agent && !admin) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();
  let q = supabase.from("property_searches").delete().eq("id", id);
  if (!admin && agent) q = q.eq("agent_id", agent.id);
  const { error } = await q;
  if (error) return { success: false, error: error.message };
  revalidatePath("/property-searches");
  revalidatePath("/address-search");
  revalidatePath("/admin");
  return { success: true };
}
