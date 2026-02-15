import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function uniqueSlug(base: string, supabase: Awaited<ReturnType<typeof supabaseServer>>) {
  const clean = slugify(base) || "agency";
  let candidate = clean;
  let index = 1;

  while (index < 100) {
    const { data, error } = await supabase.from("agencies").select("id").eq("slug", candidate).maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
    index += 1;
    candidate = `${clean}-${index}`;
  }

  return `${clean}-${Date.now()}`;
}

export async function POST(request: Request) {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("account_type, full_name")
    .eq("user_id", user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  if (profile.account_type !== "agency") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { data: existingMembership } = await supabase
    .from("agency_members")
    .select("agency_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existingMembership) {
    return NextResponse.json({ ok: true, agency_id: existingMembership.agency_id, existing: true });
  }

  const body = (await request.json().catch(() => ({}))) as { agencyName?: string; region?: string; blurb?: string };
  const preferredName = body.agencyName?.trim() || `${profile.full_name ?? "New"} Agency`;
  const slug = await uniqueSlug(preferredName, supabase);

  const { data: agency, error: agencyError } = await supabase
    .from("agencies")
    .insert({
      slug,
      name: preferredName,
      region: body.region ?? null,
      blurb: body.blurb ?? null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (agencyError) {
    return NextResponse.json({ error: agencyError.message }, { status: 400 });
  }

  const { error: memberError } = await supabase.from("agency_members").insert({
    agency_id: agency.id,
    user_id: user.id,
    role: "owner",
  });

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, agency_id: agency.id });
}
