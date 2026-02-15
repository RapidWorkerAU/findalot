"use client";

import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";

export function FilterSidebar({ title, mode }: { title: string; mode: "buy" | "sold" }) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [savedMsg, setSavedMsg] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function saveSearch() {
    setError("");
    setSavedMsg("");

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      setError("Please log in to save searches.");
      return;
    }

    const criteria = {
      mode,
      suburb: "Aveley",
      minPrice: null,
      maxPrice: null,
      bedrooms: 4,
    };

    const { error: insertError } = await supabase.from("saved_searches").insert({
      user_id: user.id,
      label: `${mode === "buy" ? "Buy" : "Sold"} search`,
      criteria,
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSavedMsg("Saved. Check your account -> Saved searches.");
    setTimeout(() => setSavedMsg(""), 2500);
  }

  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-3 space-y-3">
          <input className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Suburb / postcode" defaultValue="Aveley" />
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-1">
            <select className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
              <option>Min price</option>
              <option>$400k</option>
              <option>$600k</option>
            </select>
            <select className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
              <option>Max price</option>
              <option>$900k</option>
              <option>$1.0m</option>
            </select>
          </div>
          <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" defaultValue="4+">
            <option>Bedrooms</option>
            <option>2+</option>
            <option>3+</option>
            <option>4+</option>
          </select>

          <button type="button" onClick={saveSearch} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50">
            Save search
          </button>

          {savedMsg && <div className="text-xs text-emerald-700">{savedMsg}</div>}
          {error && <div className="text-xs text-rose-700">{error}</div>}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-600">
        MVP note: filters are still UI-first. Saved searches now persist in Supabase.
      </div>
    </aside>
  );
}
