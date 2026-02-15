"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";

export function SaveButtons({ listingId }: { listingId: string }) {
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function loadSavedState() {
      const supabase = supabaseBrowser();
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      setUserId(user?.id ?? null);

      if (!user) return;

      const { data } = await supabase
        .from("saved_properties")
        .select("listing_id")
        .eq("user_id", user.id)
        .eq("listing_id", listingId)
        .maybeSingle();

      setSaved(Boolean(data));
    }

    loadSavedState();
  }, [listingId]);

  async function toggle() {
    const supabase = supabaseBrowser();
    setError("");
    if (!userId) {
      setError("Please log in to save properties.");
      return;
    }

    if (saved) {
      const { error: deleteError } = await supabase
        .from("saved_properties")
        .delete()
        .eq("user_id", userId)
        .eq("listing_id", listingId);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      setSaved(false);
      return;
    }

    const { error: insertError } = await supabase.from("saved_properties").insert({
      user_id: userId,
      listing_id: listingId,
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSaved(true);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button onClick={toggle} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">
          {saved ? "Saved" : "Save"}
        </button>
        <Link href="/account/saved-properties" className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800">
          View shortlist
        </Link>
      </div>
      {error && <div className="text-xs text-rose-700">{error}</div>}
    </div>
  );
}
