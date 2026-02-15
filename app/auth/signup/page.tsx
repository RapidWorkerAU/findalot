"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";
import type { AccountType } from "@/lib/types";

export default function SignupPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const preset = sp.get("type");
  const supabase = supabaseBrowser();

  const [type, setType] = useState<AccountType>("user");
  const [fullName, setFullName] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (preset === "agency" || preset === "user") setType(preset);
  }, [preset]);

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          account_type: type,
          full_name: fullName,
        },
      },
    });

    if (signupError) {
      setLoading(false);
      setError(signupError.message);
      return;
    }

    if (type === "agency" && data.user && data.session) {
      await fetch("/api/auth/onboard-agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyName: agencyName || `${fullName} Agency` }),
      });
    }

    if (!data.session) {
      setLoading(false);
      setNotice("Signup successful. Check your email to confirm your account, then log in.");
      return;
    }

    router.push(type === "agency" ? "/agency" : "/account");
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Sign up</h1>
      <p className="text-sm text-slate-600">Create a user or agency account with Supabase Auth.</p>

      <form onSubmit={onSignup} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <label className="block text-sm font-medium">Account type</label>
        <select value={type} onChange={(e) => setType(e.target.value as AccountType)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
          <option value="user">User (buyer)</option>
          <option value="agency">Agency</option>
        </select>

        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          placeholder="Full name"
          required
        />
        {type === "agency" && (
          <input
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Agency name"
          />
        )}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          placeholder="Email"
          type="email"
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          placeholder="Password"
          type="password"
          required
        />

        <button disabled={loading} className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-70">
          {loading ? "Creating..." : "Create account"}
        </button>

        {notice && <div className="text-xs text-emerald-700">{notice}</div>}
        {error && <div className="text-xs text-rose-700">{error}</div>}
      </form>
    </div>
  );
}
