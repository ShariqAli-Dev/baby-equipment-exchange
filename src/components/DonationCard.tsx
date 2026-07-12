'use client';

import Link from 'next/link';
import { Card, CardMedia, CardContent, CardActionArea, Typography, Stack, Chip, Divider, Box } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { getStatusChipProps } from '@/utils/statusChipProps';
import { cardHoverSx } from './cardHoverSx';

// Plain serializable card data so server pages can render the grid directly;
// callers map their DonationDTO / Donation model into this shape.
export type DonationCardData = {
    id: string;
    brand: string | null;
    model: string | null;
    category: string | null;
    tagNumber: string | null;
    status: string;
    donorEmail: string | null;
    images: string[];
    dateLabel: string | null;
};

type DonationCardProps = {
    donation: DonationCardData;
    href: string;
};

export default function DonationCard({ donation, href }: DonationCardProps) {
    const image = donation.images?.[0] || '';
    const statusChip = getStatusChipProps(donation.status);

    return (
        <Card sx={cardHoverSx}>
            <CardActionArea component={Link} href={href}>
                <CardMedia
                    component="img"
                    image={image}
                    alt={`${donation.brand} ${donation.model}`}
                    sx={{ aspectRatio: '4/3', objectFit: 'cover', bgcolor: '#f5f5f5' }}
                />
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                        {donation.brand} {donation.model}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                        {donation.tagNumber && (
                            <Chip size="small" label={donation.tagNumber} sx={{ height: 20, fontSize: '0.7rem' }} />
                        )}
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {donation.category}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="space-between" sx={{ mt: 0.75 }}>
                        <Chip size="small" color={statusChip.color} label={statusChip.label} sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }} />
                        <InfoOutlinedIcon fontSize="small" color="action" aria-hidden />
                    </Stack>
                    <Divider sx={{ mt: 1, mb: 0.75 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ minWidth: 0 }}>
                            {donation.donorEmail}
                        </Typography>
                        {donation.dateLabel && (
                            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                                {donation.dateLabel}
                            </Typography>
                        )}
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
