"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateCurrentAgent, isAdmin } from "@/lib/auth";
import { createSellerLeadSchema, updateSellerLeadSchema, type CreateSellerLeadInput, type UpdateSellerLeadInput } from "@/lib/validations/seller-lead";
import { revalidatePath } from "next/cache";

type Result = { success: true; id?: string } | { success: false; error: string };

function resolveAgentId(agentId: string | undefined, currentAgentId: string | null): string | null {
  if (agentId) return agentId;
  return currentAgentId;
}

export async function createSellerLead(formData: CreateSellerLeadInput): Promise<Result> {
  const currentAgent = await getOrCreateCurrentAgent();
  const admin = await isAdmin();
  if (!currentAgent && !admin) return { success: false, error: "Not authenticated" };

  const parsed = createSellerLeadSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const agentId = resolveAgentId(parsed.data.agent_id, currentAgent?.id ?? null);
  if (!agentId) return { success: false, error: "Agent required" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seller_leads")
    .insert({
      agent_id: agentId,
      property_address: parsed.data.property_address,
      owner_name: parsed.data.owner_name ?? null,
      assigned_agent_id: parsed.data.assigned_agent_id ?? null,
      tags: parsed.data.tags ?? [],
      city: parsed.data.city ?? null,
      state: parsed.data.state ?? null,
      zip: parsed.data.zip ?? null,
      source: parsed.data.source ?? null,
      status: parsed.data.status ?? null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/seller-leads");
  return { success: true, id: data?.id };
}

export async function updateSellerLead(id: string, formData: UpdateSellerLeadInput): Promise<Result> {
  const agent = await getOrCreateCurrentAgent();
  const admin = await isAdmin();
  if (!agent && !admin) return { success: false, error: "Not authenticated" };

  const parsed = updateSellerLeadSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const supabase = await createClient();
  const updates: Record<string, unknown> = { ...parsed.data };
  let q = supabase.from("seller_leads").update(updates).eq("id", id);
  if (!admin && agent) q = q.eq("agent_id", agent.id);
  const { error } = await q;
  if (error) return { success: false, error: error.message };
  revalidatePath("/seller-leads");
  return { success: true };
}

export async function deleteSellerLead(id: string): Promise<Result> {
  const agent = await getOrCreateCurrentAgent();
  const admin = await isAdmin();
  if (!agent && !admin) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();
  let q = supabase.from("seller_leads").delete().eq("id", id);
  if (!admin && agent) q = q.eq("agent_id", agent.id);
  const { error } = await q;
  if (error) return { success: false, error: error.message };
  revalidatePath("/seller-leads");
  return { success: true };
}
