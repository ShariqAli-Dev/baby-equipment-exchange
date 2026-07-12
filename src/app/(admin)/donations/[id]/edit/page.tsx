import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import EditDonationClient from './EditDonationClient';
import { getDonationById } from '@/server/donations';
import { getAllCategories } from '@/server/categories';

export const metadata: Metadata = { title: 'Edit donation' };

export default async function EditDonationPage({ params }: { params: { id: string } }) {
    const [donation, categories] = await Promise.all([getDonationById(params.id), getAllCategories()]);
    if (!donation) notFound();
    return <EditDonationClient donation={donation} categories={categories.map(({ name, active }) => ({ name, active }))} />;
}
