'use client';

//Hooks
import { useState } from 'react';
import { useRouter } from 'next/navigation';
//Components
import Link from 'next/link';
import { Card, CardActions, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import Loader from '@/components/Loader';
import CustomDialog from '@/components/CustomDialog';
//Api
import { addErrorEvent } from '@/api/firebase';
import { deleteUserAction, enableUserAction } from '@/server/actions/users';
import sendMail from '@/api/nodemailer';
import userEnabled from '@/email-templates/userEnabled';
import rejectUser from '@/email-templates/rejectUser';
//Styles
import styles from './NotificationCards.module.css';
//Types
import type { UserDTO } from '@/server/users';

// A user awaiting approval. Approve enables the account + emails them; Reject
// deletes it + emails them. Both actions revalidate /notifications; the success
// dialog's close triggers router.refresh() to drop the row from the tab.
export default function PendingUserCard({ user }: { user: UserDTO }) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [dialogTitle, setDialogTitle] = useState<string>('');
    const [dialogContent, setDialogContent] = useState<string>('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const router = useRouter();

    const name = user.displayName ?? '';
    const email = user.email ?? '';

    const handleClose = (): void => {
        setIsDialogOpen(false);
        setDialogTitle('');
        setDialogContent('');
        router.refresh();
    };

    const handleEnableUser = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await enableUserAction(user.uid);
            await sendMail(userEnabled(email, name));
            setDialogTitle('User enabled');
            setDialogContent(`The user ${name} has been enabled.`);
            setIsDialogOpen(true);
        } catch (error) {
            addErrorEvent('Call enable user', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await deleteUserAction(user.uid);
            await sendMail(rejectUser(email, name));
            setIsDeleteDialogOpen(false);
            setDialogTitle('User deleted');
            setDialogContent(`The user ${name} has been deleted.`);
            setIsDialogOpen(true);
        } catch (error) {
            addErrorEvent('Call delete user', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <Loader />;

    return (
        <>
            <Card className={styles['notification-card']} variant="outlined">
                <Link href={`/users/${user.uid}`} style={{ width: '100%', textDecoration: 'none', color: 'inherit' }} aria-label="View user details">
                    <CardContent className={styles['notification-card--info']}>
                        <Typography variant="h5">{user.displayName}</Typography>
                        <Typography variant="body1">({user.email})</Typography>
                        {user.organization ? (
                            <Typography variant="body1">
                                <em>{user.organization.name}</em>
                            </Typography>
                        ) : (
                            <Typography variant="body1" sx={{ color: 'red' }}>
                                <em>No organization assigned.</em>
                            </Typography>
                        )}
                    </CardContent>
                </Link>
                <CardActions className={styles['notification-card--container--btn']}>
                    <Button variant="contained" onClick={handleEnableUser} disabled={!user.organization}>
                        Approve
                    </Button>
                    <Button variant="contained" color="error" onClick={() => setIsDeleteDialogOpen(true)}>
                        Reject
                    </Button>
                </CardActions>
            </Card>
            {/* Dialog for rejecting user */}
            <Dialog open={isDeleteDialogOpen} aria-labelledby="dialog-title" aria-describedby="dialog-description">
                <DialogTitle id="dialog-title">Reject pending user?</DialogTitle>
                <DialogContent>
                    <DialogContentText id="dialog-description">This will delete the user &quot;{user.displayName}.&quot; Are you sure?</DialogContentText>
                    <DialogActions>
                        <Button variant="contained" onClick={handleDeleteUser}>
                            Confirm
                        </Button>
                        <Button variant="outlined" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
            {/* Confirmation dialog */}
            <CustomDialog isOpen={isDialogOpen} onClose={handleClose} title={dialogTitle} content={dialogContent} />
        </>
    );
}
