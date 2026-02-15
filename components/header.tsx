"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import type { AccountType } from "@/lib/types";

export function Header() {
  const [type, setType] = useState<AccountType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const supabase = supabaseBrowser();

    async function loadType() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        if (mounted) {
          setType(null);
          setLoading(false);
        }
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (mounted) {
        setType(profile?.account_type ?? null);
        setLoading(false);
      }
    }

    loadType();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadType();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    setType(null);
    window.location.href = "/";
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            findalot
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-slate-700 md:flex">
            <Link href="/buy" className="hover:underline">
              Buy
            </Link>
            <Link href="/sold" className="hover:underline">
              Sold
            </Link>
            <Link href="/agencies" className="hover:underline">
              Agencies
            </Link>
            <Link href="/pricing" className="hover:underline">
              Pricing
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {type === "agency" && (
            <Link href="/agency" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">
              Agency
            </Link>
          )}
          {type === "user" && (
            <Link href="/account" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">
              Account
            </Link>
          )}

          {loading ? null : type ? (
            <button onClick={signOut} className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800">
              Logout
            </button>
          ) : (
            <Link href="/auth/login" className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
