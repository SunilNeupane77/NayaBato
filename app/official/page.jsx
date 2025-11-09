import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import OfficialDashboardClient from '@/components/dashboard/OfficialDashboardClient';

export const metadata = {
  title: 'Official Dashboard - NayaBato',
  description: 'Official dashboard for managing civic issues and wards',
};

export default async function OfficialDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== 'official' && session.user.role !== 'admin')) {
    redirect('/auth/signin');
  }

  return <OfficialDashboardClient session={session} />;
}
