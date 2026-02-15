import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-8">
        <h1 className="text-3xl font-semibold tracking-tight">Find your next place with findalot</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Browse active listings, review recent sales, save searches, and contact agencies directly.
        </p>
        <div className="mt-5 flex gap-3">
          <Link href="/buy" className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">
            Browse Buy
          </Link>
          <Link href="/sold" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50">
            View Sold
          </Link>
        </div>
      </section>
    </div>
  );
}
