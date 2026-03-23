"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateCurrentAgent, isAdmin } from "@/lib/auth";
import { getBuyers } from "@/lib/db/queries";
import type { BuyerWithLocations } from "@/lib/db/queries";
import { createBuyerSchema, updateBuyerSchema, type CreateBuyerInput, type UpdateBuyerInput } from "@/lib/validations/buyer";
import { revalidatePath } from "next/cache";

type Result = { success: true; id?: string } | { success: false; error: string };
export type BuyerCityMatch = BuyerWithLocations & {
  recipient_email: string | null;
  recipient_name: string | null;
};

function resolveAgentId(agentId: string | undefined, currentAgentId: string | null): string | null {
  if (agentId) return agentId;
  return currentAgentId;
}

export async function createBuyer(formData: CreateBuyerInput): Promise<Result> {
  const currentAgent = await getOrCreateCurrentAgent();
  const admin = await isAdmin();
  if (!currentAgent && !admin) return { success: false, error: "Not authenticated" };

  const parsed = createBuyerSchema.safeParse(formData);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors?.buyer_name?.[0] ?? parsed.error.message;
    return { success: false, error: msg };
  }

  const agentId = resolveAgentId(parsed.data.agent_id, currentAgent?.id ?? null);
  if (!agentId) return { success: false, error: "Agent required (select agent as admin or sign in as agent)" };

  const supabase = await createClient();
  const { data: buyer, error: buyerError } = await supabase
    .from("buyers")
    .insert({
      agent_id: agentId,
      buyer_name: parsed.data.buyer_name,
      budget_min: parsed.data.budget_min ?? null,
      budget_max: parsed.data.budget_max ?? null,
      notes: parsed.data.notes ?? null,
      status: parsed.data.status ?? null,
      buyer_email: null,
    })
    .select("id")
    .single();

  if (buyerError || !buyer) return { success: false, error: buyerError?.message ?? "Failed to create buyer" };

  const locations = parsed.data.locations?.filter((l) => (l.city ?? "").trim() || (l.neighborhood ?? "").trim() || (l.zip_code ?? "").trim()) ?? [];
  if (locations.length > 0) {
    await supabase.from("buyer_target_locations").insert(
      locations.map((l) => ({
        buyer_id: buyer.id,
        city: (l.city ?? "").trim() || null,
        neighborhood: (l.neighborhood ?? "").trim() || null,
        zip_code: (l.zip_code ?? "").trim() || null,
      }))
    );
  }

  revalidatePath("/buyers");
  return { success: true, id: buyer.id };
}

export async function updateBuyer(id: string, formData: UpdateBuyerInput): Promise<Result> {
  const agent = await getOrCreateCurrentAgent();
  const admin = await isAdmin();
  if (!agent && !admin) return { success: false, error: "Not authenticated" };

  const parsed = updateBuyerSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const supabase = await createClient();
  const updates: Record<string, unknown> = {};
  if (parsed.data.buyer_name !== undefined) updates.buyer_name = parsed.data.buyer_name;
  if (parsed.data.budget_min !== undefined) updates.budget_min = parsed.data.budget_min;
  if (parsed.data.budget_max !== undefined) updates.budget_max = parsed.data.budget_max;
  if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  updates.buyer_email = null;

  let q = supabase.from("buyers").update(updates).eq("id", id);
  if (!admin && agent) q = q.eq("agent_id", agent.id);
  const { error: updateError } = await q;
  if (updateError) return { success: false, error: updateError.message };

  if (parsed.data.locations) {
    await supabase.from("buyer_target_locations").delete().eq("buyer_id", id);
    const locations = parsed.data.locations.filter((l) => (l.city ?? "").trim() || (l.neighborhood ?? "").trim() || (l.zip_code ?? "").trim());
    if (locations.length > 0) {
      await supabase.from("buyer_target_locations").insert(
        locations.map((l) => ({
          buyer_id: id,
          city: (l.city ?? "").trim() || null,
          neighborhood: (l.neighborhood ?? "").trim() || null,
          zip_code: (l.zip_code ?? "").trim() || null,
        }))
      );
    }
  }

  revalidatePath("/buyers");
  revalidatePath(`/buyers/${id}`);
  return { success: true };
}

export async function deleteBuyer(id: string): Promise<Result> {
  const agent = await getOrCreateCurrentAgent();
  const admin = await isAdmin();
  if (!agent && !admin) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();
  let q = supabase.from("buyers").delete().eq("id", id);
  if (!admin && agent) q = q.eq("agent_id", agent.id);
  const { error } = await q;
  if (error) return { success: false, error: error.message };
  revalidatePath("/buyers");
  revalidatePath("/admin");
  return { success: true };
}

/**
 * Return buyers (for current agent) whose target city or neighborhood matches the geocoded place
 * (case-insensitive). Uses multiple candidates so "Tarzana, California, United States" still matches
 * buyers with city "Tarzana". Also matches if the user stored the name in neighborhood.
 */
export async function getBuyersMatchingCity(cityOrPlaceName: string): Promise<BuyerCityMatch[]> {
  const raw = cityOrPlaceName?.trim();
  if (!raw) return [];
  const candidates = new Set<string>();
  candidates.add(raw.toLowerCase());
  const firstSegment = raw.split(",")[0]?.trim().toLowerCase();
  if (firstSegment) candidates.add(firstSegment);

  const buyers = await getBuyers({});
  const matched = buyers.filter((b) =>
    (b.buyer_target_locations ?? []).some((l) => {
      const locCity = (l.city ?? "").trim().toLowerCase();
      const locNeighborhood = (l.neighborhood ?? "").trim().toLowerCase();
      for (const c of candidates) {
        if (!c) continue;
        if (locCity === c || locNeighborhood === c) return true;
      }
      return false;
    })
  );

  if (matched.length === 0) return [];

  const agentIds = [...new Set(matched.map((b) => b.agent_id).filter(Boolean))];
  const supabase = await createClient();
  const { data: agentRows } = await supabase
    .from("agents")
    .select("id, email, display_name")
    .in("id", agentIds);
  const byAgentId = new Map((agentRows ?? []).map((a) => [a.id, a]));

  return matched.map((b) => {
    const uploader = byAgentId.get(b.agent_id);
    return {
      ...b,
      recipient_email: uploader?.email ?? null,
      recipient_name: uploader?.display_name ?? uploader?.email ?? null,
    };
  });
}

/** Return city/neighborhood options for header Filter dropdown (Buyer Management). */
export async function getBuyerFilterOptions(): Promise<{ cities: string[]; neighborhoods: string[] }> {
  const { getLocationFilterOptions } = await import("@/lib/db/queries");
  return getLocationFilterOptions();
}
