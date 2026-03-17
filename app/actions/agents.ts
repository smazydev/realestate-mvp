"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateCurrentAgent, isAdmin } from "@/lib/auth";
import { createAgentSchema, updateAgentSchema, type CreateAgentInput, type UpdateAgentInput } from "@/lib/validations/agent";
import { revalidatePath } from "next/cache";

type Result = { success: true; id?: string } | { success: false; error: string };

export async function listAgents(): Promise<{ id: string; user_id: string; display_name: string | null; email: string; brokerage_name: string | null }[]> {
  const supabase = await createClient();
  const admin = await isAdmin();
  if (admin) {
    const { data } = await supabase.from("agents").select("id, user_id, display_name, email, brokerage_name").order("created_at", { ascending: false });
    return (data ?? []) as { id: string; user_id: string; display_name: string | null; email: string; brokerage_name: string | null }[];
  }
  const agent = await getOrCreateCurrentAgent();
  if (!agent) return [];
  return [{ id: agent.id, user_id: agent.user_id, display_name: agent.display_name, email: agent.email, brokerage_name: agent.brokerage_name }];
}

export async function getAgentById(id: string) {
  const supabase = await createClient();
  const agent = await getOrCreateCurrentAgent();
  const admin = await isAdmin();
  if (!admin && (!agent || agent.id !== id)) return null;
  const { data } = await supabase.from("agents").select("*").eq("id", id).single();
  return data;
}

export async function createAgent(formData: CreateAgentInput): Promise<Result> {
  const admin = await isAdmin();
  if (!admin) return { success: false, error: "Admin only" };

  const parsed = createAgentSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .insert({
      user_id: parsed.data.user_id,
      display_name: parsed.data.display_name ?? null,
      email: parsed.data.email,
      brokerage_name: parsed.data.brokerage_name ?? null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/agents");
  return { success: true, id: data?.id };
}

export async function updateAgent(id: string, formData: UpdateAgentInput): Promise<Result> {
  const agent = await getOrCreateCurrentAgent();
  const admin = await isAdmin();
  if (!admin && (!agent || agent.id !== id)) return { success: false, error: "Forbidden" };

  const parsed = updateAgentSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const supabase = await createClient();
  const updates: Record<string, unknown> = {};
  if (parsed.data.display_name !== undefined) updates.display_name = parsed.data.display_name;
  if (parsed.data.email !== undefined) updates.email = parsed.data.email;
  if (parsed.data.brokerage_name !== undefined) updates.brokerage_name = parsed.data.brokerage_name;

  const { error } = await supabase.from("agents").update(updates).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/agents");
  revalidatePath(`/admin/agents/${id}`);
  return { success: true };
}

export async function deleteAgent(id: string): Promise<Result> {
  const admin = await isAdmin();
  if (!admin) return { success: false, error: "Admin only" };

  const supabase = await createClient();
  const { error } = await supabase.from("agents").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/agents");
  return { success: true };
}
