"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { AddSellerLeadModal } from "@/components/seller-leads/add-seller-lead-modal";
import { EditSellerLeadModal } from "@/components/seller-leads/edit-seller-lead-modal";
import { deleteSellerLead } from "@/app/actions/seller-leads";
import type { SellerLeadWithAssigned } from "@/lib/db/queries";

type AgentOption = { id: string; display_name: string | null; email: string };

type Props = {
  leads: SellerLeadWithAssigned[];
  agents: AgentOption[];
};

export function SellerLeadsPageClient({ leads, agents }: Props) {
  const router = useRouter();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editLead, setEditLead] = useState<SellerLeadWithAssigned | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this seller lead?")) return;
    setDeletingId(id);
    const result = await deleteSellerLead(id);
    if (result.success) {
      toast.success("Seller lead deleted");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setDeletingId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Breadcrumb segments={[{ label: "Seller Leads", href: "/seller-leads" }, { label: "Seller Leads List" }]} />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage seller leads and assignments.</p>
        </div>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
        >
          Add Lead
        </button>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#2a2a2a]">
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Property Address</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Owner Name</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Assigned To</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Tags</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">City</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">State</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">ZIP</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Source</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No seller leads yet.{" "}
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(true)}
                    className="font-medium text-gray-900 underline dark:text-gray-200"
                  >
                    Add your first lead
                  </button>
                </td>
              </tr>
            ) : (
              leads.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 dark:border-gray-700 dark:bg-[#1a1a1a]">
                  <td className="px-4 py-3">
                    {row.status && (
                      <span className="mr-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                        {row.status}
                      </span>
                    )}
                    <span className="text-gray-900 dark:text-gray-200">{row.property_address}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.owner_name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {(row.assigned_agent?.display_name || row.assigned_agent?.email) ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {!row.tags?.length && <span className="text-gray-400">—</span>}
                      {row.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.city ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.state ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.zip ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.source ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.status ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditLead(row)}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                        aria-label="Edit"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row.id)}
                        disabled={deletingId === row.id}
                        className="rounded p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 disabled:opacity-50"
                        aria-label="Delete"
                      >
                        {deletingId === row.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{leads.length} record{leads.length !== 1 ? "s" : ""}</p>
      <AddSellerLeadModal open={addModalOpen} onClose={() => setAddModalOpen(false)} agents={agents.length > 0 ? agents : undefined} />
      <EditSellerLeadModal open={!!editLead} onClose={() => setEditLead(null)} lead={editLead} agents={agents.length > 0 ? agents : undefined} />
    </div>
  );
}
