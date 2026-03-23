"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBuyer, updateBuyer } from "@/app/actions/buyers";
import type { CreateBuyerInput } from "@/lib/validations/buyer";
import type { BuyerWithLocations } from "@/lib/db/queries";

type AgentOption = { id: string; display_name: string | null; email: string };

type Props = {
  mode: "create";
  agentEmail?: string;
  agents?: AgentOption[];
  /** When provided, called on successful create instead of navigating (e.g. for modal). */
  onSuccess?: () => void;
  onCancel?: () => void;
  hideActions?: boolean;
  formId?: string;
  children?: React.ReactNode;
  /** Called when submit starts/ends so modal footer can show loading (e.g. for SubmitButton pending). */
  onLoadingChange?: (loading: boolean) => void;
} | {
  mode: "edit";
  buyer: BuyerWithLocations;
  agentEmail?: string;
  agents?: AgentOption[];
  onSuccess?: () => void;
  onCancel?: () => void;
  hideActions?: boolean;
  formId?: string;
  children?: React.ReactNode;
  onLoadingChange?: (loading: boolean) => void;
};

export function BuyerForm(props: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEdit = props.mode === "edit";
  const buyer = props.mode === "edit" ? props.buyer : null;

  const agents = "agents" in props ? props.agents : undefined;
  const [form, setForm] = useState<CreateBuyerInput>({
    agent_id: undefined,
    buyer_name: buyer?.buyer_name ?? "",
    budget_min: buyer?.budget_min != null ? Number(buyer.budget_min) : null,
    budget_max: buyer?.budget_max != null ? Number(buyer.budget_max) : null,
    notes: buyer?.notes ?? "",
    status: buyer?.status ?? "",
    locations: buyer?.buyer_target_locations?.length
      ? buyer.buyer_target_locations.map((l) => ({
          city: l.city ?? "",
        }))
      : [{ city: "" }],
  });

  function addLocation() {
    setForm((f) => ({ ...f, locations: [...(f.locations ?? []), { city: "" }] }));
  }

  function removeLocation(i: number) {
    setForm((f) => ({ ...f, locations: f.locations?.filter((_, idx) => idx !== i) ?? [] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    props.onLoadingChange?.(true);
    const result = isEdit && buyer
      ? await updateBuyer(buyer.id, form)
      : await createBuyer(form);
    if (result.success) {
      toast.success(isEdit ? "Buyer updated" : "Buyer created");
      if (props.onSuccess) props.onSuccess();
      else { router.push("/buyers"); router.refresh(); }
    } else {
      toast.error(result.error);
    }
    setLoading(false);
    props.onLoadingChange?.(false);
  }

  const hideActions = "hideActions" in props && props.hideActions;

  return (
    <form id={props.formId} onSubmit={handleSubmit} className={hideActions ? "space-y-4" : "max-w-2xl space-y-6"}>
      {agents && agents.length > 0 && (
        <div>
          <label htmlFor="agent_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign to agent *</label>
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
        <label htmlFor="buyer_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Buyer name *</label>
        <input
          id="buyer_name"
          required
          value={form.buyer_name}
          onChange={(e) => setForm((f) => ({ ...f, buyer_name: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="budget_min" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Budget min</label>
          <input
            id="budget_min"
            type="number"
            min={0}
            value={form.budget_min ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, budget_min: e.target.value ? Number(e.target.value) : null }))}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label htmlFor="budget_max" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Budget max</label>
          <input
            id="budget_max"
            type="number"
            min={0}
            value={form.budget_max ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, budget_max: e.target.value ? Number(e.target.value) : null }))}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
        <textarea
          value={form.notes ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || null }))}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target cities</label>
          <button type="button" onClick={addLocation} className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">+ Add</button>
        </div>
        <div className="mt-2 space-y-2">
          {(form.locations ?? []).map((loc, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder="City"
                value={loc.city ?? ""}
                onChange={(e) => setForm((f) => {
                  const locs = [...(f.locations ?? [])];
                  locs[i] = { ...locs[i], city: e.target.value };
                  return { ...f, locations: locs };
                })}
                className="flex-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              />
              <button type="button" onClick={() => removeLocation(i)} className="text-red-600 hover:text-red-700 dark:text-red-400">×</button>
            </div>
          ))}
        </div>
      </div>
      {!hideActions && (
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            {loading ? "Saving…" : isEdit ? "Update buyer" : "Create buyer"}
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
