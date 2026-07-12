// Pure, framework-free grouping + matching logic for the admin notifications
// view. Extracted from the old Notifications.tsx god component so it can be
// unit-tested without Firebase/server-only in the way.
//
// (Plan V6 called for src/server/notifications.ts to hold these — but that
// module carries `import 'server-only'` and transitively pulls firebase-admin,
// which a jest unit test can't load. Same server/client-boundary split the plan
// already made for search-params.ts vs use-filter-params.ts: pure logic lives
// here, the server fetch lives in src/server/notifications.ts.)
//
// These operate on the serializable DTOs (type-only imports are erased, so this
// stays free of server-only at runtime).
import type { DonationDTO } from '@/server/donations';
import type { OrderDTO } from '@/server/orders';
import type { UserDTO } from '@/server/users';

// The five notification tabs — key is the ?tab= URL value.
export const NOTIFICATION_TABS = ['pending-approval', 'pending-delivery', 'requested', 'pending-pickup', 'pending-users'] as const;
export type NotificationTab = (typeof NOTIFICATION_TABS)[number];
export const DEFAULT_NOTIFICATION_TAB: NotificationTab = 'pending-approval';

export function parseNotificationTab(value: string | undefined): NotificationTab {
    return NOTIFICATION_TABS.includes(value as NotificationTab) ? (value as NotificationTab) : DEFAULT_NOTIFICATION_TAB;
}

export type DonorNameGroup = {
    displayName: string;
    submissions: DonationDTO[][];
    totalItems: number;
};

export type DonorGroup = {
    donorEmail: string;
    nameGroups: DonorNameGroup[];
    totalItems: number;
};

export type RequestorGroup = {
    requestorName: string;
    requestorId: string;
    orders: OrderDTO[];
    totalItems: number;
};

export const toTitleCase = (s: string) => s.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export const donationMatches = (d: DonationDTO, q: string): boolean =>
    [d.tagNumber, d.brand, d.model, d.category, d.donorName, d.donorEmail].some((v) => String(v ?? '').toLowerCase().includes(q));

export const orderMatches = (o: OrderDTO, q: string): boolean =>
    [o.requestor.name, o.requestor.email].some((v) => String(v ?? '').toLowerCase().includes(q)) || o.items.some((item) => donationMatches(item, q));

export const userMatches = (u: UserDTO, q: string): boolean =>
    [u.displayName, u.email, u.organization?.name].some((v) => String(v ?? '').toLowerCase().includes(q));

export const groupByDonor = (donations: DonationDTO[]): DonorGroup[] => {
    const emailMap = new Map<
        string,
        {
            rawEmail: string;
            names: Map<string, { displayName: string; bulks: Map<string, DonationDTO[]> }>;
        }
    >();

    for (const d of donations) {
        const normalizedEmail = (d.donorEmail ?? '').trim().toLowerCase();
        const emailKey = normalizedEmail || `name:${(d.donorName ?? '').trim().toLowerCase()}`;

        let emailGroup = emailMap.get(emailKey);
        if (!emailGroup) {
            emailGroup = { rawEmail: d.donorEmail ?? '', names: new Map() };
            emailMap.set(emailKey, emailGroup);
        }

        const nameKey = (d.donorName ?? '').trim().toLowerCase();
        let nameGroup = emailGroup.names.get(nameKey);
        if (!nameGroup) {
            nameGroup = { displayName: toTitleCase(d.donorName ?? '') || 'Unknown Donor', bulks: new Map() };
            emailGroup.names.set(nameKey, nameGroup);
        }

        const bulkKey = d.bulkCollection ?? '';
        let bulk = nameGroup.bulks.get(bulkKey);
        if (!bulk) {
            bulk = [];
            nameGroup.bulks.set(bulkKey, bulk);
        }
        bulk.push(d);
    }

    return Array.from(emailMap.values())
        .map(({ rawEmail, names }) => {
            const nameGroups = Array.from(names.values())
                .map(({ displayName, bulks }) => ({
                    displayName,
                    submissions: Array.from(bulks.values()),
                    totalItems: Array.from(bulks.values()).reduce((sum, b) => sum + b.length, 0)
                }))
                .sort((a, b) => a.displayName.localeCompare(b.displayName));

            return {
                donorEmail: rawEmail,
                nameGroups,
                totalItems: nameGroups.reduce((sum, ng) => sum + ng.totalItems, 0)
            };
        })
        .sort((a, b) => a.nameGroups[0].displayName.localeCompare(b.nameGroups[0].displayName));
};

export const groupByRequestor = (orders: OrderDTO[]): RequestorGroup[] => {
    const reqMap = new Map<string, { name: string; orders: OrderDTO[] }>();
    for (const o of orders) {
        let req = reqMap.get(o.requestor.id);
        if (!req) {
            req = { name: o.requestor.name, orders: [] };
            reqMap.set(o.requestor.id, req);
        }
        req.orders.push(o);
    }
    return Array.from(reqMap.entries())
        .map(([requestorId, { name, orders }]) => ({
            requestorId,
            requestorName: name,
            orders,
            totalItems: orders.reduce((sum, o) => sum + o.items.length, 0)
        }))
        .sort((a, b) => a.requestorName.localeCompare(b.requestorName));
};

// Raw multi-collection notification payload (server fetch result).
export type NotificationsData = {
    donations: DonationDTO[];
    orders: OrderDTO[];
    users: UserDTO[];
};

// Everything a rendered notifications view needs: per-tab grouped data, the
// live badge counts (post-search), and the raw totals used to decide the
// all-empty state. Search (`q`) filters every tab at once.
export type NotificationView = {
    hasAny: boolean;
    counts: Record<NotificationTab, number>;
    approvalGroups: DonorGroup[];
    deliveryGroups: DonorGroup[];
    pickupGroups: DonorGroup[];
    requestorGroups: RequestorGroup[];
    pendingUsers: UserDTO[];
};

export function deriveNotificationView(data: NotificationsData, rawQuery: string): NotificationView {
    const q = rawQuery.trim().toLowerCase();

    const byStatus = (status: DonationDTO['status']) =>
        data.donations.filter((d) => d.status === status).filter((d) => !q || donationMatches(d, q));

    const approval = byStatus('in processing');
    const delivery = byStatus('pending delivery');
    const pickup = byStatus('reserved');
    const orders = data.orders.filter((o) => !q || orderMatches(o, q));
    const pendingUsers = data.users.filter((u) => !u.isDeleted).filter((u) => !q || userMatches(u, q));

    return {
        // Mirrors the old all-empty guard: raw collection lengths, pre-search.
        hasAny: data.donations.length > 0 || data.orders.length > 0 || data.users.length > 0,
        counts: {
            'pending-approval': approval.length,
            'pending-delivery': delivery.length,
            requested: orders.length,
            'pending-pickup': pickup.length,
            'pending-users': pendingUsers.length
        },
        approvalGroups: groupByDonor(approval),
        deliveryGroups: groupByDonor(delivery),
        pickupGroups: groupByDonor(pickup),
        requestorGroups: groupByRequestor(orders),
        pendingUsers
    };
}
