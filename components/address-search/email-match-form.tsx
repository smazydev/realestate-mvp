"use client";

import { useState } from "react";
import { toast } from "sonner";
import { sendMatchEmail } from "@/app/actions/email";

type Props = {
  propertyId: string;
  buyerId: string;
  recipientEmail: string;
  buyerName?: string | null;
  propertyAddress: string;
};

const DEFAULT_SUBJECT = "Property match: {{address}}";
const DEFAULT_BODY = `Hi,

A property matching your criteria has been identified:

{{address}}

Let me know if you'd like to schedule a showing or get more details.`;

function fillTemplate(template: string, address: string): string {
  return template.replace(/\{\{address\}\}/g, address);
}

export function EmailMatchForm({ propertyId, buyerId, recipientEmail, buyerName, propertyAddress }: Props) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [to, setTo] = useState(recipientEmail);
  const [subject, setSubject] = useState(fillTemplate(DEFAULT_SUBJECT, propertyAddress));
  const [body, setBody] = useState(fillTemplate(DEFAULT_BODY, propertyAddress));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!to.trim()) {
      toast.error("Recipient email required");
      return;
    }
    setSending(true);
    const result = await sendMatchEmail({
      recipient_email: to.trim(),
      subject: subject.trim() || "Property match",
      body: body.trim(),
      property_id: propertyId,
      buyer_id: buyerId,
    });
    if (result.success) {
      toast.success("Email sent");
      setOpen(false);
    } else {
      toast.error(result.error);
    }
    setSending(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
      >
        Email
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2 rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">To</label>
        <input
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
          placeholder="buyer@example.com"
          className="mt-0.5 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-0.5 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          className="mt-0.5 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={sending}
          className="flex items-center gap-1.5 rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
        >
          {sending && (
            <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-gray-900 border-t-transparent dark:border-gray-100 dark:border-t-transparent" aria-hidden />
          )}
          {sending ? "Sending…" : "Send"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:text-gray-300">
          Cancel
        </button>
      </div>
    </form>
  );
}
