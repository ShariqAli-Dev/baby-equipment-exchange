import 'server-only';

import { db } from './firebase-admin';
import { requireAdmin } from './auth/guards';
import { toIso } from './serialize';
import { toDonationDTO, type DonationDTO } from './donations';

export const ORDERS_COLLECTION = 'Orders';

export type OrderItemRejectionResolution =
    | { action: 'available' }
    | { action: 'unavailable' }
    | { action: 'requested'; requestor: { id: string; name: string; email: string } };

export type OrderDTO = {
    id: string;
    status: string;
    requestor: { id: string; name: string; email: string };
    items: DonationDTO[];
    rejectedItems: DonationDTO[];
    createdAt: string | null;
    modifiedAt: string | null;
};

// Order docs store DocumentReferences in items/rejectedItems; db.getAll
// resolves them in one round-trip (replaces the chunked documentId-in
// queries the client SDK needed).
async function resolveRefs(refs: FirebaseFirestore.DocumentReference[]): Promise<DonationDTO[]> {
    if (refs.length === 0) return [];
    const docs = await db.getAll(...refs);
    return docs.filter((doc) => doc.exists).map(toDonationDTO);
}

async function toOrderDTO(doc: FirebaseFirestore.DocumentSnapshot): Promise<OrderDTO> {
    const data = doc.data() ?? {};
    const [items, rejectedItems] = await Promise.all([resolveRefs(data.items ?? []), resolveRefs(data.rejectedItems ?? [])]);
    return {
        id: doc.id,
        status: data.status,
        requestor: data.requestor,
        items,
        rejectedItems,
        createdAt: toIso(data.createdAt),
        modifiedAt: toIso(data.modifiedAt)
    };
}

// Open orders for the admin notifications feed (getOrdersNotifications today).
export async function getOpenOrders(): Promise<OrderDTO[]> {
    await requireAdmin();
    const snap = await db.collection(ORDERS_COLLECTION).where('status', '==', 'open').get();
    return Promise.all(snap.docs.map(toOrderDTO));
}

export async function getOrderById(id: string): Promise<OrderDTO | null> {
    await requireAdmin();
    const doc = await db.collection(ORDERS_COLLECTION).doc(id).get();
    return doc.exists ? await toOrderDTO(doc) : null;
}
