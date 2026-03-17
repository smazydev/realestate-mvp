"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { SellerLeadForm } from "@/components/seller-leads/seller-lead-form";
import { SubmitButton } from "@/components/ui/submit-button";
import type { SellerLeadWithAssigned } from "@/lib/db/queries";

type AgentOption = { id: string; display_name: string | null; email: string };

type Props = {
  open: boolean;
  onClose: () => void;
  lead: SellerLeadWithAssigned | null;
  agents?: AgentOption[];
};

export function EditSellerLeadModal({ open, onClose, lead, agents }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  function handleSuccess() {
    onClose();
    router.refresh();
  }

  if (!lead) return null;

  return (
    <Modal open={open} onClose={onClose} title="Edit Seller Lead" subtitle="Edit">
      <SellerLeadForm
        mode="edit"
        lead={lead}
        agents={agents}
        onSuccess={handleSuccess}
        onCancel={onClose}
        hideActions
        formId="edit-seller-lead-form"
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
            pendingLabel="Updating…"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Update
          </SubmitButton>
        </div>
      </SellerLeadForm>
    </Modal>
  );
}
