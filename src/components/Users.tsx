'use client';

// INTERIM: only the admin Dashboard (deleted in the home/dashboard vertical) still
// renders this. The canonical users list is the server page at /users; card
// clicks navigate to /users/[id] instead of the in-place UserDetails drill-down.

// Hooks
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
// Components
import { InputAdornment, List, TextField, Typography } from '@mui/material';
import UserCard, { UserCardData } from '@/components/UserCard';
// Icons
import SearchIcon from '@mui/icons-material/Search';
// Styles
import styles from '@/components/Browse.module.css';
import '@/styles/globalStyles.css';
// Types
import { IUser } from '@/models/user';

type UserListProps = {
    users: IUser[];
    // Still passed by the Dashboard (dies in the home/dashboard vertical); unused
    // here since mutations happen on the canonical /users routes now.
    setUsersUpdated?: Dispatch<SetStateAction<boolean>>;
};

function toCardData(user: IUser): UserCardData {
    return {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        organizationName: user.organization?.name ?? null,
        isDisabled: user.isDisabled
    };
}

export default function Users(props: UserListProps) {
    const { users } = props;
    const [searchInput, setSearchInput] = useState<string>('');
    const [filteredUsers, setFilteredUsers] = useState<IUser[]>(users);

    useEffect(() => {
        setFilteredUsers(users.filter((user) => Object.values(user).some((value) => String(value).toLowerCase().includes(searchInput.toLowerCase()))));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    return (
        <>
            <div className={'page--header'}>
                <Typography variant="h5">Users</Typography>
            </div>
            <TextField
                label="Search"
                id="search-field"
                value={searchInput}
                onChange={(event: React.ChangeEvent<HTMLInputElement>): void => setSearchInput(event.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    )
                }}
            />
            <div className="content--container">
                <List className={styles['browse__grid']}>
                    {filteredUsers.map((userRecord: IUser) => {
                        return <UserCard key={userRecord.uid} user={toCardData(userRecord)} href={`/users/${userRecord.uid}`} />;
                    })}
                </List>
            </div>
        </>
    );
}
