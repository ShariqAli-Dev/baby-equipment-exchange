'use server';

import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import { auth, db } from './firebase-admin';
import { requireAdmin } from './auth/guards';
import { USERS_COLLECTION } from './users';

// Replaces setClaims/_setClaim/toggleClaimFor* in src/api/firebaseAdmin.ts and
// the setcustomclaims Cloud Function. Fixes:
// - L1: old spread order `{[claimName]: value, ...customClaims}` let the
//   EXISTING claim win — toggles silently no-op'd. Existing claims spread
//   FIRST here so the new value lands.
// - L2: setCustomUserClaims was fire-and-forget; now awaited.
// - L3: guarded by the verified session cookie, not caller-supplied args.
//
// NOTE: claim changes take effect at the TARGET user's next login — their
// session cookie carries claims from mint time (see src/server/auth/session.ts).

export async function setClaim(userId: string, claimName: string, value: boolean): Promise<void> {
    await requireAdmin();
    const existing = (await auth.getUser(userId)).customClaims ?? {};
    await auth.setCustomUserClaims(userId, { ...existing, [claimName]: value });
}

export async function toggleClaim(userId: string, claimName: string): Promise<boolean> {
    await requireAdmin();
    const existing = (await auth.getUser(userId)).customClaims ?? {};
    const next = existing[claimName] !== true;
    await auth.setCustomUserClaims(userId, { ...existing, [claimName]: next });
    return next;
}

// Full overwrite (the callSetClaims contract). Consolidates the pair every
// call site runs together today (EditUser.tsx:140: callSetClaims +
// updateDbUser({customClaims})) — auth claims and the Users-doc mirror.
export async function setClaims(userId: string, claims: Record<string, boolean>): Promise<void> {
    await requireAdmin();
    await auth.setCustomUserClaims(userId, claims);
    await db.collection(USERS_COLLECTION).doc(userId).update({ customClaims: claims, modifiedAt: FieldValue.serverTimestamp() });
}
