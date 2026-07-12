'use server';

import 'server-only';

import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';

import { db } from '../firebase-admin';
import { requireAdmin } from '../auth/guards';
import { DONATIONS_COLLECTION } from '../donations';
import { ORDERS_COLLECTION, type OrderItemRejectionResolution } from '../orders';

function revalidateOrderViews(orderId: string) {
    revalidatePath('/notifications');
    revalidatePath(`/review-order/${orderId}`);
    revalidatePath('/donations');
    revalidatePath('/inventory');
}

export async function closeOrderAction(id: string): Promise<void> {
    await requireAdmin();
    await db.collection(ORDERS_COLLECTION).doc(id).update({ status: 'closed', modifiedAt: FieldValue.serverTimestamp() });
    revalidateOrderViews(id);
}

// Port of removeDonationFromOrder (the reject-with-resolution flow, d0ca174):
// moves the donation to rejectedItems and applies the chosen next step, all in
// one transaction. Takes the donation ID (serializable) instead of a Donation
// class instance.
export async function removeDonationFromOrderAction(
    orderId: string,
    donationId: string,
    resolution: OrderItemRejectionResolution = { action: 'unavailable' }
): Promise<void> {
    await requireAdmin();
    const orderRef = db.collection(ORDERS_COLLECTION).doc(orderId);
    const donationRef = db.collection(DONATIONS_COLLECTION).doc(donationId);
    const reassignedOrderRef = resolution.action === 'requested' ? db.collection(ORDERS_COLLECTION).doc() : null;

    await db.runTransaction(async (transaction) => {
        const orderSnapshot = await transaction.get(orderRef);
        if (!orderSnapshot.exists) {
            throw new Error('Order not found');
        }

        const donationSnapshot = await transaction.get(donationRef);
        if (!donationSnapshot.exists) {
            throw new Error('Donation not found');
        }

        const orderData = orderSnapshot.data()!;
        if (orderData.status !== 'open') {
            throw new Error('Order is no longer open');
        }

        const donationData = donationSnapshot.data()!;
        if (donationData.status !== 'requested') {
            throw new Error('Donation is no longer requested');
        }

        if (resolution.action === 'requested' && resolution.requestor.id === orderData.requestor?.id) {
            throw new Error('Donation is already requested by this user');
        }

        const orderItems = (orderData.items ?? []) as FirebaseFirestore.DocumentReference[];
        const matchingOrderItem = orderItems.find((itemRef) => itemRef.id === donationId || itemRef.path === donationRef.path);
        if (!matchingOrderItem) {
            throw new Error('Donation is no longer in this order');
        }

        const remainingItemCount = orderItems.filter((itemRef) => itemRef.id !== donationId && itemRef.path !== donationRef.path).length;
        transaction.update(orderRef, {
            items: FieldValue.arrayRemove(donationRef),
            rejectedItems: FieldValue.arrayUnion(donationRef),
            status: remainingItemCount === 0 ? 'closed' : orderData.status,
            modifiedAt: FieldValue.serverTimestamp()
        });

        if (resolution.action === 'available') {
            transaction.update(donationRef, {
                status: 'available',
                requestor: null,
                dateRequested: null,
                modifiedAt: FieldValue.serverTimestamp()
            });
        } else if (resolution.action === 'requested') {
            if (!reassignedOrderRef) {
                throw new Error('Unable to create reassigned order');
            }

            transaction.set(reassignedOrderRef, {
                status: 'open',
                requestor: resolution.requestor,
                items: [donationRef],
                rejectedItems: [],
                createdAt: FieldValue.serverTimestamp(),
                modifiedAt: FieldValue.serverTimestamp()
            });
            transaction.update(donationRef, {
                status: 'requested',
                requestor: resolution.requestor,
                dateRequested: FieldValue.serverTimestamp(),
                modifiedAt: FieldValue.serverTimestamp()
            });
        } else {
            transaction.update(donationRef, {
                status: 'unavailable',
                requestor: null,
                modifiedAt: FieldValue.serverTimestamp()
            });
        }
    });
    revalidateOrderViews(orderId);
}
