import { redirect } from 'next/navigation';
import { getSession } from '@/server/auth/get-session';

// Authoritative role gate for admin routes. Middleware only checks that a
// session cookie exists; this layout verifies it and enforces the admin claim.
// Route folders migrate into this group during Phase V.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    if (!session) redirect('/login');
    if (!session.isAdmin) redirect('/');
    return <>{children}</>;
}
