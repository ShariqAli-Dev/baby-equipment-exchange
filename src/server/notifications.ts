import 'server-only';

import { getDonationNotifications } from './donations';
import { getOpenOrders } from './orders';
import { getPendingUsers } from './users';
import type { NotificationsData } from '@/lib/notifications-grouping';

// Multi-collection notifications feed (replaces getNotifications in
// src/api/firebase.ts): the three statuses of donations needing attention,
// open orders, and disabled users awaiting approval — fetched in parallel.
// Each underlying read enforces requireAdmin(). The pure grouping/search
// logic lives in @/lib/notifications-grouping (unit-tested, framework-free).
export async function getNotificationsData(): Promise<NotificationsData> {
    const [donations, orders, users] = await Promise.all([getDonationNotifications(), getOpenOrders(), getPendingUsers()]);
    return { donations, orders, users };
}
