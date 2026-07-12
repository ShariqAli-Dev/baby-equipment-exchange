import 'server-only';

import { db } from './firebase-admin';
import { toIso } from './serialize';

export const CATEGORIES_COLLECTION = 'Categories';

export type CategoryDTO = {
    id: string;
    active: boolean;
    name: string;
    description: string | null;
    tagCount: number;
    tagPrefix: string;
    modifiedAt: string | null;
};

export function toCategoryDTO(doc: FirebaseFirestore.DocumentSnapshot): CategoryDTO {
    const data = doc.data() ?? {};
    return {
        id: doc.id,
        active: data.active,
        name: data.name,
        description: data.description ?? null,
        tagCount: data.tagCount,
        tagPrefix: data.tagPrefix,
        modifiedAt: toIso(data.modifiedAt)
    };
}

// Unauthenticated by design: the anonymous donate flow lists categories today
// (client SDK under public read rules) — same exposure.
export async function getAllCategories(): Promise<CategoryDTO[]> {
    const snap = await db.collection(CATEGORIES_COLLECTION).orderBy('name').get();
    return snap.docs.map(toCategoryDTO);
}

export async function getCategoryById(id: string): Promise<CategoryDTO | null> {
    const doc = await db.collection(CATEGORIES_COLLECTION).doc(id).get();
    return doc.exists ? toCategoryDTO(doc) : null;
}
