"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import { listingAddress } from "@/lib/types";
import type { Listing } from "@/lib/types";

export default function SavedPropertiesPage() {
  const [items, setItems] = useState<Listing[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = supabaseBrowser();
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;

      if (!user) {
        setError("Please log in to view saved properties.");
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("saved_properties")
        .select("listing_id, listings(*)")
        .eq("user_id", user.id);

      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }

      const rows = ((data ?? []) as Array<{ listings: Listing | Listing[] | null }>)
        .map((row) => (Array.isArray(row.listings) ? row.listings[0] ?? null : row.listings))
        .filter(Boolean) as Listing[];

      setItems(rows);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Saved properties</h1>
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">Loading...</div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((listing) => (
            <Link
              key={listing.id}
              href={listing.status === "sold" ? `/sold/${listing.id}` : `/listing/${listing.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 hover:bg-slate-50"
            >
              <div className="text-sm font-semibold">{listing.title}</div>
              <div className="text-xs text-slate-600">{listingAddress(listing)}</div>
              <div className="mt-2 text-sm font-semibold">{listing.status === "sold" ? listing.sold_price_display : listing.price_display}</div>
            </Link>
          ))}
          {items.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
              Nothing saved yet. Browse <Link className="underline" href="/buy">Buy</Link>.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
