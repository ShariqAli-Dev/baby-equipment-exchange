import 'server-only';

import { db } from './firebase-admin';
import { requireAdmin, requireAidWorkerOrAdmin, requireSession } from './auth/guards';
import { toIso } from './serialize';
import type { DonationStatusValues } from '@/models/donation';

export const DONATIONS_COLLECTION = 'Donations';

// Plain serializable projection of a Donations doc (replaces the Donation
// model class for server-fetched views; resolves L10's converter drift —
// fields are explicit here).
export type DonationDTO = {
    id: string;
    donorEmail: string | null;
    donorName: string | null;
    donorId: string | null;
    category: string | null;
    brand: string | null;
    model: string | null;
    description: string | null;
    tagNumber: string | null;
    notes: string[] | null;
    status: DonationStatusValues;
    bulkCollection: string | null;
    images: string[];
    createdAt: string | null;
    modifiedAt: string | null;
    dateAccepted: string | null;
    dateReceived: string | null;
    dateRequested: string | null;
    dateDistributed: string | null;
    requestor: { id: string; name: string; email: string } | null;
    distributor: { id: string; name: string; email: string; organization: string } | null;
    daysInStorage: number | null;
};

// The lighter projection the aid-worker inventory views use today
// (inventoryConverter in src/api/firebase-donations.ts).
export type InventoryItemDTO = {
    id: string;
    category: string | null;
    brand: string | null;
    model: string | null;
    description: string | null;
    tagNumber: string | null;
    status: DonationStatusValues;
    images: string[];
};

export function toDonationDTO(doc: FirebaseFirestore.DocumentSnapshot): DonationDTO {
    const data = doc.data() ?? {};
    const dateReceived = toIso(data.dateReceived);
    const dateDistributed = toIso(data.dateDistributed);
    // Mirrors Donation.getDaysInStorage(): days to distribute, or days in storage so far.
    const daysInStorage = dateReceived
        ? Math.floor(((dateDistributed ? Date.parse(dateDistributed) : Date.now()) - Date.parse(dateReceived)) / 86400000)
        : null;
    return {
        id: doc.id,
        donorEmail: data.donorEmail ?? null,
        donorName: data.donorName ?? null,
        donorId: data.donorId ?? null,
        category: data.category ?? null,
        brand: data.brand ?? null,
        model: data.model ?? null,
        description: data.description ?? null,
        tagNumber: data.tagNumber ?? null,
        notes: data.notes ?? null,
        status: data.status,
        bulkCollection: data.bulkCollection ?? null,
        images: data.images ?? [],
        createdAt: toIso(data.createdAt),
        modifiedAt: toIso(data.modifiedAt),
        dateAccepted: toIso(data.dateAccepted),
        dateReceived,
        dateRequested: toIso(data.dateRequested),
        dateDistributed,
        requestor: data.requestor ?? null,
        distributor: data.distributor ?? null,
        daysInStorage
    };
}

export function toInventoryItemDTO(doc: FirebaseFirestore.DocumentSnapshot): InventoryItemDTO {
    const data = doc.data() ?? {};
    return {
        id: doc.id,
        category: data.category ?? null,
        brand: data.brand ?? null,
        model: data.model ?? null,
        description: data.description ?? null,
        tagNumber: data.tagNumber ?? null,
        status: data.status,
        images: data.images ?? []
    };
}

export type DonationFilter = { q?: string; category?: string[]; status?: string[] };

// Same text-search semantics as the useMemo filter in Donations.tsx —
// runs in JS server-side, no new composite indexes (dev-DB constraint).
function matchesSearch(d: DonationDTO, q: string): boolean {
    const search = q.toLowerCase();
    const searchableValues = [
        d.tagNumber,
        d.status,
        d.category,
        d.brand,
        d.model,
        d.description,
        d.donorName,
        d.donorEmail,
        d.requestor?.name,
        d.requestor?.email,
        d.distributor?.name,
        d.distributor?.email
    ];
    return searchableValues.some((value) => String(value ?? '').toLowerCase().includes(search));
}

export async function getDonationsForAdmin(filter?: DonationFilter): Promise<DonationDTO[]> {
    await requireAdmin();
    let query: FirebaseFirestore.Query = db.collection(DONATIONS_COLLECTION);
    // Single-status equality is an already-proven query shape; everything else
    // filters in JS with the same semantics as today's client useMemo.
    if (filter?.status?.length === 1) query = query.where('status', '==', filter.status[0]);
    const snap = await query.get();
    let rows = snap.docs.map(toDonationDTO);
    if (filter?.status && filter.status.length > 1) rows = rows.filter((d) => filter.status!.includes(d.status));
    if (filter?.category?.length) rows = rows.filter((d) => d.category !== null && filter.category!.includes(d.category));
    if (filter?.q) rows = rows.filter((d) => matchesSearch(d, filter.q!));
    return rows;
}

export async function getDonationById(id: string): Promise<DonationDTO | null> {
    await requireAdmin();
    const doc = await db.collection(DONATIONS_COLLECTION).doc(id).get();
    return doc.exists ? toDonationDTO(doc) : null;
}

export async function getDonationsByBulkId(bulkId: string): Promise<DonationDTO[]> {
    await requireAdmin();
    if (!bulkId) return [];
    const snap = await db.collection(DONATIONS_COLLECTION).where('bulkCollection', '==', bulkId).where('status', '==', 'in processing').get();
    return snap.docs.map(toDonationDTO);
}

// Admin notifications feed: statuses needing attention (same three as
// getDonationNotifications in src/api/firebase-donations.ts).
export async function getDonationNotifications(): Promise<DonationDTO[]> {
    await requireAdmin();
    const snap = await db
        .collection(DONATIONS_COLLECTION)
        .where('status', 'in', ['in processing', 'pending delivery', 'reserved'])
        .get();
    return snap.docs.map(toDonationDTO);
}

export type InventoryFilter = { q?: string; category?: string[] };

export async function getInventory(filter?: InventoryFilter): Promise<InventoryItemDTO[]> {
    await requireAidWorkerOrAdmin();
    const snap = await db.collection(DONATIONS_COLLECTION).where('status', '==', 'available').get();
    let rows = snap.docs.map(toInventoryItemDTO);
    if (filter?.category?.length) rows = rows.filter((i) => i.category !== null && filter.category!.includes(i.category));
    if (filter?.q) {
        const search = filter.q.toLowerCase();
        rows = rows.filter((i) =>
            [i.tagNumber, i.category, i.brand, i.model, i.description].some((value) => String(value ?? '').toLowerCase().includes(search))
        );
    }
    return rows;
}

export async function getInventoryItemById(id: string): Promise<InventoryItemDTO | null> {
    await requireAidWorkerOrAdmin();
    const doc = await db.collection(DONATIONS_COLLECTION).doc(id).get();
    return doc.exists ? toInventoryItemDTO(doc) : null;
}

// For rehydrating localStorage-backed carts.
export async function getInventoryByIds(ids: string[]): Promise<InventoryItemDTO[]> {
    await requireAidWorkerOrAdmin();
    if (ids.length === 0) return [];
    const docs = await db.getAll(...ids.map((id) => db.collection(DONATIONS_COLLECTION).doc(id)));
    return docs.filter((doc) => doc.exists).map(toInventoryItemDTO);
}

// Replaces the aredonationsavailable Cloud Function and adminAreDonationsAvailable:
// returns the subset of ids whose donation is NOT currently available.
export async function areDonationsAvailable(ids: string[]): Promise<string[]> {
    await requireSession();
    if (ids.length === 0) return [];
    const docs = await db.getAll(...ids.map((id) => db.collection(DONATIONS_COLLECTION).doc(id)));
    return docs.filter((doc) => doc.exists && doc.data()?.status !== 'available').map((doc) => doc.id);
}
