'use server';

import 'server-only';

import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';

import { db } from '../firebase-admin';
import { requireAdmin } from '../auth/guards';
import { omitNullish } from '../serialize';
import { ORGANIZATIONS_COLLECTION } from '../organizations';

import type { OrganizationBody } from '@/types/OrganizationTypes';

function revalidateOrganizationViews(id?: string) {
    revalidatePath('/organizations');
    if (id) revalidatePath(`/organizations/${id}`);
}

export async function addOrganizationAction(newOrganization: OrganizationBody): Promise<void> {
    await requireAdmin();
    const organizationRef = db.collection(ORGANIZATIONS_COLLECTION).doc();
    await organizationRef.set(
        omitNullish({
            id: organizationRef.id,
            name: newOrganization.name,
            address: newOrganization.address,
            county: newOrganization.county,
            phoneNumber: newOrganization.phoneNumber,
            emailFooter: newOrganization.emailFooter,
            tags: newOrganization.tags,
            distributedItems: [],
            notes: newOrganization.notes,
            createdAt: FieldValue.serverTimestamp(),
            modifiedAt: FieldValue.serverTimestamp()
        })
    );
    revalidateOrganizationViews();
}

export async function updateOrganizationAction(id: string, organizationDetails: Record<string, unknown>): Promise<void> {
    await requireAdmin();
    await db
        .collection(ORGANIZATIONS_COLLECTION)
        .doc(id)
        .update({ ...organizationDetails, modifiedAt: FieldValue.serverTimestamp() });
    revalidateOrganizationViews(id);
}

export async function deleteOrganizationAction(id: string): Promise<void> {
    await requireAdmin();
    await db.collection(ORGANIZATIONS_COLLECTION).doc(id).delete();
    revalidateOrganizationViews(id);
}
