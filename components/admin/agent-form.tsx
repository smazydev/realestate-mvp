"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAgent, updateAgent } from "@/app/actions/agents";

type ProfileOption = { id: string; full_name: string | null; email: string | null; role: string };

type Base = {
  hideActions?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  onLoadingChange?: (loading: boolean) => void;
  formId?: string;
  children?: React.ReactNode;
};

type Props =
  | ({ mode: "create"; profilesWithoutAgent: ProfileOption[] } & Base)
  | ({ mode: "edit"; agent: { id: string; display_name: string | null; email: string; brokerage_name: string | null } } & Base);

export function AgentForm(props: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isCreate = props.mode === "create";
  const agent = props.mode === "edit" ? props.agent : null;
  const [form, setForm] = useState({
    user_id: "",
    display_name: agent?.display_name ?? "",
    email: agent?.email ?? "",
    brokerage_name: agent?.brokerage_name ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    props.onLoadingChange?.(true);
    const result = isCreate
      ? await createAgent({ user_id: form.user_id, display_name: form.display_name || null, email: form.email, brokerage_name: form.brokerage_name || null })
      : await updateAgent(agent!.id, { display_name: form.display_name || null, email: form.email, brokerage_name: form.brokerage_name || null });
    if (result.success) {
      toast.success(isCreate ? "Agent created" : "Agent updated");
      if (props.onSuccess) props.onSuccess();
      else {
        router.push("/admin/agents");
        router.refresh();
      }
    } else {
      toast.error(result.error);
    }
    setLoading(false);
    props.onLoadingChange?.(false);
  }

  const hideActions = props.hideActions;

  return (
    <form id={props.formId} onSubmit={handleSubmit} className={hideActions ? "space-y-4" : "max-w-md space-y-4"}>
      {isCreate && (
        <div>
          <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">User (profile) *</label>
          <select
            id="user_id"
            required
            value={form.user_id}
            onChange={(e) => {
              const id = e.target.value;
              const p = props.profilesWithoutAgent.find((x) => x.id === id);
              setForm((f) => ({ ...f, user_id: id, email: p?.email ?? f.email, display_name: p?.full_name ?? f.display_name }));
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="">Select a user</option>
            {props.profilesWithoutAgent.map((p) => (
              <option key={p.id} value={p.id}>{p.email ?? p.id} {p.full_name ? `(${p.full_name})` : ""}</option>
            ))}
          </select>
          {props.profilesWithoutAgent.length === 0 && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">All profiles already have an agent. Create a new user first (sign up).</p>
          )}
        </div>
      )}
      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Display name</label>
        <input
          id="display_name"
          value={form.display_name}
          onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label htmlFor="brokerage_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brokerage name</label>
        <input
          id="brokerage_name"
          value={form.brokerage_name}
          onChange={(e) => setForm((f) => ({ ...f, brokerage_name: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>
      {!hideActions && (
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
          >
            {loading ? "Saving…" : isCreate ? "Create agent" : "Save"}
          </button>
          <button type="button" onClick={() => (props.onCancel ? props.onCancel() : router.back())} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-600 dark:text-gray-300">
            Cancel
          </button>
        </div>
      )}
      {hideActions && props.children}
    </form>
  );
}
