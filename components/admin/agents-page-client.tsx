"use client";

import { useState } from "react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { AddAgentModal } from "@/components/admin/add-agent-modal";
import { EditAgentModal } from "@/components/admin/edit-agent-modal";

type AgentRow = { id: string; display_name: string | null; email: string; brokerage_name: string | null };
type ProfileOption = { id: string; full_name: string | null; email: string | null; role: string };

type Props = {
  agents: AgentRow[];
  profilesWithoutAgent: ProfileOption[];
};

export function AdminAgentsPageClient({ agents, profilesWithoutAgent }: Props) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editAgent, setEditAgent] = useState<AgentRow | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Breadcrumb segments={[{ label: "Admin", href: "/admin" }, { label: "Agents" }]} />
          <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">Agents</h1>
        </div>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900"
        >
          Add Agent
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">Create agents and link them to users (profiles).</p>
      {agents.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No agents yet. Add one to get started.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full min-w-[500px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#2a2a2a]">
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Display name</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Email</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Brokerage</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a.id} className="border-b border-gray-100 dark:border-gray-700 dark:bg-[#1a1a1a]">
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-200">{a.display_name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{a.email}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{a.brokerage_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setEditAgent(a)}
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
      <AddAgentModal open={addModalOpen} onClose={() => setAddModalOpen(false)} profilesWithoutAgent={profilesWithoutAgent} />
      <EditAgentModal open={!!editAgent} onClose={() => setEditAgent(null)} agent={editAgent} />
    </div>
  );
}
