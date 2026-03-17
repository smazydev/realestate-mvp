import { createClient } from "@/lib/supabase/server";

/** Normalize for comparison: lowercase, trim. */
function n(s: string | null | undefined): string {
  if (s == null) return "";
  return String(s).toLowerCase().trim();
}

/**
 * V1 matching: same-agent buyers only.
 * - City match qualifies.
 * - Neighborhood match adds reason and score.
 * - Zip match adds reason and score.
 */
export async function runMatching(propertyId: string): Promise<void> {
  const supabase = await createClient();

  const { data: property, error: propErr } = await supabase
    .from("property_searches")
    .select("id, agent_id, city, neighborhood, zip_code")
    .eq("id", propertyId)
    .single();

  if (propErr || !property) return;

  const { data: buyers, error: buyersErr } = await supabase
    .from("buyers")
    .select(`
      id,
      buyer_target_locations ( city, neighborhood, zip_code )
    `)
    .eq("agent_id", property.agent_id);

  if (buyersErr || !buyers?.length) {
    await supabase.from("property_matches").delete().eq("property_id", propertyId);
    return;
  }

  const propCity = n(property.city);
  const propNeighborhood = n(property.neighborhood);
  const propZip = n(property.zip_code);

  const toInsert: { property_id: string; buyer_id: string; match_score: number; match_reasons: string[] }[] = [];

  for (const b of buyers) {
    const locations = (b as { buyer_target_locations?: { city: string | null; neighborhood: string | null; zip_code: string | null }[] }).buyer_target_locations ?? [];
    let score = 0;
    const reasons: string[] = [];
    let anyMatch = false;

    for (const loc of locations) {
      const cityMatch = propCity && n(loc.city) === propCity;
      const neighborhoodMatch = propNeighborhood && n(loc.neighborhood) === propNeighborhood;
      const zipMatch = propZip && n(loc.zip_code) === propZip;

      if (cityMatch) {
        anyMatch = true;
        score += 40;
        if (!reasons.includes("target_city_match")) reasons.push("target_city_match");
      }
      if (neighborhoodMatch) {
        anyMatch = true;
        score += 30;
        if (!reasons.includes("neighborhood_match")) reasons.push("neighborhood_match");
      }
      if (zipMatch) {
        anyMatch = true;
        score += 30;
        if (!reasons.includes("zip_code_match")) reasons.push("zip_code_match");
      }
    }

    if (anyMatch) {
      toInsert.push({
        property_id: propertyId,
        buyer_id: b.id,
        match_score: Math.min(100, score),
        match_reasons: reasons,
      });
    }
  }

  await supabase.from("property_matches").delete().eq("property_id", propertyId);
  if (toInsert.length > 0) {
    await supabase.from("property_matches").insert(toInsert);
  }
}
