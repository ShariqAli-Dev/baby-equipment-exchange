import type { Metadata } from 'next';

import AcceptDonationsView from './AcceptDonationsView';
import { getDonationsByBulkId } from '@/server/donations';

export const metadata: Metadata = { title: 'Review donation' };

// Reviews a bulk donation submission: [id] is the BulkDonations doc id. The
// accept/reject picks live in ?accepted=&rejected= so the review survives
// refresh and carries into the /schedule segment.
export default async function AcceptDonationPage({ params }: { params: { id: string } }) {
    const donations = await getDonationsByBulkId(params.id);
    return <AcceptDonationsView bulkId={params.id} donations={donations} />;
}
