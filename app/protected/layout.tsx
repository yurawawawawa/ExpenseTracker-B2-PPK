import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { hasDatabaseConfig } from "@/lib/db";
import { redirect } from "next/navigation";
import { LayoutDashboard, ReceiptText, WalletCards } from "lucide-react";

export const instant = false;

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!hasDatabaseConfig() || !process.env.SESSION_SECRET) {
    redirect("/auth/login");
  }

  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return (
    <main className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-hidden border-r border-slate-200/80 bg-white/95 lg:flex lg:flex-col">
          <div className="flex h-24 items-center px-6">
            <Link href="/protected/dashboard" className="flex items-center gap-3 text-lg font-bold tracking-tight text-slate-950">
              <span className="grid size-10 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <WalletCards className="size-5" />
              </span>
              <span>Xpense<span className="text-blue-600">Tracker</span></span>
            </Link>
          </div>
          <nav className="flex flex-1 flex-col gap-2 px-4 py-3 text-sm">
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
            <Link href="/protected/dashboard" className="flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-md shadow-blue-600/20">
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
            <Link href="/protected/dashboard#transactions" className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-700">
              <ReceiptText className="size-4" />
              Transactions
            </Link>
          </nav>
          <div className="border-t border-slate-200 p-4">
            <LogoutButton />
          </div>
        </aside>

        <div className="min-w-0 flex-1 pb-20 lg:pb-0">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl lg:hidden">
            <nav className="flex h-16 items-center justify-between px-4 text-sm sm:px-6">
              <Link href="/protected/dashboard" className="font-bold tracking-tight text-slate-900">
                Xpense<span className="text-primary">Tracker</span>
              </Link>
              <LogoutButton />
            </nav>
          </header>
          <div>{children}</div>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-slate-200/80 bg-white/95 px-6 shadow-[0_-8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:hidden">
        <Link href="/protected/dashboard" className="flex flex-col items-center gap-1 text-xs font-semibold text-primary">
          <LayoutDashboard className="size-4" />
          Dashboard
        </Link>
        <Link href="/protected/dashboard#transactions" className="flex flex-col items-center gap-1 text-xs text-slate-500">
          <ReceiptText className="size-4" />
          Transactions
        </Link>
      </nav>
    </main>
  );
}
