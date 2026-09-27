import { getCurrentUser } from '@/lib/auth/session';
import DashboardContent from '@/components/dashboard/dashboard-content';
import { redirect } from 'next/navigation';

export const instant = false;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  return (
    <DashboardContent userEmail={user.email ?? ''} />
  );
}
