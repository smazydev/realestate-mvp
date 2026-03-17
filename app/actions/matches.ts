"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateCurrentAgent, isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type Result = { success: true } | { success: false; error: string };

export async function deletePropertyMatch(id: string): Promise<Result> {
  const agent = await getOrCreateCurrentAgent();
  const admin = await isAdmin();
  if (!agent && !admin) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();
  if (!admin && agent) {
    const { data: match } = await supabase.from("property_matches").select("property_id").eq("id", id).single();
    if (match) {
      const { data: prop } = await supabase.from("property_searches").select("id").eq("id", match.property_id).eq("agent_id", agent.id).single();
      if (!prop) return { success: false, error: "Forbidden" };
    }
  }
  const { error } = await supabase.from("property_matches").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/address-search");
  revalidatePath("/property-searches");
  revalidatePath("/admin");
  return { success: true };
}
