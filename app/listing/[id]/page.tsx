import { notFound } from "next/navigation";
import { EnquiryForm } from "@/components/enquiry-form";
import { SaveButtons } from "@/components/save-buttons";
import { supabaseServer } from "@/lib/supabase-server";
import { listingAddress } from "@/lib/types";
import type { Listing } from "@/lib/types";

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("listings")
    .select("*, agency:agencies(*), listing_images(*)")
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) notFound();
  const listing = data as Listing;

  const images = (listing.listing_images ?? []).map((img) => ({
    ...img,
    public_url: supabase.storage.from("listing-media").getPublicUrl(img.storage_path).data.publicUrl,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-semibold">{listing.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{listingAddress(listing)}</p>
          <p className="mt-4 text-lg font-semibold">{listing.price_display}</p>
          <p className="mt-2 text-sm text-slate-600">
            {listing.beds} bed / {listing.baths} bath / {listing.parking} car
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
              <div className="mt-2 text-xs text-slate-600">{image.category}</div>
            </div>
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold">Agency</h2>
          <div className="mt-2 text-sm">{listing.agency?.name ?? "Unknown agency"}</div>
        </div>

        <SaveButtons listingId={listing.id} />
        <EnquiryForm listingId={listing.id} agencyId={listing.agency_id} defaultSubject={`Enquiry: ${listing.title}`} />
      </aside>
    </div>
  );
}
