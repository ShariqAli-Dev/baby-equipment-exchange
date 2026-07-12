import { redirect } from 'next/navigation';

import { getSession } from '@/server/auth/get-session';
import HomePage from '@/components/HomePage';

// Server-side landing gate (replaces the client isAdmin/isAidWorker branch that
// always fell through to HomePage — L14). Admins and aid-workers are sent to
// their canonical section; everyone else (anonymous or plain donor) sees the
// public marketing home.
export default async function Home() {
    const session = await getSession();

    if (session?.isAdmin) redirect('/notifications');
    if (session?.isAidWorker) redirect('/inventory');

    return <HomePage />;
}
