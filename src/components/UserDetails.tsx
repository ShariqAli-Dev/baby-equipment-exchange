'use client';

// INTERIM: only the Notifications drill-down (migrated in the notifications
// vertical) still renders this. The canonical detail view is the server page at
// /users/[id]. Editing moved to /users/[id]/edit — the edit-mode fork that used
// to live here is gone.

//Hooks
import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
//Components
import Loader from '@/components/Loader';
import { ListItem, Typography, Button, IconButton } from '@mui/material';
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute';
//APIs
import { addErrorEvent } from '@/api/firebase';
import { getDbUser } from '@/api/firebase-users';
//icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
//styles
import '@/styles/globalStyles.css';
//Types
import { UserCollection } from '@/models/user';

type UserDetailsProps = {
    id: string;
    setIdToDisplay?: Dispatch<SetStateAction<string | null>>;
};

export default function UserDetails(props: UserDetailsProps) {
    const { id, setIdToDisplay } = props;
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [userDetails, setUserDetails] = useState<UserCollection | null>(null);

    async function fetchUserDetails(id: string): Promise<void> {
        setIsLoading(true);
        try {
            const userDetailsResult: UserCollection = await getDbUser(id);
            setUserDetails(userDetailsResult);
        } catch (error) {
            addErrorEvent('Fetch user details', error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchUserDetails(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    return (
        <ProtectedAdminRoute>
            <div className="page--header">
                <h3>User Details</h3>
                {setIdToDisplay && (
                    <IconButton onClick={() => setIdToDisplay(null)}>
                        <ArrowBackIcon />
                    </IconButton>
                )}
                {isLoading && <Loader />}
                {!isLoading && !userDetails && <p>User not found</p>}
                {!isLoading && userDetails && (
                    <div className="content--container">
                        <Typography variant="h5">{userDetails.displayName}</Typography>
                        <Typography variant="h6">{userDetails.email}</Typography>
                        <Typography variant="body1">{userDetails.phoneNumber}</Typography>
                        {userDetails.organization === null ? (
                            <p style={{ color: 'red' }}>This user is missing an organization. Click edit user to assign one.</p>
                        ) : (
                            <Typography variant="body1" sx={{ marginTop: '1em' }}>
                                <b>Organization: </b> {userDetails.organization.name}
                            </Typography>
                        )}
                        {userDetails.title && (
                            <Typography variant="body1">
                                <b>Title: </b>
                                {userDetails.title}
                            </Typography>
                        )}
                        {userDetails.distributedItems && (
                            <>
                                <Typography variant="body1" sx={{ marginTop: '1em' }}>
                                    <b>Distributed Items:</b>
                                </Typography>
                                <ul>
                                    {userDetails.distributedItems.map((item) => (
                                        <li key={item.tagNumber}>{item.tagNumber}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                        {userDetails.notes && userDetails.notes.length > 0 && (
                            <>
                                <p>
                                    <b>Notes:</b>
                                </p>
                                <ul>
                                    {userDetails.notes.map((note, i) => (
                                        <ListItem key={i}>{note}</ListItem>
                                    ))}
                                </ul>
                            </>
                        )}
                        <Button
                            variant="contained"
                            component={Link}
                            href={`/users/${userDetails.uid}/edit`}
                            sx={{ marginTop: '2em' }}
                            startIcon={<EditIcon />}
                        >
                            Edit User
                        </Button>
                    </div>
                )}
            </div>
        </ProtectedAdminRoute>
    );
}
