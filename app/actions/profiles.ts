"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getProfile, isAdmin } from "@/lib/auth";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/profile";
import { revalidatePath } from "next/cache";

type Result = { success: true } | { success: false; error: string };

export async function listProfiles(): Promise<{ id: string; full_name: string | null; email: string | null; role: string }[]> {
  const admin = await isAdmin();
  if (!admin) return [];

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, full_name, email, role").order("created_at", { ascending: false });
  return (data ?? []) as { id: string; full_name: string | null; email: string | null; role: string }[];
}

export async function getProfileForEdit(userId: string) {
  const profile = await getProfile(userId);
  if (!profile) return null;
  const admin = await isAdmin();
  const user = await getCurrentUser();
  if (!admin && user?.id !== userId) return null;
  return profile;
}

export async function updateProfile(userId: string, formData: UpdateProfileInput): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const admin = await isAdmin();
  if (!admin && user.id !== userId) return { success: false, error: "Forbidden" };

  const parsed = updateProfileSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const supabase = await createClient();
  const updates: Record<string, unknown> = {};
  if (parsed.data.full_name !== undefined) updates.full_name = parsed.data.full_name;
  if (parsed.data.email !== undefined) updates.email = parsed.data.email;
  if (parsed.data.role !== undefined) {
    if (!admin) return { success: false, error: "Only admin can change role" };
    updates.role = parsed.data.role;
  }

  const { error } = await supabase.from("profiles").update(updates).eq("id", userId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/profiles");
  revalidatePath(`/admin/profiles/${userId}`);
  return { success: true };
}
