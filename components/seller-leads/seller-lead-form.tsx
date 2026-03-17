"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSellerLead, updateSellerLead } from "@/app/actions/seller-leads";
import type { CreateSellerLeadInput } from "@/lib/validations/seller-lead";
import type { SellerLeadWithAssigned } from "@/lib/db/queries";

type AgentOption = { id: string; display_name: string | null; email: string };

type Props = {
  mode: "create";
  agents?: AgentOption[];
  onSuccess?: () => void;
  onCancel?: () => void;
  hideActions?: boolean;
  formId?: string;
  children?: React.ReactNode;
  onLoadingChange?: (loading: boolean) => void;
} | {
  mode: "edit";
  lead: SellerLeadWithAssigned;
  agents?: AgentOption[];
  onSuccess?: () => void;
  onCancel?: () => void;
  hideActions?: boolean;
  formId?: string;
  children?: React.ReactNode;
  onLoadingChange?: (loading: boolean) => void;
};

function tagsFromString(s: string): string[] {
  return s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function tagsToString(tags: string[]): string {
  return (tags ?? []).join(", ");
}

export function SellerLeadForm(props: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEdit = props.mode === "edit";
  const lead = props.mode === "edit" ? props.lead : null;

  const agents = "agents" in props ? props.agents : undefined;
  const [form, setForm] = useState<CreateSellerLeadInput>({
    agent_id: undefined,
    property_address: lead?.property_address ?? "",
    owner_name: lead?.owner_name ?? "",
    assigned_agent_id: lead?.assigned_agent_id ?? undefined,
    tags: lead?.tags ?? [],
    city: lead?.city ?? "",
    state: lead?.state ?? "",
    zip: lead?.zip ?? "",
    source: lead?.source ?? "",
    status: lead?.status ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    props.onLoadingChange?.(true);
    const payload = {
      ...form,
      tags: tagsFromString(tagsToString(form.tags ?? [])),
    };
    const result = isEdit && lead
      ? await updateSellerLead(lead.id, payload)
      : await createSellerLead(payload);
    if (result.success) {
      toast.success(isEdit ? "Seller lead updated" : "Seller lead created");
      if (props.onSuccess) props.onSuccess();
      else {
        router.push("/seller-leads");
        router.refresh();
      }
    } else {
      toast.error(result.error);
    }
    setLoading(false);
    props.onLoadingChange?.(false);
  }

  const hideActions = "hideActions" in props && props.hideActions;

  return (
    <form id={props.formId} onSubmit={handleSubmit} className={hideActions ? "space-y-4" : "max-w-2xl space-y-6"}>
      {agents && agents.length > 0 && props.mode === "create" && (
        <div>
          <label htmlFor="agent_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Owner agent *</label>
          <select
            id="agent_id"
            required
            value={form.agent_id ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, agent_id: e.target.value || undefined }))}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="">Select agent</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.display_name || a.email} ({a.email})</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="property_address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Property address *</label>
        <input
          id="property_address"
          required
          value={form.property_address}
          onChange={(e) => setForm((f) => ({ ...f, property_address: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label htmlFor="owner_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Owner name</label>
        <input
          id="owner_name"
          value={form.owner_name ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, owner_name: e.target.value || null }))}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>
      {agents && agents.length > 0 && (
        <div>
          <label htmlFor="assigned_agent_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assigned to agent</label>
          <select
            id="assigned_agent_id"
            value={form.assigned_agent_id ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, assigned_agent_id: e.target.value || undefined }))}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="">None</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.display_name || a.email} ({a.email})</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags (comma-separated)</label>
        <input
          id="tags"
          value={tagsToString(form.tags ?? [])}
          onChange={(e) => setForm((f) => ({ ...f, tags: tagsFromString(e.target.value) }))}
          placeholder="e.g. Expired Listing, Hot Lead"
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
          <input
            id="city"
            value={form.city ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value || null }))}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
          <input
            id="state"
            value={form.state ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value || null }))}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label htmlFor="zip" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ZIP</label>
          <input
            id="zip"
            value={form.zip ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value || null }))}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
      <div>
        <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Source</label>
        <input
          id="source"
          value={form.source ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, source: e.target.value || null }))}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
        <input
          id="status"
          value={form.status ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value || null }))}
          placeholder="e.g. New, Contacted, Qualified"
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>
      {!hideActions && (
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            {loading ? "Saving…" : isEdit ? "Update lead" : "Create lead"}
          </button>
          <button
            type="button"
            onClick={() => props.onCancel ? props.onCancel() : router.back()}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      )}
      {hideActions && props.children}
    </form>
  );
}
