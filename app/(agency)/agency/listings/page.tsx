import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import { listingAddress } from "@/lib/types";
import type { Listing } from "@/lib/types";

export default async function AgencyListingsPage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">Please log in as an agency user.</div>;
  }

  const { data: membership } = await supabase
    .from("agency_members")
    .select("agency_id")
    .eq("user_id", auth.user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">No agency membership found.</div>;
  }

  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("agency_id", membership.agency_id as string)
    .in("status", ["draft", "active", "sold"])
    .order("updated_at", { ascending: false });

  const listings = (data ?? []) as Listing[];
  const drafts = listings.filter((item) => item.status === "draft");
  const active = listings.filter((item) => item.status === "active");
  const sold = listings.filter((item) => item.status === "sold");

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Listings</h1>
          <p className="text-sm text-slate-600">Manage drafts, active campaigns, and sold results.</p>
        </div>
        <Link href="/agency/listings/new" className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">
          New listing
        </Link>
      </div>

      <Section title={`Drafts (${drafts.length})`}>
        {drafts.map((item) => (
          <Row key={item.id} title={item.title} meta={listingAddress(item)} right={item.tier.toUpperCase()} href={`/listing/${item.id}`} />
        ))}
      </Section>

      <Section title={`Active (${active.length})`}>
        {active.map((item) => (
          <Row key={item.id} title={item.title} meta={listingAddress(item)} right={item.price_display} href={`/listing/${item.id}`} />
        ))}
      </Section>

      <Section title={`Sold (${sold.length})`}>
        {sold.map((item) => (
          <Row key={item.id} title={item.title} meta={`Sold ${item.sold_date ? new Date(item.sold_date).toLocaleDateString() : ""}`} right={item.sold_price_display ?? "Sold"} href={`/sold/${item.id}`} />
        ))}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="divide-y divide-slate-200">{children}</div>
      </div>
    </div>
  );
}

function Row({ title, meta, right, href }: { title: string; meta: string; right: string | null; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50">
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-slate-600">{meta}</div>
      </div>
      <div className="text-sm font-semibold">{right ?? "-"}</div>
    </Link>
  );
}
