import { FilterSidebar } from "@/components/filter-sidebar";
import { ListingCard } from "@/components/listing-card";
import { supabaseServer } from "@/lib/supabase-server";
import type { Listing } from "@/lib/types";

export default async function BuyPage() {
  const supabase = await supabaseServer();
  const { data: active, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("published_at", { ascending: false, nullsFirst: false });

  const listings = (active ?? []) as Listing[];

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <FilterSidebar title="For sale filters" mode="buy" />
      <div className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Buy</h1>
            <p className="text-sm text-slate-600">{listings.length} properties for sale</p>
          </div>
          <select className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
            <option>Sort: Newest</option>
            <option>Price: Low to high</option>
            <option>Price: High to low</option>
          </select>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error.message}</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
