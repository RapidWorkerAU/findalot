import Link from "next/link";
import type { Listing } from "@/lib/types";
import { listingAddress } from "@/lib/types";

export function ListingCard({ listing, soldMode }: { listing: Listing; soldMode?: boolean }) {
  const href = listing.status === "sold" ? `/sold/${listing.id}` : `/listing/${listing.id}`;
  const price = listing.status === "sold" ? listing.sold_price_display : listing.price_display;

  return (
    <Link href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 hover:bg-slate-50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{listing.title}</div>
          <div className="text-xs text-slate-600">{listingAddress(listing)}</div>
        </div>
        {!soldMode && (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-700">
            {listing.tier.toUpperCase()}
          </span>
        )}
      </div>

      <div className="mt-3 text-sm font-semibold">{price || "Contact agent"}</div>

      {listing.status === "sold" && (
        <div className="mt-1 text-xs text-slate-500">Sold: {listing.sold_date ? new Date(listing.sold_date).toLocaleDateString() : "-"}</div>
      )}

      <div className="mt-3 text-xs text-slate-500">
        {listing.beds} bed / {listing.baths} bath / {listing.parking} car
      </div>

      <div className="mt-3 text-xs text-slate-600 group-hover:underline">View details</div>
    </Link>
  );
}
