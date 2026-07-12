'use server';

import 'server-only';

import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';

import { auth, db } from '../firebase-admin';
import { requireAdmin, requireSelfOrAdmin } from '../auth/guards';
import { USERS_COLLECTION, isEmailInUse } from '../users';

import type { AccountInformation } from '@/types/UserTypes';

function revalidateUserViews(uid?: string) {
    revalidatePath('/users');
    if (uid) revalidatePath(`/users/${uid}`);
    revalidatePath('/notifications');
}

// Consolidates the pair every call site runs together today
// (Promise.all([callEnableUser, enableDbUser]) in NotificationCard/EditUser):
// enables the auth account, grants aid-worker, syncs the Users doc.
// Claims are MERGED (the enableuser Cloud Function overwrote them — same
// class of bug as L1).
export async function enableUserAction(userId: string): Promise<void> {
    await requireAdmin();
    const user = await auth.updateUser(userId, { disabled: false });
    const claims = { ...(user.customClaims ?? {}), 'aid-worker': true };
    await auth.setCustomUserClaims(userId, claims);
    await db.collection(USERS_COLLECTION).doc(userId).update({ isDisabled: false, customClaims: claims });
    revalidateUserViews(userId);
}

// Consolidates Promise.all([callDeleteUser, deleteDbUser]): removes the auth
// account and the Users doc.
export async function deleteUserAction(userId: string): Promise<void> {
    await requireAdmin();
    await auth.deleteUser(userId);
    await db.collection(USERS_COLLECTION).doc(userId).delete();
    revalidateUserViews(userId);
}

// Replaces the updateauthuser Cloud Function (display name / email changes).
export async function updateAuthUserAction(uid: string, accountInformation: AccountInformation): Promise<void> {
    await requireAdmin();
    await auth.updateUser(uid, accountInformation);
    revalidateUserViews(uid);
}

// Replaces client updateDbUser. Self-or-admin: the account page edits the
// caller's own doc; admin UIs edit anyone's.
export async function updateDbUserAction(uid: string, accountInformation: Record<string, unknown>): Promise<void> {
    await requireSelfOrAdmin(uid);
    await db
        .collection(USERS_COLLECTION)
        .doc(uid)
        .update({ ...accountInformation, modifiedAt: FieldValue.serverTimestamp() });
    revalidateUserViews(uid);
}

// Client-callable wrapper for the isEmailInUse read (client components can't
// import the server-only module). Unauthenticated by design — pre-auth signup
// validates emails with it, same exposure as the old isemailinuse callable.
export async function isEmailInUseAction(email: string): Promise<boolean> {
    return isEmailInUse(email);
}
