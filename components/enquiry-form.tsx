"use client";

import { FormEvent, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";

type Props = {
  listingId: string;
  agencyId: string;
  defaultSubject: string;
};

export function EnquiryForm({ listingId, agencyId, defaultSubject }: Props) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setStatus("");

    const form = new FormData(e.currentTarget);
    const subject = String(form.get("subject") || defaultSubject);
    const message = String(form.get("message") || "");
    const contact_name = String(form.get("contact_name") || "");
    const contact_email = String(form.get("contact_email") || "");
    const contact_phone = String(form.get("contact_phone") || "");

    if (!message.trim()) {
      setLoading(false);
      setError("Message is required.");
      return;
    }

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    const { data: enquiry, error: enquiryError } = await supabase
      .from("enquiries")
      .insert({
        listing_id: listingId,
        agency_id: agencyId,
        user_id: user?.id ?? null,
        contact_name: contact_name || null,
        contact_email: contact_email || null,
        contact_phone: contact_phone || null,
        subject,
      })
      .select("id")
      .single();

    if (enquiryError || !enquiry) {
      setLoading(false);
      setError(enquiryError?.message ?? "Failed to submit enquiry.");
      return;
    }

    const { error: messageError } = await supabase.from("enquiry_messages").insert({
      enquiry_id: enquiry.id,
      sender_type: "buyer",
      sender_user_id: user?.id ?? null,
      message,
    });

    if (messageError) {
      setLoading(false);
      setError(messageError.message);
      return;
    }

    e.currentTarget.reset();
    setStatus("Enquiry sent.");
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-base font-semibold">Enquire about this property</h2>
      <input name="subject" defaultValue={defaultSubject} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
      <input name="contact_name" placeholder="Your name (optional)" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
      <input name="contact_email" placeholder="Your email (optional)" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
      <input name="contact_phone" placeholder="Your phone (optional)" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
      <textarea
        name="message"
        rows={5}
        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
        placeholder="Hi, I would like more information and inspection times."
      />
      <button disabled={loading} className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60">
        {loading ? "Sending..." : "Send enquiry"}
      </button>
      {status && <div className="text-xs text-emerald-700">{status}</div>}
      {error && <div className="text-xs text-rose-700">{error}</div>}
    </form>
  );
}
