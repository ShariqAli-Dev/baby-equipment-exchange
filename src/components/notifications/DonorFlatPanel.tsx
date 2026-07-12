// Shared server panel for the pending-delivery and pending-pickup tabs: donor →
// name grouping with submissions flattened (no per-submission Review), one card
// per donation. The two tabs differ only in the card component + empty message,
// passed in by the caller.
import { Box, Divider, Paper } from '@mui/material';
import EmptyTabMessage from './EmptyTabMessage';
import { DonorHeader, NameSubHeader } from './group-headers';
import type { ComponentType } from 'react';
import type { DonorGroup } from '@/lib/notifications-grouping';
import type { DonationDTO } from '@/server/donations';

type DonorFlatPanelProps = {
    groups: DonorGroup[];
    query: string;
    emptyMessage: string;
    CardComponent: ComponentType<{ donation: DonationDTO }>;
};

export default function DonorFlatPanel({ groups, query, emptyMessage, CardComponent }: DonorFlatPanelProps) {
    if (groups.length === 0) return <EmptyTabMessage query={query} defaultMessage={emptyMessage} />;

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
                            <Box sx={{ p: 1 }}>
                                {ng.submissions.flat().map((donation) => (
                                    <CardComponent key={donation.id} donation={donation} />
                                ))}
                            </Box>
                        </Box>
                    ))}
                </Paper>
            ))}
        </>
    );
}
