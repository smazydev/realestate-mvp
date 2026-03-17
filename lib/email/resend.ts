import { createClient } from "@/lib/supabase/server";
import { getOrCreateCurrentAgent } from "@/lib/auth";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM ?? "onboarding@resend.dev";

export type SendResult = { success: true; messageId?: string } | { success: false; error: string };

export async function sendAndLogEmail(params: {
  to: string;
  subject: string;
  body: string;
  propertyId?: string | null;
  buyerId?: string | null;
}): Promise<SendResult> {
  const agent = await getOrCreateCurrentAgent();
  if (!agent) return { success: false, error: "Not authenticated" };

  if (!RESEND_API_KEY) return { success: false, error: "Email not configured (RESEND_API_KEY)" };

  let providerMessageId: string | null = null;
  let status = "sent";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [params.to],
        subject: params.subject,
        html: params.body.replace(/\n/g, "<br/>"),
      }),
    });

    const data = (await res.json()) as { id?: string; message?: string };
    if (!res.ok) {
      status = "failed";
      await logEmail({ ...params, recipient_email: params.to, status, providerMessageId: null });
      return { success: false, error: data?.message ?? res.statusText };
    }
    providerMessageId = data?.id ?? null;
  } catch (e) {
    status = "failed";
    await logEmail({ ...params, recipient_email: params.to, status, providerMessageId: null });
    return { success: false, error: e instanceof Error ? e.message : "Send failed" };
  }

  await logEmail({ ...params, recipient_email: params.to, status, providerMessageId });
  return { success: true, messageId: providerMessageId ?? undefined };
}

async function logEmail(params: {
  propertyId?: string | null;
  buyerId?: string | null;
  recipient_email: string;
  subject: string;
  body: string;
  status: string;
  providerMessageId: string | null;
}) {
  const agent = await getOrCreateCurrentAgent();
  if (!agent) return;

  const supabase = await createClient();
  await supabase.from("email_logs").insert({
    sender_agent_id: agent.id,
    property_id: params.propertyId ?? null,
    buyer_id: params.buyerId ?? null,
    recipient_email: params.recipient_email,
    subject: params.subject,
    body: params.body,
    status: params.status,
    provider_message_id: params.providerMessageId,
  });
}
