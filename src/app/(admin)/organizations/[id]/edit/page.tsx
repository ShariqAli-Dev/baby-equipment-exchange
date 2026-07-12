import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import EditOrganizationClient from './EditOrganizationClient';
import { getOrganizationById } from '@/server/organizations';

export const metadata: Metadata = { title: 'Edit organization' };

export default async function EditOrganizationPage({ params }: { params: { id: string } }) {
    const organization = await getOrganizationById(params.id);
    if (!organization) notFound();
    return <EditOrganizationClient organization={organization} />;
}
