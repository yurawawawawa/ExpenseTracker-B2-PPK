import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { hasDatabaseConfig } from "@/lib/db";
import { redirect } from "next/navigation";
import { LayoutDashboard, ReceiptText } from "lucide-react";

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
        <aside className="hidden w-60 shrink-0 border-r border-blue-100 bg-white lg:flex lg:flex-col">
          <div className="flex h-20 items-center border-b border-blue-100 px-6">
            <Link href="/protected/dashboard" className="text-lg font-bold tracking-tight text-slate-900">
              Expand <span className="text-primary">Tracker</span>
            </Link>
          </div>
          <nav className="flex flex-1 flex-col gap-2 p-4 text-sm">
            <Link href="/protected/dashboard" className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 font-semibold text-blue-700">
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
            <Link href="/protected/dashboard#transactions" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-700">
              <ReceiptText className="size-4" />
              Transactions
            </Link>
          </nav>
          <div className="border-t border-blue-100 p-4">
            <LogoutButton />
          </div>
        </aside>

        <div className="min-w-0 flex-1 pb-20 lg:pb-0">
          <header className="border-b border-blue-100 bg-white/90 backdrop-blur lg:hidden">
            <nav className="flex h-16 items-center justify-between px-4 text-sm sm:px-6">
              <Link href="/protected/dashboard" className="font-bold tracking-tight text-slate-900">
                Expand <span className="text-primary">Tracker</span>
              </Link>
              <LogoutButton />
            </nav>
          </header>
          <div>{children}</div>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-blue-100 bg-white/95 px-6 backdrop-blur lg:hidden">
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
