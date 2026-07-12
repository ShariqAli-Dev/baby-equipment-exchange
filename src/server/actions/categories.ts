'use server';

import 'server-only';

import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';

import { db } from '../firebase-admin';
import { requireAdmin } from '../auth/guards';
import { CATEGORIES_COLLECTION } from '../categories';

import type { categoryBody } from '@/types/CategoryTypes';

function revalidateCategoryViews(id?: string) {
    revalidatePath('/categories');
    if (id) revalidatePath(`/categories/${id}`);
}

// Doc keyed by category name (mirrors addCategory).
export async function addCategoryAction(newCategory: categoryBody): Promise<void> {
    await requireAdmin();
    await db.collection(CATEGORIES_COLLECTION).doc(newCategory.name).set({
        id: newCategory.name,
        active: true,
        name: newCategory.name,
        description: newCategory.description,
        tagCount: 0,
        tagPrefix: newCategory.tagPrefix,
        modifiedAt: FieldValue.serverTimestamp()
    });
    revalidateCategoryViews();
}

export async function updateCategoryAction(id: string, categoryDetails: Record<string, unknown>): Promise<void> {
    await requireAdmin();
    await db
        .collection(CATEGORIES_COLLECTION)
        .doc(id)
        .update({ ...categoryDetails, modifiedAt: FieldValue.serverTimestamp() });
    revalidateCategoryViews(id);
}

export async function deleteCategoryAction(id: string): Promise<void> {
    await requireAdmin();
    await db.collection(CATEGORIES_COLLECTION).doc(id).delete();
    revalidateCategoryViews(id);
}

// Mutation (increments the category's tagCount), so it lives with the actions.
// Same transaction semantics as the client getTagNumber, Admin SDK runTransaction.
export async function getTagNumberAction(category: string): Promise<string> {
    await requireAdmin();
    const snap = await db.collection(CATEGORIES_COLLECTION).where('name', '==', category).get();
    const categoryRef = snap.docs[0]?.ref;
    if (!categoryRef) throw new Error('Category not found.');
    let tagNumber = '';
    await db.runTransaction(async (transaction) => {
        const categoryDoc = await transaction.get(categoryRef);
        if (!categoryDoc.exists) throw new Error('Category not found.');
        const categoryData = categoryDoc.data()!;
        const newTagCount = categoryData.tagCount + 1;
        tagNumber = `${categoryData.tagPrefix} ${newTagCount}`;
        transaction.update(categoryRef, { tagCount: newTagCount, modifiedAt: FieldValue.serverTimestamp() });
    });
    revalidateCategoryViews();
    return tagNumber;
}
