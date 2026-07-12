import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import EditCategoryClient from './EditCategoryClient';
import { getCategoryById } from '@/server/categories';

export const metadata: Metadata = { title: 'Edit category' };

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
    // Category doc ids are the category name — arrives percent-encoded in the URL.
    const category = await getCategoryById(decodeURIComponent(params.id));
    if (!category) notFound();
    return <EditCategoryClient category={category} />;
}
