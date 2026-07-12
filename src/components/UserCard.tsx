'use client';

//Components
import Link from 'next/link';
import { ListItem, ListItemButton, ListItemText } from '@mui/material';
//Styles
import '@/styles/globalStyles.css';

// Serializable card shape so server pages can render the list
// (both UserDTO projections and the legacy IUser satisfy it).
export type UserCardData = {
    uid: string;
    displayName: string | null;
    email: string | null;
    organizationName: string | null;
    isDisabled: boolean | null | undefined;
};

type UserCardProps = {
    user: UserCardData;
    href: string;
};

export default function UserCard({ user, href }: UserCardProps) {
    const { uid, email, displayName, organizationName, isDisabled } = user;

    return (
        <ListItem key={uid} sx={!isDisabled ? { background: 'white', border: '1px solid black' } : { background: 'white', border: '1px solid red' }}>
            <ListItemButton component={Link} href={href}>
                <ListItemText
                    primary={
                        <p>
                            <b>{displayName}</b> ({email})
                        </p>
                    }
                    secondary={
                        <>
                            <i>{organizationName ?? 'None assigned'}</i>
                        </>
                    }
                    sx={{ color: 'black' }}
                />
                {isDisabled && <ListItemText primary={<p>This user requires approval</p>} sx={{ color: 'red' }}></ListItemText>}
            </ListItemButton>
        </ListItem>
    );
}
