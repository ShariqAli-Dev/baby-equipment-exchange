// Display-only notification card (pending-approval and requested tabs). No
// mutations, so it stays a server component; the image links to the canonical
// donation detail route (replaces the old setIdToDisplay drill-down).
import Link from 'next/link';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import styles from './NotificationCards.module.css';
import type { DonationDTO } from '@/server/donations';

export default function NotificationDonationCard({ donation }: { donation: DonationDTO }) {
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
                    <Typography variant="caption">Donated by:</Typography>
                    <Typography variant="subtitle1">
                        {donation.donorName} ({donation.donorEmail})
                    </Typography>
                </CardContent>
            </div>
        </Card>
    );
}
