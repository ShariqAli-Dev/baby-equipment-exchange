import type { Metadata } from 'next';

import ScheduleDropOffView from './ScheduleDropOffView';
import { getDonationsByBulkId } from '@/server/donations';
import { getSchedulingPageLink } from '@/api/calendly';
import { parseListParam, type SearchParamValue } from '@/lib/search-params';
import type { EventType } from '@/types/CalendlyTypes';

export const metadata: Metadata = { title: 'Send accept/reject email' };

type ScheduleDropOffPageProps = {
    params: { id: string };
    searchParams: Record<string, SearchParamValue>;
};

// The accepted/rejected picks arrive from /accept/[id] as query params; the
// donations themselves are re-fetched here so statuses are server-authoritative.
export default async function ScheduleDropOffPage({ params, searchParams }: ScheduleDropOffPageProps) {
    const acceptedIds = parseListParam(searchParams.accepted);
    const rejectedIds = parseListParam(searchParams.rejected);

    const donations = await getDonationsByBulkId(params.id);
    const accepted = donations.filter((donation) => acceptedIds.includes(donation.id));
    const rejected = donations.filter((donation) => rejectedIds.includes(donation.id));

    // Calendly calendars only matter when something was accepted (rejection-only
    // emails carry no drop-off invite).
    let events: EventType[] = [];
    if (accepted.length > 0) {
        try {
            events = await getSchedulingPageLink();
        } catch {
            events = []; // email can go out without an invite
        }
    }

    return <ScheduleDropOffView accepted={accepted} rejected={rejected} events={events} />;
}
