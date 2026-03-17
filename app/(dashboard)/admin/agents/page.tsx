import { listAgents } from "@/app/actions/agents";
import { listProfiles } from "@/app/actions/profiles";
import { createClient } from "@/lib/supabase/server";
import { AdminAgentsPageClient } from "@/components/admin/agents-page-client";

export default async function AdminAgentsPage() {
  const [agents, profiles] = await Promise.all([listAgents(), listProfiles()]);
  const supabase = await createClient();
  const { data: existingAgents } = await supabase.from("agents").select("user_id");
  const existingUserIds = new Set((existingAgents ?? []).map((a) => a.user_id));
  const profilesWithoutAgent = profiles.filter((p) => !existingUserIds.has(p.id));

  return (
    <AdminAgentsPageClient
      agents={agents}
      profilesWithoutAgent={profilesWithoutAgent}
    />
  );
}
