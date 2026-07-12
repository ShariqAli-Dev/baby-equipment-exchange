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
import { updateDonationStatusAction } from '@/server/actions/donations';
//Styles
import styles from './NotificationCards.module.css';
//Types
import type { DonationDTO } from '@/server/donations';

const toDateString = (iso: string | null): string | null => (iso ? new Date(iso).toDateString() : null);

// Donations awaiting drop-off: accept ('available') or reject ('not-received').
// The action revalidates /notifications; router.refresh() re-renders the list
// (the item leaves this tab), replacing the old client-side refetch flag.
export default function PendingDeliveryCard({ donation }: { donation: DonationDTO }) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    const markAsReceived = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await updateDonationStatusAction(donation.id, 'available');
            router.refresh();
        } catch (error) {
            setIsLoading(false);
            addErrorEvent('Mark donation as received', error);
        }
    };

    const markAsNotReceived = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await updateDonationStatusAction(donation.id, 'not-received');
            router.refresh();
        } catch (error) {
            setIsLoading(false);
            addErrorEvent('Mark donation as not received', error);
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
                    {donation.dateAccepted && (
                        <>
                            <Typography variant="caption">Accepted on:</Typography>
                            <Typography variant="body1"> {toDateString(donation.dateAccepted)}</Typography>
                        </>
                    )}
                    <Typography variant="caption">Donated by:</Typography>
                    <Typography variant="subtitle1">
                        {donation.donorName} ({donation.donorEmail})
                    </Typography>
                </CardContent>
            </div>
            <CardActions className={styles['notification-card--container--btn']}>
                <Button variant="contained" onClick={markAsReceived}>
                    Add to inventory
                </Button>
                <Button variant="contained" color="error" onClick={markAsNotReceived}>
                    Not Received
                </Button>
            </CardActions>
        </Card>
    );
}
