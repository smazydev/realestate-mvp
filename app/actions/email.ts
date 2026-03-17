"use server";

import { sendAndLogEmail } from "@/lib/email/resend";
import { sendMatchEmailSchema, type SendMatchEmailInput } from "@/lib/validations/email";

type Result = { success: true } | { success: false; error: string };

export async function sendMatchEmail(formData: SendMatchEmailInput): Promise<Result> {
  const parsed = sendMatchEmailSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  const result = await sendAndLogEmail({
    to: parsed.data.recipient_email,
    subject: parsed.data.subject,
    body: parsed.data.body,
    propertyId: parsed.data.property_id ?? null,
    buyerId: parsed.data.buyer_id ?? null,
  });

  return result.success ? { success: true } : { success: false, error: result.error };
}
