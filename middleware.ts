// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define protected routes and their required roles
const protectedRoutes = {
  '/admin': ['ADMIN', 'SUPER_ADMIN'],
  '/admin/owner': ['SUPER_ADMIN'],
  '/client': ['CLIENT', 'ADMIN', 'SUPER_ADMIN'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = Object.keys(protectedRoutes).some(route => 
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      const userRole = token.role as string;
      
      if (!allowedRoles.includes(userRole)) {
        // Redirect based on user role
        if (userRole === 'CLIENT') {
          return NextResponse.redirect(new URL('/client/home', request.url));
        } else if (userRole === 'ADMIN') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        } else {
          return NextResponse.redirect(new URL('/auth/login', request.url));
        }
      }
      break;
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/admin/:path*',
    '/client/:path*',
    // Exclude these paths
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
};