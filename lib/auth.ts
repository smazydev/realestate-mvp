import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/db/types";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: AppRole;
  created_at: string;
};

export type Agent = {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string;
  brokerage_name: string | null;
  created_at: string;
};

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/** Current user's profile (from DB). Use for role checks. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getProfile(user.id);
}

/** True if current user has role admin. */
export async function isAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role === "admin";
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  return data as Profile;
}

export async function getAgentByUserId(userId: string): Promise<Agent | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as Agent;
}

/** Get current user's agent row; create one if missing (for agent role). */
export async function getOrCreateCurrentAgent(): Promise<Agent | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const existing = await getAgentByUserId(user.id);
  if (existing) return existing;

  const profile = await getProfile(user.id);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .insert({
      user_id: user.id,
      display_name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
      email: user.email ?? profile?.email ?? "",
    })
    .select()
    .single();

  if (error || !data) return null;
  return data as Agent;
}
