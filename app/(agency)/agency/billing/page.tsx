import { supabaseServer } from "@/lib/supabase-server";

export default async function BillingPage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">Please log in as an agency user.</div>;
  }

  const { data: membership } = await supabase
    .from("agency_members")
    .select("agency_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">No agency membership found.</div>;
  }

  const { data: payments, error } = await supabase
    .from("payments")
    .select("id, listing_id, amount, status, provider, created_at")
    .eq("agency_id", membership.agency_id as string)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Billing</h1>
      <p className="text-sm text-slate-600">Checkout remains mock. Payment records below come from Supabase `payments`.</p>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error.message}</div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="divide-y divide-slate-200">
            {(payments ?? []).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                <div>
                  <div className="font-semibold">{payment.provider.toUpperCase()} - {payment.status}</div>
                  <div className="text-xs text-slate-600">Listing: {payment.listing_id}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${Number(payment.amount ?? 0).toFixed(2)}</div>
                  <div className="text-xs text-slate-500">{new Date(payment.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
            {(payments ?? []).length === 0 && <div className="p-4 text-sm text-slate-600">No payment records yet.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
