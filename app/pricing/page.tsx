import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pricing</h1>
        <p className="text-sm text-slate-600">Simple tiers now. Scalable later.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Tier
          name="First listing"
          price=""
          blurb="Try Findalot with a free first listing."
          features={["1 listing free", "Standard placement", "Basic listing fields"]}
          cta="Create agency account"
          href="/auth/signup?type=agency"
        />
        <Tier
          name="Standard"
          price=""
          blurb="Solid visibility for everyday listings."
          features={["Normal placement", "Photos + floorplans", "Enquiries inbox"]}
          cta="Mock checkout"
          href="/agency/billing"
        />
        <Tier
          name="Premium"
          price=""
          blurb="Featured placement + stronger exposure."
          features={["Featured placements", "Premium badge", "Higher list priority"]}
          cta="Mock checkout"
          href="/agency/billing"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
        Prototype note: checkout always succeeds. Real Stripe integration can be added later without changing the IA.
      </div>

      <Link href="/" className="text-sm underline underline-offset-2">Back home</Link>
    </div>
  );
}

function Tier(props: {
  name: string; price: string; blurb: string; features: string[];
  cta: string; href: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="text-sm font-semibold">{props.name}</div>
      <div className="mt-1 text-3xl font-semibold">{props.price}</div>
      <div className="mt-2 text-sm text-slate-600">{props.blurb}</div>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {props.features.map(f => <li key={f}>• {f}</li>)}
      </ul>
      <div className="mt-5">
        <Link href={props.href} className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">
          {props.cta}
        </Link>
      </div>
    </div>
  );
}
