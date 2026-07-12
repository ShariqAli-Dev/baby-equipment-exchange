import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ReviewOrderView from './ReviewOrderView';
import { getOrderById } from '@/server/orders';
import { getActiveDbUsers } from '@/server/users';

export const metadata: Metadata = { title: 'Review order' };

export default async function ReviewOrderPage({ params }: { params: { id: string } }) {
    // Active users are the reassignment candidates for item rejection —
    // server-provided now (the old ReviewOrder lazily fetched them client-side).
    const [order, activeUsers] = await Promise.all([getOrderById(params.id), getActiveDbUsers()]);
    if (!order) notFound();
    return <ReviewOrderView order={order} activeUsers={activeUsers} />;
}
