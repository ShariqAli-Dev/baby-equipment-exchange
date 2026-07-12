'use client';

//Components
import Link from 'next/link';
import { Button, IconButton, ListItem, Typography } from '@mui/material';
//Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
//Styles
import '@/styles/globalStyles.css';
//Types
import type { UserDTO } from '@/server/users';

export default function UserDetailView({ user }: { user: UserDTO }) {
    return (
        <div className="page--header">
            <h3>User Details</h3>
            <IconButton component={Link} href="/users" aria-label="Back to users">
                <ArrowBackIcon />
            </IconButton>
            <div className="content--container">
                <Typography variant="h5">{user.displayName}</Typography>
                <Typography variant="h6">{user.email}</Typography>
                <Typography variant="body1">{user.phoneNumber}</Typography>
                {user.organization === null ? (
                    <p style={{ color: 'red' }}>This user is missing an organization. Click edit user to assign one.</p>
                ) : (
                    <Typography variant="body1" sx={{ marginTop: '1em' }}>
                        <b>Organization: </b> {user.organization.name}
                    </Typography>
                )}
                {user.title && (
                    <Typography variant="body1">
                        <b>Title: </b>
                        {user.title}
                    </Typography>
                )}
                {user.distributedItems && (
                    <>
                        <Typography variant="body1" sx={{ marginTop: '1em' }}>
                            <b>Distributed Items:</b>
                        </Typography>
                        <ul>
                            {user.distributedItems.map((item) => (
                                <li key={item.tagNumber}>{item.tagNumber}</li>
                            ))}
                        </ul>
                    </>
                )}
                {user.notes && user.notes.length > 0 && (
                    <>
                        <p>
                            <b>Notes:</b>
                        </p>
                        <ul>
                            {user.notes.map((note, i) => (
                                <ListItem key={i}>{note}</ListItem>
                            ))}
                        </ul>
                    </>
                )}
                <Button variant="contained" component={Link} href={`/users/${user.uid}/edit`} sx={{ marginTop: '2em' }} startIcon={<EditIcon />}>
                    Edit User
                </Button>
            </div>
        </div>
    );
}
