import { Suspense } from "react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { AddressSearchContent } from "@/components/address-search/address-search-content";
import { listAgents } from "@/app/actions/agents";
import { isAdmin } from "@/lib/auth";

export default async function PropertySearchPage() {
  const admin = await isAdmin();
  const agentsList = admin ? await listAgents() : [];
  const agents = agentsList.length > 0 ? agentsList.map((a) => ({ id: a.id, display_name: a.display_name, email: a.email })) : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="shrink-0 border-b border-gray-200 pb-2 dark:border-gray-800">
        <Breadcrumb segments={[{ label: "Property Search", href: "/address-search" }, { label: "Search & match" }]} />
      </div>
      <Suspense fallback={<div className="text-gray-500">Loading…</div>}>
        <AddressSearchContent agents={agents} />
      </Suspense>
    </div>
  );
}
