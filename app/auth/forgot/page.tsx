"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice("");
    setError("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/login`,
    });

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setNotice("Reset email sent. Check your inbox.");
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Forgot password</h1>
      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          placeholder="Email"
          type="email"
          required
        />
        <button className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">Send reset link</button>
        {notice && <div className="text-xs text-emerald-700">{notice}</div>}
        {error && <div className="text-xs text-rose-700">{error}</div>}
      </form>
    </div>
  );
}
