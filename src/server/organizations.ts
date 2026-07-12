import 'server-only';

import { db } from './firebase-admin';
import { requireAdmin } from './auth/guards';
import { toIso } from './serialize';
import type { IAddress } from '@/models/address';

export const ORGANIZATIONS_COLLECTION = 'Organizations';

export type OrganizationDTO = {
    id: string;
    name: string;
    address: IAddress | null;
    county: string | null;
    phoneNumber: string | null;
    emailFooter: string | null;
    tags: string[];
    distributedItems: { id: string; tagNumber: string }[] | null;
    notes: string[];
    createdAt: string | null;
    modifiedAt: string | null;
};

export function toOrganizationDTO(doc: FirebaseFirestore.DocumentSnapshot): OrganizationDTO {
    const data = doc.data() ?? {};
    return {
        id: data.id ?? doc.id,
        name: data.name,
        address: data.address ?? null,
        county: data.county ?? null,
        phoneNumber: data.phoneNumber ?? null,
        emailFooter: data.emailFooter ?? null,
        tags: data.tags ?? [],
        distributedItems: data.distributedItems ?? null,
        notes: data.notes ?? [],
        createdAt: toIso(data.createdAt),
        modifiedAt: toIso(data.modifiedAt)
    };
}

export async function getOrganizations(): Promise<OrganizationDTO[]> {
    await requireAdmin();
    const snap = await db.collection(ORGANIZATIONS_COLLECTION).get();
    return snap.docs.map(toOrganizationDTO);
}

export async function getOrganizationById(id: string): Promise<OrganizationDTO | null> {
    await requireAdmin();
    const doc = await db.collection(ORGANIZATIONS_COLLECTION).doc(id).get();
    return doc.exists ? toOrganizationDTO(doc) : null;
}

// Replaces the getorganizationnames Cloud Function: { name: id } map.
// Unauthenticated by design — the signup page (pre-auth) uses it, same
// exposure as today's public callable.
export async function getOrganizationNames(): Promise<{ [name: string]: string }> {
    const snap = await db.collection(ORGANIZATIONS_COLLECTION).orderBy('name', 'asc').get();
    const orgNames: { [name: string]: string } = {};
    snap.forEach((doc) => {
        orgNames[doc.data().name] = doc.id;
    });
    return orgNames;
}
