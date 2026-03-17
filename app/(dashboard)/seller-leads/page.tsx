import { getSellerLeads } from "@/lib/db/queries";
import { listAgents } from "@/app/actions/agents";
import { isAdmin } from "@/lib/auth";
import { SellerLeadsPageClient } from "@/components/seller-leads/seller-leads-page-client";

export default async function SellerLeadsPage() {
  const [leads, agentsList] = await Promise.all([
    getSellerLeads(),
    isAdmin().then((admin) => (admin ? listAgents() : [])),
  ]);

  const agents = agentsList.map((a) => ({ id: a.id, display_name: a.display_name, email: a.email }));

  return <SellerLeadsPageClient leads={leads} agents={agents} />;
}
