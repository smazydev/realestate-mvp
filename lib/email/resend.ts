import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateCurrentAgent } from "@/lib/auth";

const RESEND_FROM = process.env.RESEND_FROM ?? "onboarding@resend.dev";

export type SendResult = { success: true; messageId?: string } | { success: false; error: string };

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export async function sendAndLogEmail(params: {
  to: string;
  subject: string;
  body: string;
  propertyId?: string | null;
  buyerId?: string | null;
}): Promise<SendResult> {
  const agent = await getOrCreateCurrentAgent();
  if (!agent) return { success: false, error: "Not authenticated" };

  const resend = getResend();
  if (!resend) return { success: false, error: "Email not configured (RESEND_API_KEY)" };

  let providerMessageId: string | null = null;
  let status = "sent";

  const html = params.body.replace(/\n/g, "<br/>");

  try {
    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: params.to,
      subject: params.subject,
      html,
    });

    if (error) {
      status = "failed";
      await logEmail({ ...params, recipient_email: params.to, status, providerMessageId: null });
      return { success: false, error: error.message ?? "Resend send failed" };
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
