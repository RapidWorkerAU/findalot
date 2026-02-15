"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";
import type { ListingTier } from "@/lib/types";

type Tier = ListingTier;

const tierAmount: Record<Tier, number> = {
  free: 0,
  standard: 199,
  premium: 399,
};

export default function NewListingPage() {
  const router = useRouter();
  const [tier, setTier] = useState<Tier>("free");
  const [agencyId, setAgencyId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMembership() {
      const supabase = supabaseBrowser();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;

      const { data: membership } = await supabase
        .from("agency_members")
        .select("agency_id")
        .eq("user_id", auth.user.id)
        .limit(1)
        .maybeSingle();

      if (membership) setAgencyId(membership.agency_id as string);
    }

    loadMembership();
  }, []);

  async function uploadCategoryFiles(listingId: string, category: "photo" | "floorplan" | "other", files: File[]) {
    const supabase = supabaseBrowser();
    const folder = category === "photo" ? "photos" : category === "floorplan" ? "floorplans" : "other";
    const imageRows: Array<{
      listing_id: string;
      category: "photo" | "floorplan" | "other";
      sort_order: number;
      storage_path: string;
      alt_text: string | null;
    }> = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const safeName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.\-_]/g, "").toLowerCase();
      const storagePath = `listings/${listingId}/${folder}/${Date.now()}-${index}-${safeName}`;

      const { error: uploadError } = await supabase.storage.from("listing-media").upload(storagePath, file);
      if (uploadError) throw new Error(uploadError.message);

      imageRows.push({
        listing_id: listingId,
        category,
        sort_order: index,
        storage_path: storagePath,
        alt_text: null,
      });
    }

    if (imageRows.length > 0) {
      const { error: imagesError } = await supabase.from("listing_images").insert(imageRows);
      if (imagesError) throw new Error(imagesError.message);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const supabase = supabaseBrowser();
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = new FormData(e.currentTarget);
      const title = String(form.get("title") || "");
      const address_line = String(form.get("address_line") || "");
      const suburb = String(form.get("suburb") || "");
      const state = String(form.get("state") || "");
      const postcode = String(form.get("postcode") || "");
      const price_display = String(form.get("price_display") || "");
      const property_type = String(form.get("property_type") || "House");
      const description = String(form.get("description") || "");
      const beds = Number(form.get("beds") || 0);
      const baths = Number(form.get("baths") || 0);
      const parking = Number(form.get("parking") || 0);
      const land_size_sqm = Number(form.get("land_size_sqm") || 0);
      const features = String(form.get("features") || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Please log in.");
      if (!agencyId) throw new Error("Agency membership not found.");

      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .insert({
          agency_id: agencyId,
          status: "draft",
          tier: "free",
          title,
          address_line,
          suburb,
          state,
          postcode,
          price_display,
          property_type,
          beds,
          baths,
          parking,
          land_size_sqm: land_size_sqm || null,
          description,
          features,
          created_by: auth.user.id,
        })
        .select("id")
        .single();

      if (listingError || !listing) throw new Error(listingError?.message ?? "Failed to create listing.");

      const photoFiles = form.getAll("photos").filter((value) => value instanceof File && value.size > 0) as File[];
      const floorplanFiles = form.getAll("floorplans").filter((value) => value instanceof File && value.size > 0) as File[];
      const otherFiles = form.getAll("other").filter((value) => value instanceof File && value.size > 0) as File[];

      await uploadCategoryFiles(listing.id as string, "photo", photoFiles);
      await uploadCategoryFiles(listing.id as string, "floorplan", floorplanFiles);
      await uploadCategoryFiles(listing.id as string, "other", otherFiles);

      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          tier,
          amount: tierAmount[tier],
          insertPayment: tier !== "free",
        }),
      });

      if (!checkoutRes.ok) {
        const body = await checkoutRes.json().catch(() => ({}));
        throw new Error(body.error || "Checkout failed.");
      }

      const { error: publishError } = await supabase
        .from("listings")
        .update({
          status: "active",
          published_at: new Date().toISOString(),
        })
        .eq("id", listing.id);

      if (publishError) throw new Error(publishError.message);
      router.push("/agency/listings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish listing.");
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Create listing</h1>
      <p className="text-sm text-slate-600">Draft is created first, then tier checkout is recorded, then listing is published.</p>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="grid gap-3 md:grid-cols-2">
          <input name="title" required className="rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Title" />
          <input name="price_display" required className="rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Price display" />
          <input name="address_line" required className="rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Address line" />
          <input name="suburb" required className="rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Suburb" />
          <input name="state" required className="rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="State" defaultValue="WA" />
          <input name="postcode" required className="rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Postcode" />
          <input name="property_type" className="rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Property type" defaultValue="House" />
          <input name="land_size_sqm" type="number" className="rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Land size sqm" />
          <input name="beds" type="number" required className="rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Beds" />
          <input name="baths" type="number" required className="rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Baths" />
          <input name="parking" type="number" required className="rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Parking" />
          <input name="features" className="rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Features (comma separated)" />
        </div>

        <textarea name="description" required className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" rows={5} placeholder="Description" />

        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-xs text-slate-600">
            <span>Photos</span>
            <input name="photos" type="file" accept="image/*" multiple className="block w-full text-xs" />
          </label>
          <label className="space-y-1 text-xs text-slate-600">
            <span>Floorplans</span>
            <input name="floorplans" type="file" accept="image/*" multiple className="block w-full text-xs" />
          </label>
          <label className="space-y-1 text-xs text-slate-600">
            <span>Other media</span>
            <input name="other" type="file" multiple className="block w-full text-xs" />
          </label>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold">Listing tier</div>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <TierCard name="Free" value="free" tier={tier} setTier={setTier} desc="First listing offer" />
            <TierCard name="Standard" value="standard" tier={tier} setTier={setTier} desc="$199 mock checkout" />
            <TierCard name="Premium" value="premium" tier={tier} setTier={setTier} desc="$399 mock checkout" />
          </div>
        </div>

        <button disabled={loading} className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-70">
          {loading ? "Publishing..." : "Publish listing"}
        </button>
        {error && <div className="text-xs text-rose-700">{error}</div>}
      </form>
    </div>
  );
}

function TierCard(props: { name: string; value: Tier; desc: string; tier: Tier; setTier: (tier: Tier) => void }) {
  const active = props.tier === props.value;
  return (
    <button
      type="button"
      onClick={() => props.setTier(props.value)}
      className={`rounded-xl border px-4 py-3 text-left ${active ? "border-slate-900 bg-white" : "border-slate-200 bg-white hover:bg-slate-50"}`}
    >
      <div className="text-sm font-semibold">{props.name}</div>
      <div className="text-xs text-slate-600">{props.desc}</div>
    </button>
  );
}
