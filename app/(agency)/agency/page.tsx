import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";

export default async function AgencyDashboardPage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">Please log in as an agency user.</div>;
  }

  const { data: membership } = await supabase
    .from("agency_members")
    .select("agency_id, agencies(name)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Agency dashboard</h1>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
          No agency membership found yet. Complete signup as an agency account.
        </div>
      </div>
    );
  }

  const agencyId = membership.agency_id as string;
  const { count: active } = await supabase.from("listings").select("id", { count: "exact", head: true }).eq("agency_id", agencyId).eq("status", "active");
  const { count: sold } = await supabase.from("listings").select("id", { count: "exact", head: true }).eq("agency_id", agencyId).eq("status", "sold");
  const { count: enquiries } = await supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("agency_id", agencyId).eq("is_archived", false);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Agency dashboard</h1>
      <p className="text-sm text-slate-600">Manage listings, enquiries, and billing.</p>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Active listings" value={String(active ?? 0)} />
        <Stat label="Sold listings" value={String(sold ?? 0)} />
        <Stat label="Enquiries" value={String(enquiries ?? 0)} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Link href="/agency/listings/new" className="rounded-2xl border border-slate-200 bg-white p-6 hover:bg-slate-50">
          <div className="text-sm font-semibold">Create new listing</div>
          <div className="text-xs text-slate-600">Add details, images, choose tier</div>
        </Link>
        <Link href="/agency/listings" className="rounded-2xl border border-slate-200 bg-white p-6 hover:bg-slate-50">
          <div className="text-sm font-semibold">Manage listings</div>
          <div className="text-xs text-slate-600">Draft / Active / Sold</div>
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
