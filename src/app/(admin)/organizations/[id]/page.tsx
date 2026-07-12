import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import OrganizationDetailView from './OrganizationDetailView';
import { getOrganizationById } from '@/server/organizations';

export const metadata: Metadata = { title: 'Organization details' };

export default async function OrganizationDetailPage({ params }: { params: { id: string } }) {
    const organization = await getOrganizationById(params.id);
    if (!organization) notFound();
    return <OrganizationDetailView organization={organization} />;
}
