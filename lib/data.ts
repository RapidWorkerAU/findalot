import type { Agency, Listing, ListingImage } from "@/lib/types";

export function withPublicUrls(images: ListingImage[] | null | undefined): ListingImage[] {
  if (!images) return [];
  return images.map((image) => {
    const { data } = {
      data: { publicUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-media/${image.storage_path}` },
    };
    return { ...image, public_url: data.publicUrl };
  });
}

export function firstImage(images: ListingImage[] | null | undefined) {
  const sorted = [...(images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  return sorted[0] ?? null;
}

export function agencyLogoUrl(agency: Agency | null | undefined) {
  if (!agency?.logo_path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/agency-media/${agency.logo_path}`;
}

export function listingPrimaryPhotoUrl(listing: Listing) {
  const images = withPublicUrls(listing.listing_images);
  return firstImage(images)?.public_url ?? null;
}
