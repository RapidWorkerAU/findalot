"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import type { SavedSearch } from "@/lib/types";

export default function SavedSearchesPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [items, setItems] = useState<SavedSearch[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;

      if (!user) {
        setError("Please log in to view saved searches.");
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("saved_searches")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (queryError) {
        setError(queryError.message);
      } else {
        setItems((data ?? []) as SavedSearch[]);
      }

      setLoading(false);
    }

    load();
  }, [supabase]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Saved searches</h1>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">Loading...</div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
      ) : (
        <div className="space-y-3">
          {items.map((search) => (
            <div key={search.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-sm font-semibold">{search.label}</div>
              <pre className="mt-2 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                {JSON.stringify(search.criteria, null, 2)}
              </pre>
            </div>
          ))}

          {items.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
              No saved searches yet. Save one from the Buy/Sold filter sidebar.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
