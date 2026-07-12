import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import UserDetailView from './UserDetailView';
import { getDbUser } from '@/server/users';

export const metadata: Metadata = { title: 'User details' };

export default async function UserDetailPage({ params }: { params: { id: string } }) {
    const user = await getDbUser(params.id);
    if (!user) notFound();
    return <UserDetailView user={user} />;
}
