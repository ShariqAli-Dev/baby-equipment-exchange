import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { auth } from '@/server/firebase-admin';

export type Session = {
    uid: string;
    email?: string;
    isAdmin: boolean;
    isAidWorker: boolean;
    claims: Record<string, unknown>;
} | null;

// cache() dedupes verification per-request across layout/page/actions.
// checkRevoked=true costs a network round-trip to Firebase per request;
// acceptable for this experiment — flip to false + short cookie TTL if it
// ever matters.
export const getSession = cache(async (): Promise<Session> => {
    const cookie = cookies().get('__session')?.value;
    if (!cookie) return null;
    try {
        const c = await auth.verifySessionCookie(cookie, true /* checkRevoked */);
        return {
            uid: c.uid,
            email: c.email,
            isAdmin: c.admin === true,
            isAidWorker: c['aid-worker'] === true,
            claims: c
        };
    } catch {
        return null;
    }
});
