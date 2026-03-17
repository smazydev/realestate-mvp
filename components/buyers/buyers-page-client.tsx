"use client";

import { useState } from "react";
import { Suspense } from "react";
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

export function BuyersPageClient({ buyers, cities, neighborhoods, agents }: Props) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editBuyer, setEditBuyer] = useState<BuyerWithLocations | null>(null);

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
      {buyers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">No buyers yet.</p>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="mt-2 inline-block text-sm font-medium text-gray-900 underline dark:text-gray-200"
          >
            Add your first buyer
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {buyers.map((buyer) => (
            <BuyerCard key={buyer.id} buyer={buyer} onEdit={setEditBuyer} />
          ))}
        </div>
      )}
      <AddBuyerModal open={addModalOpen} onClose={() => setAddModalOpen(false)} agents={agents.length > 0 ? agents : undefined} />
      <EditBuyerModal open={!!editBuyer} onClose={() => setEditBuyer(null)} buyer={editBuyer} />
    </div>
  );
}
