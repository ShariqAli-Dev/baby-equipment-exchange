// Pending-approval tab (server): donations grouped by donor → name → bulk
// submission. Each submission gets a Review link to the accept flow. The
// donation cards are display-only (server); the Review action is a plain Link.
import Link from 'next/link';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import NotificationDonationCard from './NotificationDonationCard';
import EmptyTabMessage from './EmptyTabMessage';
import { DonorHeader, NameSubHeader, itemCount } from './group-headers';
import styles from './NotificationCards.module.css';
import type { DonorGroup } from '@/lib/notifications-grouping';

export default function PendingApprovalPanel({ groups, query }: { groups: DonorGroup[]; query: string }) {
    if (groups.length === 0) return <EmptyTabMessage query={query} defaultMessage="No donations pending approval." />;

    return (
        <>
            {groups.map((group, gi) => (
                <Paper key={gi} variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
                    <Box sx={{ bgcolor: '#f5f5f5', px: 2, py: 1, borderBottom: '1px solid #e0e0e0' }}>
                        <DonorHeader group={group} />
                    </Box>
                    {group.nameGroups.map((ng, ni) => (
                        <Box key={ni}>
                            {group.nameGroups.length > 1 && (
                                <>
                                    {ni > 0 && <Divider />}
                                    <Box sx={{ bgcolor: '#fafafa', px: 2, py: 0.75, borderBottom: '1px solid #f0f0f0' }}>
                                        <NameSubHeader name={ng.displayName} count={ng.totalItems} />
                                    </Box>
                                </>
                            )}
                            {ng.submissions.length === 1 ? (
                                <Box sx={{ p: 1 }}>
                                    {ng.submissions[0].map((donation) => (
                                        <NotificationDonationCard key={donation.id} donation={donation} />
                                    ))}
                                    <Button
                                        className={styles['notification-card--container--btn']}
                                        variant="contained"
                                        component={Link}
                                        href={`/accept/${ng.submissions[0][0].bulkCollection}`}
                                    >
                                        Review
                                    </Button>
                                </Box>
                            ) : (
                                ng.submissions.map((submission, si) => (
                                    <Box key={si}>
                                        {si > 0 && <Divider />}
                                        <Box
                                            sx={{
                                                bgcolor: '#fafafa',
                                                px: 2,
                                                py: 0.5,
                                                borderBottom: '1px solid #f0f0f0',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Typography variant="caption" color="text.secondary">
                                                Submission {si + 1} — {itemCount(submission.length)}
                                            </Typography>
                                            <Button size="small" variant="contained" component={Link} href={`/accept/${submission[0].bulkCollection}`}>
                                                Review
                                            </Button>
                                        </Box>
                                        <Box sx={{ p: 1 }}>
                                            {submission.map((donation) => (
                                                <NotificationDonationCard key={donation.id} donation={donation} />
                                            ))}
                                        </Box>
                                    </Box>
                                ))
                            )}
                        </Box>
                    ))}
                </Paper>
            ))}
        </>
    );
}
