// middleware.ts - FIXED: Proper order and logic
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { applySecurityHeaders } from '@/lib/securtiy-headers';

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

  // Public routes - allow access without authentication
  const publicRoutes = [
    '/auth/login', 
    '/auth/register', 
    '/auth/error',
    '/',
    '/api/auth' // This covers all NextAuth routes
  ];
  
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isPublicRoute) {
    const response = NextResponse.next();
    applySecurityHeaders(response);
    return response;
  }

  // Get JWT token for protected routes
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const userRole = token?.role as string | undefined;

  console.log(`[Middleware] Path: ${pathname}, Token: ${token ? 'Yes' : 'No'}, Role: ${userRole || 'None'}`);

  // Check if route requires authentication
  const requiresAuth = Object.keys(routeAccess).some(route => 
    pathname.startsWith(route)
  );

  // No token and requires auth - redirect to login
  if (!token && requiresAuth) {
    console.log(`[Middleware] No auth, redirecting to login`);
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    applySecurityHeaders(response);
    return response;
  }

  // Has token - check role-based access
  if (token && requiresAuth) {
    for (const [route, allowedRoles] of Object.entries(routeAccess)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole!)) {
          // Smart redirect based on user's actual role
          const redirectPath = roleRedirects[userRole as keyof typeof roleRedirects] || '/';
          console.log(`[Middleware] Access denied. Redirecting ${userRole} from ${pathname} to: ${redirectPath}`);
          const response = NextResponse.redirect(new URL(redirectPath, request.url));
          applySecurityHeaders(response);
          return response;
        }
        // Access granted
        console.log(`[Middleware] Access granted for ${userRole} to ${pathname}`);
        break;
      }
    }
  }

  // Allow through with security headers
  const response = NextResponse.next();
  applySecurityHeaders(response);
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