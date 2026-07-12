// Requested tab (server): open orders grouped by requestor. Each order gets a
// Review link to /review-order/[id]; its items render as display-only cards.
import Link from 'next/link';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import NotificationDonationCard from './NotificationDonationCard';
import EmptyTabMessage from './EmptyTabMessage';
import styles from './NotificationCards.module.css';
import type { RequestorGroup } from '@/lib/notifications-grouping';

// Fixed en-US locale so the server-rendered date matches the client (avoids a
// hydration mismatch on differing default locales).
const toLocaleDate = (iso: string | null): string | null => (iso ? new Date(iso).toLocaleDateString('en-US') : null);

export default function RequestedPanel({ groups, query }: { groups: RequestorGroup[]; query: string }) {
    if (groups.length === 0) return <EmptyTabMessage query={query} defaultMessage="No requested equipment." />;

    return (
        <>
            {groups.map((group) => (
                <Paper key={group.requestorId} variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
                    <Box sx={{ bgcolor: '#f5f5f5', px: 2, py: 1, borderBottom: '1px solid #e0e0e0' }}>
                        <Typography variant="body2" fontWeight={600}>
                            {group.requestorName}
                            <Typography component="span" variant="body2" color="text.secondary">
                                {` — ${group.totalItems} item${group.totalItems !== 1 ? 's' : ''}`}
                            </Typography>
                        </Typography>
                    </Box>
                    {group.orders.length === 1 ? (
                        <Box sx={{ p: 1 }}>
                            {group.orders[0].items.map((item) => (
                                <NotificationDonationCard key={item.id} donation={item} />
                            ))}
                            <Button
                                className={styles['notification-card--container--btn']}
                                variant="contained"
                                component={Link}
                                href={`/review-order/${group.orders[0].id}`}
                            >
                                Review
                            </Button>
                        </Box>
                    ) : (
                        group.orders.map((order, oi) => (
                            <Box key={order.id}>
                                {oi > 0 && <Divider />}
                                <Box
                                    sx={{
                                        bgcolor: '#fafafa',
                                        px: 2,
                                        py: 0.75,
                                        borderBottom: '1px solid #f0f0f0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Typography variant="caption" color="text.secondary">
                                        Order {oi + 1} — {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                        {order.createdAt && ` · ${toLocaleDate(order.createdAt)}`}
                                    </Typography>
                                    <Button size="small" variant="contained" component={Link} href={`/review-order/${order.id}`}>
                                        Review
                                    </Button>
                                </Box>
                                <Box sx={{ p: 1 }}>
                                    {order.items.map((item) => (
                                        <NotificationDonationCard key={item.id} donation={item} />
                                    ))}
                                </Box>
                            </Box>
                        ))
                    )}
                </Paper>
            ))}
        </>
    );
}
