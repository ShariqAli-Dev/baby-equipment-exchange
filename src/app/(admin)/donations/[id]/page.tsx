import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import DonationDetailView from './DonationDetailView';
import { getDonationById } from '@/server/donations';

export const metadata: Metadata = { title: 'Donation details' };

export default async function DonationDetailPage({ params }: { params: { id: string } }) {
    const donation = await getDonationById(params.id);
    if (!donation) notFound();
    return <DonationDetailView donation={donation} />;
}
