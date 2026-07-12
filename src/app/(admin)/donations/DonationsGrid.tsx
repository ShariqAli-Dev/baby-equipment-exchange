'use client';

import { Box } from '@mui/material';
import DonationCard, { DonationCardData } from '@/components/DonationCard';

export default function DonationsGrid({ donations }: { donations: DonationCardData[] }) {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)'
                },
                gap: 2
            }}
        >
            {donations.map((donation) => (
                <DonationCard key={donation.id} donation={donation} href={`/donations/${donation.id}`} />
            ))}
        </Box>
    );
}
