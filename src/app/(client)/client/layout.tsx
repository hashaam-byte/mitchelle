// app/client/layout.tsx - PROTECTED CLIENT LAYOUT
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ClientLayoutUI from '@/app/components/client/ClientLayoutUI';

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side session check
  const session = await getServerSession(authOptions);
  
  // If no session, redirect to login
  if (!session || !session.user) {
    console.log('[Client Layout] No session found, redirecting to login');
    redirect('/auth/login');
  }

  const userRole = session.user.role;
  
  // Verify user has appropriate role (CLIENT, ADMIN, or SUPER_ADMIN can access)
  const allowedRoles = ['CLIENT', 'ADMIN', 'SUPER_ADMIN'];
  if (!allowedRoles.includes(userRole)) {
    console.log(`[Client Layout] Unauthorized role: ${userRole}, redirecting`);
    redirect('/auth/login');
  }

  console.log(`[Client Layout] Access granted for ${session.user.email} (${userRole})`);

  return <ClientLayoutUI user={session.user}>{children}</ClientLayoutUI>;
}