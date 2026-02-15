import Link from "next/link";

export default function AuthIndexPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Account</h1>
      <p className="text-sm text-slate-600">Choose what you want to do.</p>
      <div className="grid gap-3 md:grid-cols-2">
        <Link href="/auth/login" className="rounded-2xl border border-slate-200 bg-white p-6 hover:bg-slate-50">
          <div className="text-sm font-semibold">Login</div>
          <div className="text-xs text-slate-600">User or Agency</div>
        </Link>
        <Link href="/auth/signup" className="rounded-2xl border border-slate-200 bg-white p-6 hover:bg-slate-50">
          <div className="text-sm font-semibold">Sign up</div>
          <div className="text-xs text-slate-600">Create a User or Agency account</div>
        </Link>
      </div>
    </div>
  );
}
