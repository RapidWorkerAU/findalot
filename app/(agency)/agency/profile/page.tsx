"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";

export default function AgencyProfileSettingsPage() {
  const [agencyId, setAgencyId] = useState("");
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [blurb, setBlurb] = useState("");
  const [logoPath, setLogoPath] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = supabaseBrowser();
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) return;

      const { data: membership } = await supabase
        .from("agency_members")
        .select("agency_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!membership) return;
      setAgencyId(membership.agency_id as string);

      const { data: agency } = await supabase.from("agencies").select("name, region, blurb, logo_path").eq("id", membership.agency_id as string).maybeSingle();
      if (!agency) return;

      setName(agency.name ?? "");
      setRegion(agency.region ?? "");
      setBlurb(agency.blurb ?? "");
      setLogoPath(agency.logo_path ?? "");
    }

    load();
  }, []);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    const supabase = supabaseBrowser();
    e.preventDefault();
    setStatus("");
    setError("");
    if (!agencyId) {
      setError("Agency membership not found.");
      return;
    }

    const form = new FormData(e.currentTarget);
    const file = form.get("logo") as File | null;
    let nextLogoPath = logoPath || null;

    if (file && file.size > 0) {
      const safeName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.\-_]/g, "").toLowerCase();
      const path = `agencies/${agencyId}/logo/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("agency-media").upload(path, file);
      if (uploadError) {
        setError(uploadError.message);
        return;
      }
      nextLogoPath = path;
    }

    const { error: updateError } = await supabase
      .from("agencies")
      .update({
        name,
        region: region || null,
        blurb: blurb || null,
        logo_path: nextLogoPath,
      })
      .eq("id", agencyId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setLogoPath(nextLogoPath || "");
    setStatus("Profile saved.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const logoUrl = logoPath && supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/agency-media/${logoPath}` : "";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Agency profile</h1>
      <form onSubmit={onSave} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Agency name" required />
        <input value={region} onChange={(e) => setRegion(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Region" />
        <textarea value={blurb} onChange={(e) => setBlurb(e.target.value)} rows={4} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Agency blurb" />
        <input name="logo" type="file" accept="image/*" className="block w-full text-sm" />
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Agency logo" className="h-24 rounded-lg border border-slate-200 object-contain p-2" />
        )}
        <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">Save profile</button>
        {status && <div className="text-xs text-emerald-700">{status}</div>}
        {error && <div className="text-xs text-rose-700">{error}</div>}
      </form>
    </div>
  );
}
