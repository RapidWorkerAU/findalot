import { Resend } from "resend";

export function resendClient() {
  const key = process.env.RESEND_API_KEY!;
  return new Resend(key);
}
