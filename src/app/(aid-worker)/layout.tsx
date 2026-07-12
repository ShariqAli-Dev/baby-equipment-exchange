import { redirect } from 'next/navigation';
import { getSession } from '@/server/auth/get-session';

// Authoritative role gate for aid-worker routes. Admins are allowed through —
// they hold a superset of aid-worker permissions (mirrors requireAidWorkerOrAdmin).
// Route folders migrate into this group during Phase V.
export default async function AidWorkerLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    if (!session) redirect('/login');
    if (!session.isAidWorker && !session.isAdmin) redirect('/');
    return <>{children}</>;
}
