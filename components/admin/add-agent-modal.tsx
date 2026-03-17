"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { AgentForm } from "@/components/admin/agent-form";
import { SubmitButton } from "@/components/ui/submit-button";

type ProfileOption = { id: string; full_name: string | null; email: string | null; role: string };

type Props = {
  open: boolean;
  onClose: () => void;
  profilesWithoutAgent: ProfileOption[];
};

export function AddAgentModal({ open, onClose, profilesWithoutAgent }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  function handleSuccess() {
    onClose();
    router.refresh();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Agent" subtitle="Add">
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Link a user (profile) to an agent record. Only users without an agent are listed.</p>
      <AgentForm
        mode="create"
        profilesWithoutAgent={profilesWithoutAgent}
        hideActions
        formId="add-agent-form"
        onSuccess={handleSuccess}
        onCancel={onClose}
        onLoadingChange={setSubmitting}
      >
        <div className="mt-6 flex items-center justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <SubmitButton
            pending={submitting}
            pendingLabel="Creating…"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Create agent
          </SubmitButton>
        </div>
      </AgentForm>
    </Modal>
  );
}
