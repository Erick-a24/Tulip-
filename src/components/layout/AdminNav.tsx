"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin-login");
    router.refresh();
  }

  const linkClass = (href: string) =>
    `text-sm font-medium ${
      pathname === href ? "text-brand-700" : "text-slate-600 hover:text-slate-900"
    }`;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <span className="text-lg font-semibold text-slate-900">Tulip Events — Admin</span>
          <nav className="hidden gap-4 sm:flex">
            <Link href="/admin" className={linkClass("/admin")}>
              Dashboard
            </Link>
            <Link href="/admin/events/new" className={linkClass("/admin/events/new")}>
              New Event
            </Link>
          </nav>
        </div>
        <Button variant="ghost" onClick={handleLogout} disabled={signingOut}>
          {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </header>
  );
}
