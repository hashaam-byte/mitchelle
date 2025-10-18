// middleware.ts - COMPLETE PROTECTION: No bypassing login
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { applySecurityHeaders } from '@/lib/securtiy-headers';

// Define route access rules - ALL protected routes
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

  console.log(`[Middleware] Processing: ${pathname}`);

  // Public routes - ONLY these can be accessed without auth
  const publicRoutes = [
    '/auth/login', 
    '/auth/register', 
    '/auth/error',
    '/',
    '/api/auth', // All NextAuth API routes
    '/api/auth/check-admin', // Public endpoint for checking admin
  ];
  
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Get JWT token for ALL routes (we need to check auth status)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const userRole = token?.role as string | undefined;
  const userEmail = token?.email as string | undefined;

  console.log(`[Middleware] Route: ${pathname}, Authenticated: ${!!token}, Role: ${userRole || 'None'}`);

  // ============================================
  // 1. PUBLIC ROUTES HANDLING
  // ============================================
  if (isPublicRoute) {
    // If user has active session and tries to access auth pages, redirect to dashboard
    if (token && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
      const redirectPath = roleRedirects[userRole as keyof typeof roleRedirects] || '/client/home';
      console.log(`[Middleware] Authenticated user on auth page. Redirecting to: ${redirectPath}`);
      const response = NextResponse.redirect(new URL(redirectPath, request.url));
      applySecurityHeaders(response);
      return response;
    }

    // Allow access to public routes
    const response = NextResponse.next();
    applySecurityHeaders(response);
    return response;
  }

  // ============================================
  // 2. PROTECTED ROUTES HANDLING
  // ============================================
  
  // Check if route requires authentication
  const requiresAuth = Object.keys(routeAccess).some(route => 
    pathname.startsWith(route)
  );

  // If route requires auth but no token, redirect to login
  if (requiresAuth && !token) {
    console.log(`[Middleware] No auth token. Redirecting to login from: ${pathname}`);
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    applySecurityHeaders(response);
    return response;
  }

  // If has token, check role-based access control
  if (token && requiresAuth) {
    let hasAccess = false;
    let matchedRoute = '';

    // Check which protected route matches and if user has access
    for (const [route, allowedRoles] of Object.entries(routeAccess)) {
      if (pathname.startsWith(route)) {
        matchedRoute = route;
        hasAccess = allowedRoles.includes(userRole!);
        break;
      }
    }

    if (!hasAccess) {
      // User doesn't have permission - redirect to their appropriate dashboard
      const redirectPath = roleRedirects[userRole as keyof typeof roleRedirects] || '/';
      console.log(`[Middleware] Access DENIED. User: ${userEmail}, Role: ${userRole}, Tried: ${pathname}, Redirecting to: ${redirectPath}`);
      const response = NextResponse.redirect(new URL(redirectPath, request.url));
      applySecurityHeaders(response);
      return response;
    }

    // Access granted
    console.log(`[Middleware] Access GRANTED. User: ${userEmail}, Role: ${userRole}, Accessing: ${pathname}`);
  }

  // ============================================
  // 3. DEFAULT ALLOW (with security headers)
  // ============================================
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
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};