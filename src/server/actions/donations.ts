'use server';

import 'server-only';

import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';

import { db } from '../firebase-admin';
import { requireAdmin, requireAidWorkerOrAdmin } from '../auth/guards';
import { omitNullish } from '../serialize';
import { deleteImagesByUrls } from '../images';
import { DONATIONS_COLLECTION } from '../donations';
import { ORDERS_COLLECTION, getOrderById, type OrderDTO } from '../orders';

import type { DonationBody } from '@/types/post-data';
import type { AdminDonationBody } from '@/types/DonationTypes';
import type { DonationStatusValues } from '@/models/donation';

// Not exported: 'use server' modules may only export async functions.
const BULK_DONATIONS_COLLECTION = 'BulkDonations';

type Requestor = { id: string; name: string; email: string };

function revalidateDonationViews(id?: string) {
    revalidatePath('/donations');
    if (id) revalidatePath(`/donations/${id}`);
    revalidatePath('/notifications');
    revalidatePath('/inventory');
}

// Unauthenticated by design: anonymous donors submit donations today (client
// SDK under public-write rules) — same exposure. Mirrors addDonation.
export async function addDonationAction(newDonations: DonationBody[], termsAccepted: string): Promise<void> {
    const bulkRef = db.collection(BULK_DONATIONS_COLLECTION).doc();
    const batch = db.batch();
    batch.set(bulkRef, {
        donations: [],
        donorEmail: newDonations[0].donorEmail,
        donorName: newDonations[0].donorName,
        donorId: newDonations[0].donorId,
        termsAccepted: termsAccepted,
        createdAt: FieldValue.serverTimestamp()
    });
    for (const newDonation of newDonations) {
        const donationRef = db.collection(DONATIONS_COLLECTION).doc();
        batch.set(
            donationRef,
            omitNullish({
                id: donationRef.id,
                donorEmail: newDonation.donorEmail,
                donorName: newDonation.donorName,
                donorId: newDonation.donorId,
                category: newDonation.category,
                brand: newDonation.brand,
                model: newDonation.model,
                description: newDonation.description,
                status: 'in processing',
                bulkCollection: bulkRef.id,
                images: newDonation.images,
                createdAt: FieldValue.serverTimestamp(),
                modifiedAt: FieldValue.serverTimestamp()
            })
        );
        batch.update(bulkRef, { donations: FieldValue.arrayUnion(donationRef) });
    }
    await batch.commit();
    revalidateDonationViews();
}

// Admin-created donations go straight to 'available' (mirrors addAdminDonation).
export async function addAdminDonationAction(newDonations: AdminDonationBody[]): Promise<void> {
    await requireAdmin();
    const bulkRef = db.collection(BULK_DONATIONS_COLLECTION).doc();
    const batch = db.batch();
    batch.set(bulkRef, {
        donations: [],
        donorEmail: newDonations[0].donorEmail,
        donorName: newDonations[0].donorName,
        donorId: newDonations[0].donorId
    });
    for (const newDonation of newDonations) {
        const donationRef = db.collection(DONATIONS_COLLECTION).doc();
        batch.set(
            donationRef,
            omitNullish({
                id: donationRef.id,
                donorEmail: newDonation.donorEmail,
                donorName: newDonation.donorName,
                donorId: newDonation.donorId,
                category: newDonation.category,
                brand: newDonation.brand,
                model: newDonation.model,
                description: newDonation.description,
                tagNumber: newDonation.tagNumber,
                status: 'available',
                bulkCollection: bulkRef.id,
                images: newDonation.images,
                createdAt: FieldValue.serverTimestamp(),
                modifiedAt: FieldValue.serverTimestamp(),
                dateAccepted: FieldValue.serverTimestamp(),
                dateReceived: FieldValue.serverTimestamp()
            })
        );
        batch.update(bulkRef, { donations: FieldValue.arrayUnion(donationRef) });
    }
    await batch.commit();
    revalidateDonationViews();
}

export async function updateDonationAction(id: string, donationDetails: Record<string, unknown>): Promise<void> {
    await requireAdmin();
    await db
        .collection(DONATIONS_COLLECTION)
        .doc(id)
        .update({ ...donationDetails, modifiedAt: FieldValue.serverTimestamp() });
    revalidateDonationViews(id);
}

// NOTE: the old client updateDonationStatus wrote a misspelled 'modfiedAt'
// field — corrected to modifiedAt here (the typo'd writes were dead data).
export async function updateDonationStatusAction(id: string, status: DonationStatusValues): Promise<DonationStatusValues> {
    await requireAdmin();
    const statusUpdate: Record<string, unknown> = { status, modifiedAt: FieldValue.serverTimestamp() };
    if (status === 'available') statusUpdate.dateReceived = FieldValue.serverTimestamp();
    if (status === 'distributed') statusUpdate.dateDistributed = FieldValue.serverTimestamp();
    await db.collection(DONATIONS_COLLECTION).doc(id).update(statusUpdate);
    revalidateDonationViews(id);
    return status;
}

// Admin-only now — the old client version had a '//to-do make admin only'.
export async function deleteDonationAction(id: string): Promise<void> {
    await requireAdmin();
    const ref = db.collection(DONATIONS_COLLECTION).doc(id);
    const doc = await ref.get();
    const images: string[] = doc.data()?.images ?? [];
    await deleteImagesByUrls(images);
    await ref.delete();
    revalidateDonationViews(id);
}

// Aid-worker cart submission (mirrors requestInventoryItems).
export async function requestInventoryItemsAction(inventoryItemIds: string[], user: Requestor): Promise<void> {
    await requireAidWorkerOrAdmin();
    await createOrderForItems(inventoryItemIds, user);
    revalidateDonationViews();
}

// Admin cart submission — returns the created order (mirrors adminRequestInventoryItems).
export async function adminRequestInventoryItemsAction(inventoryItemIds: string[], user: Requestor): Promise<OrderDTO> {
    await requireAdmin();
    const orderId = await createOrderForItems(inventoryItemIds, user);
    revalidateDonationViews();
    const order = await getOrderById(orderId);
    if (!order) throw new Error('Order not found after creation');
    return order;
}

async function createOrderForItems(inventoryItemIds: string[], user: Requestor): Promise<string> {
    const orderRef = db.collection(ORDERS_COLLECTION).doc();
    const batch = db.batch();
    batch.set(orderRef, {
        status: 'open',
        requestor: user,
        items: [],
        createdAt: FieldValue.serverTimestamp()
    });
    for (const inventoryItemId of inventoryItemIds) {
        const itemRef = db.collection(DONATIONS_COLLECTION).doc(inventoryItemId);
        batch.update(itemRef, {
            status: 'requested',
            requestor: user,
            dateRequested: FieldValue.serverTimestamp(),
            modifiedAt: FieldValue.serverTimestamp()
        });
        batch.update(orderRef, {
            items: FieldValue.arrayUnion(itemRef),
            modifiedAt: FieldValue.serverTimestamp()
        });
    }
    await batch.commit();
    return orderRef.id;
}

// Mirrors markDonationAsDistributed: flips status and appends to the
// requestor's and their organization's distributedItems lists.
export async function markDonationAsDistributedAction(donationId: string): Promise<void> {
    await requireAdmin();
    const donationRef = db.collection(DONATIONS_COLLECTION).doc(donationId);
    const donationSnapshot = await donationRef.get();
    const donation = donationSnapshot.data();
    if (!donation?.requestor?.id) throw new Error('Donation has no requestor');

    const requestorRef = db.collection('Users').doc(donation.requestor.id);
    const requestorSnapshot = await requestorRef.get();
    const orgId: string = requestorSnapshot.data()?.organization?.id ?? '';
    const organizationRef = db.collection('Organizations').doc(orgId);
    const organizationSnapshot = await organizationRef.get();
    const orgName = organizationSnapshot.data()?.name;

    const distributedItem = { id: donationId, tagNumber: donation.tagNumber };
    const batch = db.batch();
    batch.update(donationRef, {
        status: 'distributed',
        distributor: {
            id: donation.requestor.id,
            name: donation.requestor.name,
            email: donation.requestor.email,
            organization: orgName
        },
        modifiedAt: FieldValue.serverTimestamp(),
        dateDistributed: FieldValue.serverTimestamp()
    });
    batch.update(requestorRef, {
        distributedItems: FieldValue.arrayUnion(distributedItem),
        modifiedAt: FieldValue.serverTimestamp()
    });
    batch.update(organizationRef, {
        distributedItems: FieldValue.arrayUnion(distributedItem),
        modifiedAt: FieldValue.serverTimestamp()
    });
    await batch.commit();
    revalidateDonationViews(donationId);
}
