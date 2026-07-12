import type { Metadata } from 'next';

import ListPageShell from '@/components/ListPageShell';
import FilterBar, { FilterDef } from '@/components/FilterBar';
import UsersList from './UsersList';
import { getDbUsers } from '@/server/users';
import { parseListParam, parseStringParam, type SearchParamValue } from '@/lib/search-params';

export const metadata: Metadata = { title: 'Users' };

type UsersPageProps = {
    searchParams: Record<string, SearchParamValue>;
};

// Soft-deleted users are hidden by default (L13: the Dashboard filtered them
// out, the old standalone page didn't); ?deleted=1 includes them explicitly.
export default async function UsersPage({ searchParams }: UsersPageProps) {
    const q = parseStringParam(searchParams.q);
    const includeDeleted = parseListParam(searchParams.deleted).includes('1');

    const users = await getDbUsers({ q: q || undefined, includeDeleted });

    const filters: FilterDef[] = [
        {
            key: 'deleted',
            label: 'Show',
            options: [{ value: '1', label: 'Include deleted users' }]
        }
    ];

    return (
        <ListPageShell title="Users" filterBar={<FilterBar searchPlaceholder="Search by name, email, organization, or title" filters={filters} />}>
            {users.length === 0 ? (
                <p>No users found</p>
            ) : (
                <UsersList
                    users={users.map((user) => ({
                        uid: user.uid,
                        displayName: user.displayName,
                        email: user.email,
                        organizationName: user.organization?.name ?? null,
                        isDisabled: user.isDisabled
                    }))}
                />
            )}
        </ListPageShell>
    );
}
