import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import type { ListingTier } from "@/lib/types";

type CheckoutPayload = {
  listingId: string;
  tier: ListingTier;
  amount?: number;
  insertPayment?: boolean;
};

async function insertTierHistory(
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
  args: { listingId: string; oldTier: ListingTier; newTier: ListingTier; userId: string },
) {
  const first = await supabase.from("listing_tier_history").insert({
    listing_id: args.listingId,
    old_tier: args.oldTier,
    new_tier: args.newTier,
    changed_by: args.userId,
  });

  if (!first.error) return null;

  const fallback = await supabase.from("listing_tier_history").insert({
    listing_id: args.listingId,
    tier: args.newTier,
    changed_by: args.userId,
  });

  return fallback.error ?? null;
}

async function insertPayment(
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
  args: { listingId: string; agencyId: string; amount: number },
) {
  const first = await supabase.from("payments").insert({
    listing_id: args.listingId,
    agency_id: args.agencyId,
    provider: "mock",
    status: "paid",
    amount: args.amount,
  });

  if (!first.error) return null;

  const fallback = await supabase.from("payments").insert({
    listing_id: args.listingId,
    provider: "mock",
    status: "paid",
    amount: args.amount,
  });

  return fallback.error ?? null;
}

export async function POST(req: Request) {
  const payload = (await req.json().catch(() => ({}))) as Partial<CheckoutPayload>;
  if (!payload.listingId || !payload.tier) {
    return NextResponse.json({ error: "listingId and tier are required" }, { status: 400 });
  }

  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, agency_id, tier")
    .eq("id", payload.listingId)
    .single();

  if (listingError || !listing) {
    return NextResponse.json({ error: listingError?.message ?? "Listing not found" }, { status: 400 });
  }

  const oldTier = listing.tier as ListingTier;
  const newTier = payload.tier;
  const { error: updateError } = await supabase.from("listings").update({ tier: newTier }).eq("id", listing.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  const tierHistoryError = await insertTierHistory(supabase, {
    listingId: listing.id as string,
    oldTier,
    newTier,
    userId: user.id,
  });

  let paymentErrorMessage: string | null = null;
  if (payload.insertPayment) {
    const paymentError = await insertPayment(supabase, {
      listingId: listing.id as string,
      agencyId: listing.agency_id as string,
      amount: Number(payload.amount ?? 0),
    });
    paymentErrorMessage = paymentError?.message ?? null;
  }

  return NextResponse.json({
    ok: true,
    message: "Mock checkout success",
    receiptId: `rcpt_mock_${Date.now()}`,
    warnings: [tierHistoryError?.message, paymentErrorMessage].filter(Boolean),
  });
}
