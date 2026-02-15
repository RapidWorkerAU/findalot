import { notFound } from "next/navigation";
import { ListingCard } from "@/components/listing-card";
import { supabaseServer } from "@/lib/supabase-server";
import type { Agency, Listing } from "@/lib/types";

export default async function AgencyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await supabaseServer();

  const { data: agencyData, error: agencyError } = await supabase.from("agencies").select("*").eq("slug", slug).maybeSingle();
  if (agencyError || !agencyData) notFound();
  const agency = agencyData as Agency;

  const { data: listingsData, error: listingsError } = await supabase
    .from("listings")
    .select("*")
    .eq("agency_id", agency.id)
    .in("status", ["active", "sold"])
    .order("updated_at", { ascending: false });

  const listings = (listingsData ?? []) as Listing[];
  const active = listings.filter((item) => item.status === "active");
  const sold = listings.filter((item) => item.status === "sold");

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">{agency.name}</h1>
        <p className="mt-1 text-sm text-slate-600">{agency.region ?? "Australia"}</p>
        <p className="mt-3 text-sm text-slate-700">{agency.blurb ?? "No profile blurb yet."}</p>
      </div>

      {listingsError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{listingsError.message}</div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Active listings ({active.length})</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {active.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Sold listings ({sold.length})</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {sold.map((listing) => (
                <ListingCard key={listing.id} listing={listing} soldMode />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
