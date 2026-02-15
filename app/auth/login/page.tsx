"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";
import type { AccountType } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError || !data.user) {
      setLoading(false);
      setError(loginError?.message ?? "Login failed.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_type, full_name")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if ((profile as { account_type?: AccountType; full_name?: string | null } | null)?.account_type === "agency") {
      await fetch("/api/auth/onboard-agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName: (profile as { full_name?: string | null } | null)?.full_name
            ? `${(profile as { full_name?: string | null }).full_name} Agency`
            : undefined,
        }),
      });
      router.push("/agency");
    } else {
      router.push("/account");
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Login</h1>
      <p className="text-sm text-slate-600">Use your Supabase credentials.</p>

      <form onSubmit={onLogin} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
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
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <div className="text-xs text-rose-700">{error}</div>}
      </form>
    </div>
  );
}
