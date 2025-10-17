// app/admin/layout.tsx - PROTECTED ADMIN LAYOUT
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AdminLayoutUI from '@/app/components/admin/AdminLayoutUI';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side session check
  const session = await getServerSession(authOptions);
  
  // If no session, redirect to login
  if (!session || !session.user) {
    console.log('[Admin Layout] No session found, redirecting to login');
    redirect('/auth/login');
  }

  const userRole = session.user.role;
  
  // Verify user has ADMIN or SUPER_ADMIN role
  const allowedRoles = ['ADMIN', 'SUPER_ADMIN'];
  if (!allowedRoles.includes(userRole)) {
    console.log(`[Admin Layout] Unauthorized role: ${userRole}, redirecting to client dashboard`);
    redirect('/client/home');
  }

  console.log(`[Admin Layout] Access granted for ${session.user.email} (${userRole})`);

  return <AdminLayoutUI user={session.user}>{children}</AdminLayoutUI>;
}