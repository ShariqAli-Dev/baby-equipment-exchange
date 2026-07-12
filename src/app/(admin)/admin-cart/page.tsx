import type { Metadata } from 'next';

import AdminCartView from './AdminCartView';
import { getActiveDbUsers } from '@/server/users';

export const metadata: Metadata = { title: 'Your cart' };

// The cart itself is localStorage-backed; the requestor candidates are the
// server-fetched part (the old page lazily fetched them client-side).
export default async function AdminCartPage() {
    const activeUsers = await getActiveDbUsers();
    return <AdminCartView activeUsers={activeUsers} />;
}
