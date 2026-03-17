import { getBuyers, getLocationFilterOptions } from "@/lib/db/queries";
import { listAgents } from "@/app/actions/agents";
import { isAdmin } from "@/lib/auth";
import { BuyersPageClient } from "@/components/buyers/buyers-page-client";

type Props = { searchParams: Promise<{ city?: string; neighborhood?: string }> };

export default async function BuyersPage({ searchParams }: Props) {
  const params = await searchParams;
  const [buyers, options, agentsList] = await Promise.all([
    getBuyers({ city: params.city, neighborhood: params.neighborhood }),
    getLocationFilterOptions(),
    isAdmin().then((admin) => (admin ? listAgents() : [])),
  ]);

  const agents = agentsList.map((a) => ({ id: a.id, display_name: a.display_name, email: a.email }));

  return (
    <BuyersPageClient
      buyers={buyers}
      cities={options.cities}
      neighborhoods={options.neighborhoods}
      agents={agents}
    />
  );
}
