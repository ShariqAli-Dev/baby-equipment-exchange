'use client';

//Hooks
import { useState } from 'react';
import { useRouter } from 'next/navigation';
//Components
import Link from 'next/link';
import { Card, CardActions, CardContent, CardMedia, Typography, Button } from '@mui/material';
import Loader from '@/components/Loader';
//Api
import { addErrorEvent } from '@/api/firebase';
import { markDonationAsDistributedAction, updateDonationAction } from '@/server/actions/donations';
//Styles
import styles from './NotificationCards.module.css';
//Types
import type { DonationDTO } from '@/server/donations';

const toDateString = (iso: string | null): string | null => (iso ? new Date(iso).toDateString() : null);

// Reserved donations awaiting pickup: mark distributed, or return to inventory.
// returnToInventory mirrors the old plain status update (no dateReceived stamp),
// hence updateDonationAction rather than updateDonationStatusAction.
export default function ReservedCard({ donation }: { donation: DonationDTO }) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    const markAsDistributed = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await markDonationAsDistributedAction(donation.id);
            router.refresh();
        } catch (error) {
            setIsLoading(false);
            addErrorEvent('Mark as distributed', error);
        }
    };

    const returnToInventory = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await updateDonationAction(donation.id, { status: 'available' });
            router.refresh();
        } catch (error) {
            setIsLoading(false);
            addErrorEvent('Return to inventory', error);
        }
    };

    if (isLoading) return <Loader />;

    return (
        <Card className={styles['notification-card']} variant="outlined">
            <div className={styles['notification-card--group']}>
                <Link href={`/donations/${donation.id}`} className={styles['notification-card--image']} aria-label="View donation details">
                    <CardMedia component="img" alt={donation.model ?? 'donation'} image={donation.images[0]} loading="lazy" />
                </Link>
                <CardContent className={styles['notification-card--info']}>
                    <Typography variant="h5">
                        {donation.brand} - {donation.model}
                    </Typography>
                    <Typography variant="h6">{donation.tagNumber}</Typography>
                    {donation.dateRequested && (
                        <>
                            <Typography variant="caption">Requested on:</Typography>
                            <Typography variant="body1">{toDateString(donation.dateRequested)}</Typography>
                        </>
                    )}
                    <Typography variant="caption">Requested by:</Typography>
                    <Typography variant="subtitle1">
                        <Link href={`/users/${donation.requestor?.id}`}>
                            {donation.requestor?.name} ({donation.requestor?.email})
                        </Link>
                    </Typography>
                </CardContent>
            </div>
            <CardActions className={styles['notification-card--container--btn']}>
                <Button variant="contained" onClick={markAsDistributed}>
                    Mark as distributed
                </Button>
                <Button variant="contained" color="error" onClick={returnToInventory}>
                    Return to Inventory
                </Button>
            </CardActions>
        </Card>
    );
}
