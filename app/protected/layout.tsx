import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { hasDatabaseConfig } from "@/lib/db";
import { redirect } from "next/navigation";
import { WalletCards } from "lucide-react";
import { DashboardNavigation } from "@/components/dashboard/dashboard-navigation";
import { ProtectedUserProvider } from "@/components/dashboard/protected-user-context";

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
          <DashboardNavigation variant="sidebar" />
          <div className="border-t border-slate-200 p-4">
            <LogoutButton />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm lg:hidden">
            <nav className="flex h-16 items-center justify-between px-4 text-sm sm:px-6">
              <Link href="/protected/dashboard" className="font-bold tracking-tight text-slate-900">
                Xpense<span className="text-primary">Tracker</span>
              </Link>
              <DashboardNavigation variant="mobile" />
            </nav>
          </header>
          <ProtectedUserProvider name={user.name}>
            <div>{children}</div>
          </ProtectedUserProvider>
        </div>
      </div>
    </main>
  );
}
