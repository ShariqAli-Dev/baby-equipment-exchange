import { NextRequest, NextResponse } from 'next/server';

// Lightweight presence check only: Edge middleware can't run firebase-admin,
// so authoritative session verification + role enforcement live in getSession()
// (route-group layouts and the server data layer). Middleware just bounces
// cookie-less visitors off protected routes cheaply.
const ADMIN_ROUTES = ['/donations', '/users', '/organizations', '/categories', '/notifications', '/admin-donate', '/admin-cart', '/review-order', '/schedule'];
const AUTHED_ROUTES = ['/inventory', '/inventory-cart', '/accept', '/account'];

export function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const hasSession = req.cookies.has('__session');
    const needsAuth = [...ADMIN_ROUTES, ...AUTHED_ROUTES].some((r) => path === r || path.startsWith(r + '/'));
    if (needsAuth && !hasSession) {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('from', path);
        return NextResponse.redirect(url);
    }
    return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|logo|images).*)'] };
