import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const instant = false;

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!process.env.DB_HOST || !process.env.SESSION_SECRET) {
    redirect("/auth/login");
  }

  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return (
    <main className="min-h-screen">
      <header className="w-full border-b border-foreground/10">
        <nav className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5 text-sm">
          <Link href="/protected/dashboard" className="font-semibold">
            Expense Tracker
          </Link>
          <LogoutButton />
        </nav>
      </header>
      <div className="mx-auto w-full max-w-5xl px-5 py-8">{children}</div>
    </main>
  );
}
