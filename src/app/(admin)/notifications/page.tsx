import type { Metadata } from 'next';
import { Typography } from '@mui/material';

import { getNotificationsData } from '@/server/notifications';
import { deriveNotificationView, parseNotificationTab } from '@/lib/notifications-grouping';
import { parseStringParam, type SearchParamValue } from '@/lib/search-params';

import NotificationsChrome from '@/components/notifications/NotificationsChrome';
import PendingApprovalPanel from '@/components/notifications/PendingApprovalPanel';
import DonorFlatPanel from '@/components/notifications/DonorFlatPanel';
import RequestedPanel from '@/components/notifications/RequestedPanel';
import PendingUsersPanel from '@/components/notifications/PendingUsersPanel';
import PendingDeliveryCard from '@/components/notifications/PendingDeliveryCard';
import ReservedCard from '@/components/notifications/ReservedCard';

export const metadata: Metadata = { title: 'Notifications' };

type NotificationsPageProps = {
    searchParams: Record<string, SearchParamValue>;
};

// Server-rendered admin notifications feed (replaces the client-fetch
// Notifications god component + its useState tab/search/drill-down lattice).
// The (admin) layout gates the admin claim; the data reads enforce it again.
// ?tab= selects the panel, ?q= filters every tab — both live in the URL.
export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
    const query = parseStringParam(searchParams.q);
    const activeTab = parseNotificationTab(parseStringParam(searchParams.tab) || undefined);

    const data = await getNotificationsData();
    const view = deriveNotificationView(data, query);

    if (!view.hasAny) {
        return (
            <Typography sx={{ marginTop: '1rem' }} variant="body1">
                No new notifications at this time.
            </Typography>
        );
    }

    const panels: Record<typeof activeTab, React.ReactNode> = {
        'pending-approval': <PendingApprovalPanel groups={view.approvalGroups} query={query} />,
        'pending-delivery': (
            <DonorFlatPanel groups={view.deliveryGroups} query={query} emptyMessage="No donations pending delivery." CardComponent={PendingDeliveryCard} />
        ),
        requested: <RequestedPanel groups={view.requestorGroups} query={query} />,
        'pending-pickup': <DonorFlatPanel groups={view.pickupGroups} query={query} emptyMessage="No donations pending pickup." CardComponent={ReservedCard} />,
        'pending-users': <PendingUsersPanel users={view.pendingUsers} query={query} />
    };

    return (
        <NotificationsChrome activeTab={activeTab} counts={view.counts} query={query}>
            {panels[activeTab]}
        </NotificationsChrome>
    );
}
