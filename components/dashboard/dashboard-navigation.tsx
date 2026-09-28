"use client";

import Link from "next/link";
import { LayoutDashboard, Menu, ReceiptText, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";

interface DashboardNavigationProps {
  variant: "sidebar" | "mobile";
}

export function DashboardNavigation({ variant }: DashboardNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingMenu, setPendingMenu] = useState<"dashboard" | "transactions" | null>(null);
  const routeMenu = pathname.startsWith("/protected/transactions") ? "transactions" : "dashboard";
  const activeMenu = pendingMenu ?? routeMenu;

  useEffect(() => {
    router.prefetch("/protected/dashboard");
    router.prefetch("/protected/transactions");
  }, [router]);

  useEffect(() => {
    setPendingMenu(null);
    setIsOpen(false);
  }, [pathname]);

  const items = [
    { id: "dashboard" as const, label: "Dashboard", href: "/protected/dashboard", icon: LayoutDashboard },
    { id: "transactions" as const, label: "Transactions", href: "/protected/transactions", icon: ReceiptText },
  ];

  if (variant === "mobile") {
    return (
      <div className="relative lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        {isOpen && (
          <>
            <button type="button" aria-label="Close navigation" className="fixed inset-0 top-16 z-40 bg-slate-950/20 backdrop-blur-[2px]" onClick={() => setIsOpen(false)} />
            <div className="fixed inset-x-4 top-20 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/15">
              <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Navigation</p>
              {items.map(({ id, label, href, icon: Icon }) => (
                <Link
                  key={id}
                  href={href}
                  prefetch
                  onClick={() => { setPendingMenu(id); setIsOpen(false); }}
                  aria-current={activeMenu === id ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    activeMenu === id ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              ))}
              <div className="mt-2 border-t border-slate-100 pt-2">
                <LogoutButton className="w-full justify-start bg-slate-100 text-slate-700 shadow-none hover:bg-red-50 hover:text-red-600" />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <nav className="flex flex-1 flex-col gap-2 px-4 py-3 text-sm">
      <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
      {items.map(({ id, label, href, icon: Icon }) => (
        <Link
          key={id}
          href={href}
          prefetch
          onClick={() => setPendingMenu(id)}
          aria-current={activeMenu === id ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all",
            activeMenu === id
              ? "bg-blue-600 font-semibold text-white shadow-md shadow-blue-600/20"
              : "text-slate-600 hover:bg-slate-100 hover:text-blue-700",
          )}
        >
          <Icon className="size-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
