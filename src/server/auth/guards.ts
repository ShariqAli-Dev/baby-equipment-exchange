import 'server-only';

import { getSession, type Session } from './get-session';

// Replaces the broken _verifyAdmin/_verifyAuthenticated in src/api/firebaseAdmin.ts
// (L3: _verifyAdmin checked request.uid but no server-action caller ever passed
// that shape — the privileged channel was effectively unguarded). These guards
// read the verified session cookie instead of trusting caller-supplied args.

export async function requireSession(): Promise<NonNullable<Session>> {
    const s = await getSession();
    if (!s) throw new Error('UNAUTHENTICATED');
    return s;
}

export async function requireAdmin(): Promise<NonNullable<Session>> {
    const s = await requireSession();
    if (!s.isAdmin) throw new Error('FORBIDDEN');
    return s;
}

export async function requireAidWorkerOrAdmin(): Promise<NonNullable<Session>> {
    const s = await requireSession();
    if (!s.isAdmin && !s.isAidWorker) throw new Error('FORBIDDEN');
    return s;
}

// For reads that are per-user (own profile) but admin-readable for anyone.
export async function requireSelfOrAdmin(uid: string): Promise<NonNullable<Session>> {
    const s = await requireSession();
    if (s.uid !== uid && !s.isAdmin) throw new Error('FORBIDDEN');
    return s;
}
