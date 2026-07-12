import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ScheduleDonationView from './ScheduleDonationView';
import { getDonationById } from '@/server/donations';
import { getSchedulingPageLink } from '@/api/calendly';
import type { EventType } from '@/types/CalendlyTypes';

export const metadata: Metadata = { title: 'Accept donation' };

// Single-donation accept email with an optional calendar invite. NOTE: the
// send button has never been wired up (handleSubmit was already empty before
// the refactor) — kept as-is, out of scope here.
export default async function ScheduleDonationPage({ params }: { params: { id: string } }) {
    const donation = await getDonationById(params.id);
    if (!donation) notFound();

    let events: EventType[] = [];
    try {
        events = await getSchedulingPageLink();
    } catch {
        events = [];
    }

    return <ScheduleDonationView donorEmail={donation.donorEmail ?? ''} events={events} />;
}
