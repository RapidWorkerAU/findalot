import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { listingAddress } from "@/lib/types";
import type { Listing } from "@/lib/types";

export default async function SoldDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("listings")
    .select("*, agency:agencies(*), listing_images(*)")
    .eq("id", id)
    .eq("status", "sold")
    .maybeSingle();

  if (error || !data) notFound();
  const listing = data as Listing;

  const images = (listing.listing_images ?? []).map((img) => ({
    ...img,
    public_url: supabase.storage.from("listing-media").getPublicUrl(img.storage_path).data.publicUrl,
  }));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">{listing.title}</h1>
        <p className="mt-1 text-sm text-slate-600">{listingAddress(listing)}</p>
        <p className="mt-3 text-lg font-semibold">{listing.sold_price_display ?? "Sold"}</p>
        <p className="text-sm text-slate-500">
          Sold date: {listing.sold_date ? new Date(listing.sold_date).toLocaleDateString() : "-"}
        </p>
        <p className="mt-4 whitespace-pre-line text-sm text-slate-700">{listing.description}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {images.map((image) => (
          <div key={image.id} className="rounded-2xl border border-slate-200 bg-white p-3">
            {image.public_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image.public_url} alt={image.alt_text ?? "Listing image"} className="h-44 w-full rounded-xl object-cover" />
            ) : (
              <div className="h-44 w-full rounded-xl bg-slate-100" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
