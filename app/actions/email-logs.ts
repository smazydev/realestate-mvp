"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateCurrentAgent, isAdmin } from "@/lib/auth";

export type EmailLogEntry = {
  id: string;
  property_id: string | null;
  buyer_id: string | null;
  sender_agent_id: string;
  recipient_email: string;
  subject: string;
  status: string;
  created_at: string;
};

export async function listEmailLogs(): Promise<EmailLogEntry[]> {
  const agent = await getOrCreateCurrentAgent();
  const admin = await isAdmin();
  if (!agent && !admin) return [];

  const supabase = await createClient();
  let q = supabase
    .from("email_logs")
    .select("id, property_id, buyer_id, sender_agent_id, recipient_email, subject, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (!admin && agent) q = q.eq("sender_agent_id", agent.id);
  const { data } = await q;
  return (data ?? []) as EmailLogEntry[];
}
