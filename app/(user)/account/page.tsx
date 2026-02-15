import Link from "next/link";

export default function UserAccountPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Your account</h1>
      <p className="text-sm text-slate-600">Saved properties and saved searches.</p>

      <div className="grid gap-3 md:grid-cols-2">
        <Link href="/account/saved-properties" className="rounded-2xl border border-slate-200 bg-white p-6 hover:bg-slate-50">
          <div className="text-sm font-semibold">Saved properties</div>
          <div className="text-xs text-slate-600">Shortlist your favourites</div>
        </Link>
        <Link href="/account/saved-searches" className="rounded-2xl border border-slate-200 bg-white p-6 hover:bg-slate-50">
          <div className="text-sm font-semibold">Saved searches</div>
          <div className="text-xs text-slate-600">Run your search in one click</div>
        </Link>
      </div>
    </div>
  );
}
