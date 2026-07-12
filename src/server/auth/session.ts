'use server';

import 'server-only';

import { cookies } from 'next/headers';
import { auth } from '@/server/firebase-admin';

// The ONLY cookie Firebase App Hosting/CDN passes through — do not rename.
const SESSION_COOKIE = '__session';
const EXPIRES_IN = 60 * 60 * 24 * 5 * 1000; // 5 days

// NOTE: the session cookie carries the user's custom claims as of mint time.
// Claim changes (admin/aid-worker toggles) take effect at the target user's
// NEXT login. Disable/delete take effect within the checkRevoked window
// because destroySession revokes refresh tokens and getSession verifies
// with checkRevoked=true.
export async function createSession(idToken: string): Promise<void> {
    const decoded = await auth.verifyIdToken(idToken);
    // Reject tokens older than 5 minutes — standard session-cookie hygiene
    if (Date.now() / 1000 - decoded.auth_time > 5 * 60) {
        throw new Error('Recent sign-in required');
    }
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: EXPIRES_IN });
    cookies().set(SESSION_COOKIE, sessionCookie, {
        maxAge: EXPIRES_IN / 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    });
}

export async function destroySession(): Promise<void> {
    const cookie = cookies().get(SESSION_COOKIE)?.value;
    cookies().delete(SESSION_COOKIE);
    if (cookie) {
        try {
            const decoded = await auth.verifySessionCookie(cookie);
            await auth.revokeRefreshTokens(decoded.uid);
        } catch {
            /* already invalid — nothing to revoke */
        }
    }
}
