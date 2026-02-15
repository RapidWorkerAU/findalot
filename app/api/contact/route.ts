import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

type ContactPayload = {
  listingId: string;
  agencyId: string;
  subject?: string;
  message: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
};

export async function POST(req: Request) {
  const payload = (await req.json().catch(() => ({}))) as Partial<ContactPayload>;
  if (!payload.listingId || !payload.agencyId || !payload.message) {
    return NextResponse.json({ error: "listingId, agencyId and message are required" }, { status: 400 });
  }

  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  const { data: enquiry, error: enquiryError } = await supabase
    .from("enquiries")
    .insert({
      listing_id: payload.listingId,
      agency_id: payload.agencyId,
      user_id: user?.id ?? null,
      contact_name: payload.contactName ?? null,
      contact_email: payload.contactEmail ?? null,
      contact_phone: payload.contactPhone ?? null,
      subject: payload.subject ?? null,
    })
    .select("id")
    .single();

  if (enquiryError || !enquiry) {
    return NextResponse.json({ error: enquiryError?.message ?? "Failed to create enquiry" }, { status: 400 });
  }

  const { error: messageError } = await supabase.from("enquiry_messages").insert({
    enquiry_id: enquiry.id,
    sender_type: "buyer",
    sender_user_id: user?.id ?? null,
    message: payload.message,
  });

  if (messageError) {
    return NextResponse.json({ error: messageError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, enquiryId: enquiry.id });
}
