"use client";

import { useState } from "react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { EditProfileModal } from "@/components/admin/edit-profile-modal";

type ProfileRow = { id: string; full_name: string | null; email: string | null; role: string };

type Props = { profiles: ProfileRow[] };

export function AdminProfilesPageClient({ profiles }: Props) {
  const [editProfile, setEditProfile] = useState<ProfileRow | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb segments={[{ label: "Admin", href: "/admin" }, { label: "Profiles" }]} />
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Profiles</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Users and roles. Edit to change role (admin/agent).</p>
      {profiles.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No profiles yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full min-w-[500px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#2a2a2a]">
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Email</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Full name</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Role</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 dark:border-gray-700 dark:bg-[#1a1a1a]">
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-200">{p.email ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{p.full_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.role === "admin" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200" : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"}`}>
                      {p.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setEditProfile(p)}
                      className="text-sm font-medium text-gray-900 underline dark:text-gray-200"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <EditProfileModal open={!!editProfile} onClose={() => setEditProfile(null)} profile={editProfile} />
    </div>
  );
}
