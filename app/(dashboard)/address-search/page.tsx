import { Suspense } from "react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { AddressSearchContent } from "@/components/address-search/address-search-content";
import { getPropertySearchById, getPropertyMatches } from "@/lib/db/queries";
import { listAgents } from "@/app/actions/agents";
import { isAdmin } from "@/lib/auth";

type Props = { searchParams: Promise<{ id?: string }> };

export default async function AddressSearchPage({ searchParams }: Props) {
  const { id } = await searchParams;
  const property = id ? await getPropertySearchById(id) : null;
  const matches = property ? await getPropertyMatches(property.id) : [];
  const admin = await isAdmin();
  const agents = admin ? await listAgents() : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="shrink-0 border-b border-gray-200 pb-2 dark:border-gray-800">
        <Breadcrumb segments={[{ label: "Address Search", href: "/address-search" }, { label: "Property search & match" }]} />
      </div>
      <Suspense fallback={<div className="text-gray-500">Loading…</div>}>
        <AddressSearchContent
          initialProperty={property}
          initialMatches={matches}
          agents={agents.length > 0 ? agents.map((a) => ({ id: a.id, display_name: a.display_name, email: a.email })) : undefined}
        />
      </Suspense>
    </div>
  );
}
