'use client';

import { List } from '@mui/material';
import UserCard, { UserCardData } from '@/components/UserCard';
//Styles
import styles from '@/components/Browse.module.css';

export default function UsersList({ users }: { users: UserCardData[] }) {
    return (
        <div className="content--container">
            <List className={styles['browse__grid']}>
                {users.map((user) => (
                    <UserCard key={user.uid} user={user} href={`/users/${user.uid}`} />
                ))}
            </List>
        </div>
    );
}
