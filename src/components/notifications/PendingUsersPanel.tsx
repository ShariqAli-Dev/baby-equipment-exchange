// Pending-users tab (server): one card per user awaiting approval.
import PendingUserCard from './PendingUserCard';
import EmptyTabMessage from './EmptyTabMessage';
import type { UserDTO } from '@/server/users';

export default function PendingUsersPanel({ users, query }: { users: UserDTO[]; query: string }) {
    if (users.length === 0) return <EmptyTabMessage query={query} defaultMessage="No users pending approval." />;
    return (
        <>
            {users.map((user) => (
                <PendingUserCard key={user.uid} user={user} />
            ))}
        </>
    );
}
