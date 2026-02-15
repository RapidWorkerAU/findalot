import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import type { Agency } from "@/lib/types";

export default async function AgenciesPage() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("agencies").select("*").order("name");
  const agencies = (data ?? []) as Agency[];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Agencies</h1>
        <p className="text-sm text-slate-600">Browse agencies and their active + sold listings.</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error.message}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {agencies.map((agency) => (
            <Link key={agency.id} href={`/agencies/${agency.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 hover:bg-slate-50">
              <div className="text-sm font-semibold">{agency.name}</div>
              <div className="text-xs text-slate-600">{agency.region ?? "Australia"}</div>
              <div className="mt-3 text-xs text-slate-500">{agency.blurb ?? "Independent agency profile."}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
