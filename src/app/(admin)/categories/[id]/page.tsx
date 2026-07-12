import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import CategoryDetailView from './CategoryDetailView';
import { getCategoryById } from '@/server/categories';

export const metadata: Metadata = { title: 'Category details' };

export default async function CategoryDetailPage({ params }: { params: { id: string } }) {
    // Category doc ids are the category name — arrives percent-encoded in the URL.
    const category = await getCategoryById(decodeURIComponent(params.id));
    if (!category) notFound();
    return <CategoryDetailView category={category} />;
}
