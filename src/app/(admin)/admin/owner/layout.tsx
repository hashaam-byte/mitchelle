// app/admin/owner/layout.tsx - PROTECTED SUPER ADMIN LAYOUT
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Your super admin navigation


export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side session check
  const session = await getServerSession(authOptions);

  // If no session, redirect to login
  if (!session || !session.user) {
    console.log('[Owner Layout] No session found, redirecting to login');
    redirect('/auth/login');
  }

  const userRole = session.user.role;

  // ONLY SUPER_ADMIN can access owner panel
  if (userRole !== 'SUPER_ADMIN') {
    console.log(`[Owner Layout] Unauthorized role: ${userRole}, redirecting based on role`);
    
    // Redirect based on their actual role
    if (userRole === 'ADMIN') {
      redirect('/admin/dashboard');
    } else if (userRole === 'CLIENT') {
      redirect('/client/home');
    } else {
      redirect('/auth/login');
    }
  }

  console.log(`[Owner Layout] Super Admin access granted for ${session.user.email}`);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Your super admin layout structure */}
   
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}