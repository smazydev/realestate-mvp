"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteBuyer } from "@/app/actions/buyers";
import { formatCurrency } from "@/lib/mock-data";
import type { BuyerWithLocations } from "@/lib/db/queries";

type Props = { buyer: BuyerWithLocations; onEdit?: (buyer: BuyerWithLocations) => void };

export function BuyerCard({ buyer, onEdit }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const cities = [...new Set((buyer.buyer_target_locations ?? []).map((l) => l.city).filter(Boolean))];

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (deleting || !confirm("Delete this buyer?")) return;
    setDeleting(true);
    const result = await deleteBuyer(buyer.id);
    if (result.success) {
      toast.success("Buyer deleted");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setDeleting(false);
  }

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-md dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Buyer Name</p>
          <p className="mt-0.5 font-semibold text-gray-900 dark:text-gray-100">{buyer.buyer_name}</p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onEdit?.(buyer)}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label="Edit buyer"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 disabled:opacity-50"
            aria-label="Delete buyer"
          >
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Target Cities</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {cities.length ? cities.map((c) => (
            <span key={c} className="rounded-md bg-slate-200/80 px-2 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-600 dark:text-slate-200">{c}</span>
          )) : <span className="text-sm text-gray-400">—</span>}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Budget Max</p>
        <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">
          {buyer.budget_max != null ? formatCurrency(Number(buyer.budget_max)) : "—"}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Notes</p>
        <p className="mt-0.5 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{buyer.notes || "—"}</p>
      </div>
    </article>
  );
}
