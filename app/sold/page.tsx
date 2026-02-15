import { FilterSidebar } from "@/components/filter-sidebar";
import { ListingCard } from "@/components/listing-card";
import { supabaseServer } from "@/lib/supabase-server";
import type { Listing } from "@/lib/types";

export default async function SoldPage() {
  const supabase = await supabaseServer();
  const { data: sold, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "sold")
    .order("sold_date", { ascending: false, nullsFirst: false });

  const listings = (sold ?? []) as Listing[];

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <FilterSidebar title="Sold filters" mode="sold" />
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Sold</h1>
          <p className="text-sm text-slate-600">{listings.length} sold results</p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error.message}</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} soldMode />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
