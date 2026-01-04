import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Official Panel - NayaBato',
  description: 'Official dashboard for managing civic issues and wards',
};

export default async function OfficialPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== 'official' && session.user.role !== 'admin')) {
    redirect('/auth/signin');
  }

  // Redirect to the dashboard
  redirect('/official/dashboard');
}
