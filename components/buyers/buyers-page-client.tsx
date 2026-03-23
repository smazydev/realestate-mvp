"use client";

import { useState, useMemo } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { BuyerCard } from "@/components/buyers/buyer-card";
import { BuyerFilters } from "@/components/buyers/buyer-filters";
import { AddBuyerModal } from "@/components/buyers/add-buyer-modal";
import { EditBuyerModal } from "@/components/buyers/edit-buyer-modal";
import type { BuyerWithLocations } from "@/lib/db/queries";

type AgentOption = { id: string; display_name: string | null; email: string };

type Props = {
  buyers: BuyerWithLocations[];
  cities: string[];
  neighborhoods: string[];
  agents: AgentOption[];
};

function filterAndSortBuyers(buyers: BuyerWithLocations[], q: string, sort: string): BuyerWithLocations[] {
  let list = buyers;
  const query = q.trim().toLowerCase();
  if (query) {
    list = list.filter(
      (b) =>
        b.buyer_name.toLowerCase().includes(query) ||
        (b.buyer_email ?? "").toLowerCase().includes(query)
    );
  }
  switch (sort) {
    case "newest":
      list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    case "oldest":
      list = [...list].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      break;
    case "name_asc":
      list = [...list].sort((a, b) => a.buyer_name.localeCompare(b.buyer_name));
      break;
    case "name_desc":
      list = [...list].sort((a, b) => b.buyer_name.localeCompare(a.buyer_name));
      break;
    default:
      break;
  }
  return list;
}

export function BuyersPageClient({ buyers, cities, neighborhoods, agents }: Props) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editBuyer, setEditBuyer] = useState<BuyerWithLocations | null>(null);
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const displayedBuyers = useMemo(() => filterAndSortBuyers(buyers, q, sort), [buyers, q, sort]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Breadcrumb segments={[{ label: "Buyer Management", href: "/buyers" }, { label: "Buyer Management" }]} />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add and manage buyers, their target locations, and budget.</p>
        </div>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
        >
          Add Buyer
        </button>
      </div>
      <Suspense fallback={null}>
        <BuyerFilters cities={cities} neighborhoods={neighborhoods} />
      </Suspense>
      {displayedBuyers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">
            {buyers.length === 0 ? "No buyers yet." : "No buyers match your search or filters."}
          </p>
          {buyers.length === 0 ? (
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="mt-2 inline-block text-sm font-medium text-gray-900 underline dark:text-gray-200"
            >
              Add your first buyer
            </button>
          ) : (
            <a href="/buyers" className="mt-2 inline-block text-sm font-medium text-gray-900 underline dark:text-gray-200">
              Clear search and filters
            </a>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {displayedBuyers.map((buyer) => (
            <BuyerCard key={buyer.id} buyer={buyer} onEdit={setEditBuyer} />
          ))}
        </div>
      )}
      <AddBuyerModal open={addModalOpen} onClose={() => setAddModalOpen(false)} agents={agents.length > 0 ? agents : undefined} />
      <EditBuyerModal open={!!editBuyer} onClose={() => setEditBuyer(null)} buyer={editBuyer} />
    </div>
  );
}
