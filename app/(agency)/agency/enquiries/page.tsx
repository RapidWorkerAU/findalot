import { supabaseServer } from "@/lib/supabase-server";
import type { Enquiry } from "@/lib/types";

export default async function EnquiriesPage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">Please log in as an agency user.</div>;
  }

  const { data: membership } = await supabase
    .from("agency_members")
    .select("agency_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">No agency membership found.</div>;
  }

  const { data, error } = await supabase
    .from("enquiries")
    .select("*, listing:listings(id,title,address_line,suburb,state), enquiry_messages(*)")
    .eq("agency_id", membership.agency_id as string)
    .order("created_at", { ascending: false });

  const enquiries = (data ?? []) as Enquiry[];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Enquiries</h1>
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error.message}</div>
      ) : enquiries.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">No enquiries yet.</div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((enquiry) => (
            <article key={enquiry.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{enquiry.subject || "Property enquiry"}</div>
                  <div className="text-xs text-slate-600">
                    {enquiry.listing?.title} - {enquiry.listing?.address_line}, {enquiry.listing?.suburb} {enquiry.listing?.state}
                  </div>
                </div>
                <div className="text-xs text-slate-500">{new Date(enquiry.created_at).toLocaleString()}</div>
              </div>
              <div className="mt-3 text-xs text-slate-600">
                Contact: {enquiry.contact_name || "Unknown"} {enquiry.contact_email ? `| ${enquiry.contact_email}` : ""}{" "}
                {enquiry.contact_phone ? `| ${enquiry.contact_phone}` : ""}
              </div>
              <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3">
                {(enquiry.enquiry_messages ?? []).map((message) => (
                  <div key={message.id} className="text-xs text-slate-700">
                    <span className="font-semibold">{message.sender_type}:</span> {message.message}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
