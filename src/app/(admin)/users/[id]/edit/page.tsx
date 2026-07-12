import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import EditUserClient from './EditUserClient';
import { getDbUser } from '@/server/users';
import { getOrganizationNames } from '@/server/organizations';

export const metadata: Metadata = { title: 'Edit user' };

export default async function EditUserPage({ params }: { params: { id: string } }) {
    const [user, orgNamesAndIds] = await Promise.all([getDbUser(params.id), getOrganizationNames()]);
    if (!user) notFound();
    return <EditUserClient user={user} orgNamesAndIds={orgNamesAndIds} />;
}
