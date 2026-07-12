import 'server-only';

import { auth, db } from './firebase-admin';
import { requireAdmin, requireSelfOrAdmin } from './auth/guards';
import { toIso } from './serialize';

export const USERS_COLLECTION = 'Users';

// Projection of a Users collection doc (Firestore side of a user).
export type UserDTO = {
    uid: string;
    email: string | null;
    displayName: string | null;
    customClaims: Record<string, unknown> | null;
    isDisabled: boolean | null;
    isDeleted: boolean | null;
    phoneNumber: string | null;
    requestedItems: { id: string; model: string }[] | null;
    distributedItems: { id: string; tagNumber: string }[] | null;
    notes: string[] | null;
    organization: { id: string; name: string } | null;
    title: string | null;
    termsAccepted: string[] | null;
    createdAt: string | null;
    modifiedAt: string | null;
};

// Projection of a Firebase Auth user record (replaces AuthUserRecord flows
// that went through Cloud Functions / src/api/firebaseAdmin.ts).
export type AuthUserDTO = {
    uid: string;
    email: string | null;
    displayName: string | null;
    disabled: boolean;
    metadata: { creationTime: string | null; lastSignInTime: string | null };
    customClaims: Record<string, unknown> | null;
};

export function toUserDTO(doc: FirebaseFirestore.DocumentSnapshot): UserDTO {
    const data = doc.data() ?? {};
    return {
        uid: data.uid ?? doc.id,
        email: data.email ?? null,
        displayName: data.displayName ?? null,
        customClaims: data.customClaims ?? null,
        isDisabled: data.isDisabled ?? null,
        isDeleted: data.isDeleted ?? null,
        phoneNumber: data.phoneNumber ?? null,
        requestedItems: data.requestedItems ?? null,
        distributedItems: data.distributedItems ?? null,
        notes: data.notes ?? null,
        organization: data.organization ?? null,
        title: data.title ?? null,
        termsAccepted: data.termsAccepted ?? null,
        createdAt: toIso(data.createdAt),
        modifiedAt: toIso(data.modifiedAt)
    };
}

function toAuthUserDTO(user: import('firebase-admin/auth').UserRecord): AuthUserDTO {
    return {
        uid: user.uid,
        email: user.email ?? null,
        displayName: user.displayName ?? null,
        disabled: user.disabled,
        metadata: {
            creationTime: user.metadata?.creationTime ?? null,
            lastSignInTime: user.metadata?.lastSignInTime ?? null
        },
        customClaims: user.customClaims ?? null
    };
}

export type UserListFilter = { q?: string; includeDeleted?: boolean };

// L13 resolution: soft-deleted users are filtered OUT by default (the
// Dashboard behavior); pass includeDeleted to show them (?deleted=1 in V2).
export async function getDbUsers(filter?: UserListFilter): Promise<UserDTO[]> {
    await requireAdmin();
    const snap = await db.collection(USERS_COLLECTION).get();
    let rows = snap.docs.map(toUserDTO);
    if (!filter?.includeDeleted) rows = rows.filter((u) => !u.isDeleted);
    if (filter?.q) {
        const search = filter.q.toLowerCase();
        rows = rows.filter((u) =>
            [u.displayName, u.email, u.organization?.name, u.title].some((value) => String(value ?? '').toLowerCase().includes(search))
        );
    }
    return rows;
}

export async function getActiveDbUsers(): Promise<UserDTO[]> {
    await requireAdmin();
    const snap = await db.collection(USERS_COLLECTION).where('isDisabled', '==', false).get();
    return snap.docs.map(toUserDTO);
}

// Disabled users awaiting approval (getUsersNotifications today).
export async function getPendingUsers(): Promise<UserDTO[]> {
    await requireAdmin();
    const snap = await db.collection(USERS_COLLECTION).where('isDisabled', '==', true).get();
    return snap.docs.map(toUserDTO);
}

export async function getDbUser(uid: string): Promise<UserDTO | null> {
    await requireSelfOrAdmin(uid);
    const doc = await db.collection(USERS_COLLECTION).doc(uid).get();
    return doc.exists ? toUserDTO(doc) : null;
}

// Replaces the listallusers Cloud Function; filters out anonymous users the
// same way callListAllUsers did (no provider data).
export async function getAllAuthUsers(): Promise<AuthUserDTO[]> {
    await requireAdmin();
    const result = await auth.listUsers(1000);
    return result.users.filter((user) => user.providerData.length !== 0).map(toAuthUserDTO);
}

export async function getAuthUserById(uid: string): Promise<AuthUserDTO> {
    await requireAdmin();
    return toAuthUserDTO(await auth.getUser(uid));
}

// Replaces the isemailinuse Cloud Function. Unauthenticated by design —
// signup (pre-auth) validates emails with it, same exposure as today.
export async function isEmailInUse(email: string): Promise<boolean> {
    try {
        await auth.getUserByEmail(email);
        return true;
    } catch (error: unknown) {
        if ((error as { code?: string }).code === 'auth/user-not-found') return false;
        return true;
    }
}
