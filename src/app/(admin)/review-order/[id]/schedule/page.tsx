import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import SchedulePickupView from './SchedulePickupView';
import { getOrderById } from '@/server/orders';
import { getSchedulingPageLink } from '@/api/calendly';
import type { EventType } from '@/types/CalendlyTypes';

export const metadata: Metadata = { title: 'Schedule pickup' };

export default async function SchedulePickupPage({ params }: { params: { id: string } }) {
    const order = await getOrderById(params.id);
    if (!order) notFound();

    // Calendly calendars only matter when there is something to pick up
    // (all-rejected orders send a rejection email with no invite).
    let events: EventType[] = [];
    if (order.items.length > 0) {
        try {
            events = await getSchedulingPageLink();
        } catch {
            events = []; // same fallback as the old client fetch — email can go out without an invite
        }
    }

    return <SchedulePickupView order={order} events={events} />;
}
