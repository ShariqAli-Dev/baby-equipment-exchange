'use client';

import { useRouter } from 'next/navigation';
import { Card, CardActions, CardMedia, CardContent, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';

import '@/styles/globalStyles.css';

import type { DonationDTO } from '@/server/donations';

const thumbnailStyles = {
    width: '15%',
    objectFit: 'cover',
    aspectRatio: '1 / 1'
};

type ButtonStatus = 'accepted' | 'rejected' | null;

type AcceptRejectItemCardProps = {
    donation: DonationDTO;
    // Controlled: the accept/reject pick lives in the page URL, not card state.
    status: ButtonStatus;
    onChange: (value: ButtonStatus, id: string) => void;
};

const AcceptRejectItemCard = (props: AcceptRejectItemCardProps) => {
    const { donation, status, onChange } = props;
    const router = useRouter();

    const handleToggle = (event: React.MouseEvent<HTMLElement>, value: ButtonStatus) => {
        onChange(value, donation.id);
    };

    return (
        <Card className="card--container" elevation={3}>
            <CardActions onClick={() => router.push(`/donations/${donation.id}`)} sx={{ cursor: 'pointer' }}>
                <CardMedia component="img" alt={donation.model ?? ''} image={donation.images[0]} sx={thumbnailStyles} />
                <CardContent>
                    <Typography variant="h4">{donation.model}</Typography>
                    <Typography variant="h4">{donation.brand}</Typography>
                </CardContent>
            </CardActions>
            <CardActions>
                <ToggleButtonGroup value={status} exclusive onChange={handleToggle}>
                    <ToggleButton value="accepted" aria-label="accept button" color="success">
                        Accept
                    </ToggleButton>
                    <ToggleButton value="rejected" aria-label="reject button" color="error">
                        Reject
                    </ToggleButton>
                </ToggleButtonGroup>
            </CardActions>
        </Card>
    );
};

export default AcceptRejectItemCard;
