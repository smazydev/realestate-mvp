"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfile } from "@/app/actions/profiles";

export type ProfileForEdit = { id: string; full_name: string | null; email: string | null; role: string };

type Props = {
  profile: ProfileForEdit;
  hideActions?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  onLoadingChange?: (loading: boolean) => void;
  formId?: string;
  children?: React.ReactNode;
};

export function ProfileEditForm({ profile, hideActions, onSuccess, onCancel, onLoadingChange, formId, children }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: profile.full_name ?? "",
    email: profile.email ?? "",
    role: profile.role,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    onLoadingChange?.(true);
    const result = await updateProfile(profile.id, {
      full_name: form.full_name || null,
      email: form.email || null,
      role: form.role === "admin" || form.role === "agent" ? form.role : undefined,
    });
    if (result.success) {
      toast.success("Profile updated");
      if (onSuccess) onSuccess();
      else {
        router.push("/admin/profiles");
        router.refresh();
      }
    } else {
      toast.error(result.error);
    }
    setLoading(false);
    onLoadingChange?.(false);
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className={hideActions ? "space-y-4" : "max-w-md space-y-4"}>
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full name</label>
        <input
          id="full_name"
          value={form.full_name}
          onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
        <select
          id="role"
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        >
          <option value="agent">agent</option>
          <option value="admin">admin</option>
        </select>
      </div>
      {!hideActions && (
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
          >
            {loading ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => (onCancel ? onCancel() : router.back())}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-600 dark:text-gray-300"
          >
            Cancel
          </button>
        </div>
      )}
      {hideActions && children}
    </form>
  );
}
