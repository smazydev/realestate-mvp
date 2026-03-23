"use client";

import { useState } from "react";
import { toast } from "sonner";
import { sendMatchEmail } from "@/app/actions/email";
import { Modal } from "@/components/ui/modal";

type Props = {
  buyerId: string;
  buyerName: string | null | undefined;
  recipientEmail: string;
  propertyAddress: string;
  /** Create or return existing property_search id for logging / matching. */
  ensurePropertyId: () => Promise<string | null>;
};

const DEFAULT_SUBJECT = "Property match: {{address}}";
const DEFAULT_BODY = `Hi{{name}},

A property matching your criteria has been identified:

{{address}}

Let me know if you'd like to schedule a showing or get more details.`;

function fillTemplate(template: string, address: string, buyerName?: string | null): string {
  const namePart = buyerName?.trim() ? ` ${buyerName.trim()}` : "";
  return template.replace(/\{\{address\}\}/g, address).replace(/\{\{name\}\}/g, namePart);
}

export function EmailMatchForm({
  buyerId,
  buyerName,
  recipientEmail,
  propertyAddress,
  ensurePropertyId,
}: Props) {
  const displayName = buyerName?.trim() || "buyer";
  const [modalOpen, setModalOpen] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [sending, setSending] = useState(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [to, setTo] = useState(recipientEmail);
  const [subject, setSubject] = useState(fillTemplate(DEFAULT_SUBJECT, propertyAddress, buyerName));
  const [body, setBody] = useState(fillTemplate(DEFAULT_BODY, propertyAddress, buyerName));

  function handleClose() {
    setModalOpen(false);
  }

  async function handleOpen() {
    setPreparing(true);
    try {
      const id = await ensurePropertyId();
      if (!id) {
        toast.error("Could not prepare this property for email");
        return;
      }
      setPropertyId(id);
      setTo(recipientEmail);
      setSubject(fillTemplate(DEFAULT_SUBJECT, propertyAddress, buyerName));
      setBody(fillTemplate(DEFAULT_BODY, propertyAddress, buyerName));
      setModalOpen(true);
    } finally {
      setPreparing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!to.trim()) {
      toast.error("Recipient email required");
      return;
    }
    let id = propertyId;
    if (!id) {
      id = await ensurePropertyId();
      if (!id) {
        toast.error("Could not prepare this property for email");
        return;
      }
      setPropertyId(id);
    }
    setSending(true);
    const result = await sendMatchEmail({
      recipient_email: to.trim(),
      subject: subject.trim() || "Property match",
      body: body.trim(),
      property_id: id,
      buyer_id: buyerId,
    });
    if (result.success) {
      toast.success(`Email sent to ${to.trim()} via Resend`);
      handleClose();
    } else {
      toast.error(result.error);
    }
    setSending(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={preparing}
        className="flex items-center gap-1.5 rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
      >
        {preparing && (
          <span
            className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-gray-900 dark:border-t-transparent"
            aria-hidden
          />
        )}
        {preparing ? "Preparing…" : `Send email to ${displayName}`}
      </button>

      <Modal
        open={modalOpen}
        onClose={handleClose}
        title="Send property email"
        subtitle={`To ${displayName} · Resend`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor={`match-email-to-${buyerId}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              To
            </label>
            <input
              id={`match-email-to-${buyerId}`}
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
              placeholder="buyer@example.com"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label htmlFor={`match-email-subject-${buyerId}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Subject
            </label>
            <input
              id={`match-email-subject-${buyerId}`}
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label htmlFor={`match-email-body-${buyerId}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Message
            </label>
            <textarea
              id={`match-email-body-${buyerId}`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            >
              {sending && (
                <span
                  className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-gray-900 dark:border-t-transparent"
                  aria-hidden
                />
              )}
              {sending ? "Sending…" : "Send email"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
