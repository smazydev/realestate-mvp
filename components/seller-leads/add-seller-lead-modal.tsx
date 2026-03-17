"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { SellerLeadForm } from "@/components/seller-leads/seller-lead-form";
import { SubmitButton } from "@/components/ui/submit-button";

type AgentOption = { id: string; display_name: string | null; email: string };

type Props = {
  open: boolean;
  onClose: () => void;
  agents?: AgentOption[];
};

export function AddSellerLeadModal({ open, onClose, agents }: Props) {
  const router = useRouter();
  const [clearKey, setClearKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  function handleSuccess() {
    onClose();
    router.refresh();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Seller Lead" subtitle="Add">
      <SellerLeadForm
        key={clearKey}
        mode="create"
        agents={agents}
        onSuccess={handleSuccess}
        hideActions
        formId="add-seller-lead-form"
        onLoadingChange={setSubmitting}
      >
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setClearKey((k) => k + 1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Clear form
          </button>
          <SubmitButton
            pending={submitting}
            pendingLabel="Creating…"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Create
          </SubmitButton>
        </div>
      </SellerLeadForm>
    </Modal>
  );
}
