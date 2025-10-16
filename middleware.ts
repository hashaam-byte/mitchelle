// middleware.ts - FIXED: Smart routing without callback URLs
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { applySecurityHeaders } from './lib/security-headers';

// Define route access rules
const routeAccess = {
  '/admin/owner': ['SUPER_ADMIN'],
  '/admin': ['ADMIN', 'SUPER_ADMIN'],
  '/client': ['CLIENT', 'ADMIN', 'SUPER_ADMIN'],
};

// Default redirects based on role
const roleRedirects = {
  SUPER_ADMIN: '/admin/owner',
  ADMIN: '/admin/dashboard',
  CLIENT: '/client/home',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply security headers to all responses
  const response = NextResponse.next();
  applySecurityHeaders(response);

  // Public routes - allow access
  const publicRoutes = ['/auth/login', '/auth/register', '/', '/api/auth'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return response;
  }

  // Get JWT token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if route requires authentication
  const requiresAuth = Object.keys(routeAccess).some(route => 
    pathname.startsWith(route)
  );

  if (!requiresAuth) {
    return response;
  }

  // No token - redirect to login (NO CALLBACK URL)
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const userRole = token.role as string;

  // Check role-based access for specific routes
  for (const [route, allowedRoles] of Object.entries(routeAccess)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(userRole)) {
        // Smart redirect based on user's actual role
        const redirectPath = roleRedirects[userRole as keyof typeof roleRedirects] || '/';
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
      break;
    }
  }

  // If authenticated user tries to access login/register, redirect to their dashboard
  if (pathname.startsWith('/auth/') && token) {
    const redirectPath = roleRedirects[userRole as keyof typeof roleRedirects] || '/';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return response;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};