"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { AgentForm } from "@/components/admin/agent-form";
import { SubmitButton } from "@/components/ui/submit-button";

type AgentRow = { id: string; display_name: string | null; email: string; brokerage_name: string | null };

type Props = {
  open: boolean;
  onClose: () => void;
  agent: AgentRow | null;
};

export function EditAgentModal({ open, onClose, agent }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  function handleSuccess() {
    onClose();
    router.refresh();
  }

  if (!agent) return null;

  return (
    <Modal open={open} onClose={onClose} title="Edit Agent" subtitle="Edit">
      <AgentForm
        mode="edit"
        agent={agent}
        hideActions
        formId="edit-agent-form"
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
            pendingLabel="Saving…"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Save
          </SubmitButton>
        </div>
      </AgentForm>
    </Modal>
  );
}
