import { createClient } from "@/lib/supabase/server";
import { getOrCreateCurrentAgent, isAdmin } from "@/lib/auth";
import type { BuyerRow, BuyerTargetLocationRow, PropertySearchRow, PropertyMatchRow, SellerLeadRow } from "@/lib/db/types";

export type BuyerWithLocations = BuyerRow & {
  buyer_target_locations: BuyerTargetLocationRow[];
};

export async function getBuyers(filters?: { city?: string; neighborhood?: string; agent_id?: string }): Promise<BuyerWithLocations[]> {
  const agent = await getOrCreateCurrentAgent();
  const admin = await isAdmin();
  const agentId = admin && filters?.agent_id ? filters.agent_id : agent?.id;
  if (!agentId) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("buyers")
    .select("*, buyer_target_locations(*)")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false });

  if (!data) return [];

  const byId = new Map<string, BuyerWithLocations>();
  for (const row of data as (BuyerRow & { buyer_target_locations: BuyerTargetLocationRow[] })[]) {
    const existing = byId.get(row.id);
    const locs = row.buyer_target_locations ?? [];
    if (!existing) {
      byId.set(row.id, { ...row, buyer_target_locations: locs });
    } else {
      existing.buyer_target_locations.push(...locs);
    }
  }
  let list = Array.from(byId.values());

  const cityFilter = filters?.city?.trim().toLowerCase();
  const neighborhoodFilter = filters?.neighborhood?.trim().toLowerCase();
  if (cityFilter || neighborhoodFilter) {
    list = list.filter((b) => {
      const locs = b.buyer_target_locations ?? [];
      return locs.some(
        (l) =>
          (!cityFilter || (l.city ?? "").toLowerCase() === cityFilter) &&
          (!neighborhoodFilter || (l.neighborhood ?? "").toLowerCase() === neighborhoodFilter)
      );
    });
  }
  return list;
}

export async function getBuyerById(id: string): Promise<BuyerWithLocations | null> {
  const agent = await getOrCreateCurrentAgent();
  const admin = await isAdmin();
  if (!agent && !admin) return null;

  const supabase = await createClient();
  let q = supabase.from("buyers").select("*, buyer_target_locations(*)").eq("id", id);
  if (!admin && agent) q = q.eq("agent_id", agent.id);
  const { data } = await q.single();
  return data as BuyerWithLocations | null;
}

export async function getPropertySearches(agentId?: string): Promise<PropertySearchRow[]> {
  const agent = await getOrCreateCurrentAgent();
  const admin = await isAdmin();
  const supabase = await createClient();
  let q = supabase.from("property_searches").select("*").order("created_at", { ascending: false });
  if (admin && agentId) q = q.eq("agent_id", agentId);
  else if (!admin && agent) q = q.eq("agent_id", agent.id);
  else if (!agent) return [];
  const { data } = await q;
  return (data ?? []) as PropertySearchRow[];
}

export async function getPropertySearchById(id: string): Promise<PropertySearchRow | null> {
  const agent = await getOrCreateCurrentAgent();
  const admin = await isAdmin();
  if (!agent && !admin) return null;

  const supabase = await createClient();
  let q = supabase.from("property_searches").select("*").eq("id", id);
  if (!admin && agent) q = q.eq("agent_id", agent.id);
  const { data } = await q.single();
  return data as PropertySearchRow | null;
}

export type MatchWithBuyer = PropertyMatchRow & {
  buyers: { id: string; buyer_name: string; buyer_email: string | null } | null;
};

export async function getPropertyMatches(propertyId: string): Promise<MatchWithBuyer[]> {
  const agent = await getOrCreateCurrentAgent();
  const admin = await isAdmin();
  if (!agent && !admin) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("property_matches")
    .select("*, buyers(id, buyer_name, buyer_email)")
    .eq("property_id", propertyId);
  if (!data) return [];
  return data as MatchWithBuyer[];
}

/** Distinct cities and neighborhoods from buyer_target_locations for filter dropdowns. */
export async function getLocationFilterOptions(agentId?: string): Promise<{ cities: string[]; neighborhoods: string[] }> {
  const agent = await getOrCreateCurrentAgent();
  const admin = await isAdmin();
  const filterAgentId = admin && agentId ? agentId : agent?.id;
  if (!filterAgentId) return { cities: [], neighborhoods: [] };

  const supabase = await createClient();
  const buyerIds = await supabase.from("buyers").select("id").eq("agent_id", filterAgentId).then((r) => (r.data ?? []).map((b) => b.id));
  if (buyerIds.length === 0) return { cities: [], neighborhoods: [] };

  const { data: locs } = await supabase
    .from("buyer_target_locations")
    .select("city, neighborhood")
    .in("buyer_id", buyerIds);

  const cities = [...new Set((locs ?? []).map((l) => l.city).filter(Boolean))].sort() as string[];
  const neighborhoods = [...new Set((locs ?? []).map((l) => l.neighborhood).filter(Boolean))].sort() as string[];
  return { cities, neighborhoods };
}

export type SellerLeadWithAssigned = SellerLeadRow & {
  assigned_agent: { display_name: string | null; email: string } | null;
};

/** Fetch seller leads. Join assigned_agent via FK; Supabase returns it under the FK relation. */
export async function getSellerLeads(agentId?: string): Promise<SellerLeadWithAssigned[]> {
  const agent = await getOrCreateCurrentAgent();
  const admin = await isAdmin();
  const supabase = await createClient();
  let q = supabase.from("seller_leads").select("*, assigned_agent:agents!assigned_agent_id(display_name, email)").order("created_at", { ascending: false });
  if (admin && agentId) q = q.eq("agent_id", agentId);
  else if (!admin && agent) q = q.eq("agent_id", agent.id);
  else if (!agent) return [];
  const { data } = await q;
  const rows = (data ?? []) as (SellerLeadRow & { assigned_agent?: { display_name: string | null; email: string } | null })[];
  return rows.map((r) => ({ ...r, assigned_agent: r.assigned_agent ?? null }));
}

export async function getSellerLeadById(id: string): Promise<SellerLeadWithAssigned | null> {
  const agent = await getOrCreateCurrentAgent();
  const admin = await isAdmin();
  if (!agent && !admin) return null;

  const supabase = await createClient();
  let q = supabase.from("seller_leads").select("*, assigned_agent:agents!assigned_agent_id(display_name, email)").eq("id", id);
  if (!admin && agent) q = q.eq("agent_id", agent.id);
  const { data } = await q.single();
  const row = data as (SellerLeadRow & { assigned_agent?: { display_name: string | null; email: string } | null }) | null;
  if (!row) return null;
  return { ...row, assigned_agent: row.assigned_agent ?? null };
}
