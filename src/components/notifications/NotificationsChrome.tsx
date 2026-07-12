'use client';

//Hooks
import { useFilterParams } from '@/lib/use-filter-params';
//Components
import { Chip, InputAdornment, Tab, Tabs, TextField } from '@mui/material';
//Icons
import SearchIcon from '@mui/icons-material/Search';
//Types
import type { ReactNode } from 'react';
import { NOTIFICATION_TABS, type NotificationTab } from '@/lib/notifications-grouping';

const TAB_LABELS: Record<NotificationTab, string> = {
    'pending-approval': 'Pending Approval',
    'pending-delivery': 'Pending Delivery',
    requested: 'Requested',
    'pending-pickup': 'Pending Pickup',
    'pending-users': 'Pending Users'
};

type NotificationsChromeProps = {
    activeTab: NotificationTab;
    counts: Record<NotificationTab, number>;
    query: string;
    children: ReactNode;
};

// Search box + tab bar for the notifications view. Both write to the URL
// (?q=, ?tab=) via useFilterParams, so the active tab and search survive
// refresh and are linkable. The active panel is passed in as children (a
// server component) and swaps on navigation.
export default function NotificationsChrome({ activeTab, counts, query, children }: NotificationsChromeProps) {
    const { setParam, setTextParam } = useFilterParams();
    const hasQuery = query.trim().length > 0;

    const tabLabel = (label: string, count: number) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {label}
            <Chip
                label={count}
                size="small"
                sx={{
                    bgcolor: hasQuery ? (count > 0 ? '#00695c' : '#cfd8d6') : count > 0 ? '#d32f2f' : '#bdbdbd',
                    color: hasQuery && count === 0 ? '#7d8a86' : 'white',
                    fontWeight: 600,
                    height: 20,
                    minWidth: 20,
                    '& .MuiChip-label': { px: 0.75 }
                }}
            />
        </span>
    );

    return (
        <>
            <TextField
                fullWidth
                id="notifications-search"
                label="Search"
                placeholder="Search all notifications — tag, brand, donor, requestor"
                defaultValue={query}
                onChange={(event: React.ChangeEvent<HTMLInputElement>): void => setTextParam('q', event.target.value)}
                sx={{ marginTop: '1rem' }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    )
                }}
            />
            <Tabs
                value={activeTab}
                onChange={(_, newValue) => setParam('tab', newValue)}
                aria-label="notifications"
                variant="scrollable"
                scrollButtons="auto"
                sx={{ marginTop: '1rem', marginBottom: '1rem' }}
            >
                {NOTIFICATION_TABS.map((tab) => (
                    <Tab key={tab} value={tab} label={tabLabel(TAB_LABELS[tab], counts[tab])} sx={{ color: 'black' }} />
                ))}
            </Tabs>
            {children}
        </>
    );
}
