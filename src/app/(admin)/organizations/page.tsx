import type { Metadata } from 'next';

import ListPageShell from '@/components/ListPageShell';
import OrganizationsList from './OrganizationsList';
import NewOrganizationButton from './NewOrganizationButton';
import { getOrganizations } from '@/server/organizations';

export const metadata: Metadata = { title: 'Organizations' };

export default async function OrganizationsPage() {
    const organizations = await getOrganizations();

    return (
        <ListPageShell title="Organizations" actions={<NewOrganizationButton />}>
            {organizations.length === 0 ? (
                <p>No organizations found</p>
            ) : (
                <OrganizationsList organizations={organizations.map(({ id, name }) => ({ id, name }))} />
            )}
        </ListPageShell>
    );
}
