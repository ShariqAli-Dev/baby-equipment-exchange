/**
 * @jest-environment node
 */
import { groupByDonor, groupByRequestor, deriveNotificationView, parseNotificationTab } from './notifications-grouping';
import type { DonationDTO } from '@/server/donations';
import type { OrderDTO } from '@/server/orders';
import type { UserDTO } from '@/server/users';

// Minimal DTO factories — only the fields the grouping logic reads.
function donation(overrides: Partial<DonationDTO>): DonationDTO {
    return {
        id: 'd',
        donorEmail: null,
        donorName: null,
        donorId: null,
        category: null,
        brand: null,
        model: null,
        description: null,
        tagNumber: null,
        notes: null,
        status: 'in processing',
        bulkCollection: null,
        images: [],
        createdAt: null,
        modifiedAt: null,
        dateAccepted: null,
        dateReceived: null,
        dateRequested: null,
        dateDistributed: null,
        requestor: null,
        distributor: null,
        daysInStorage: null,
        ...overrides
    };
}

function order(overrides: Partial<OrderDTO>): OrderDTO {
    return {
        id: 'o',
        status: 'open',
        requestor: { id: 'r', name: 'Requestor', email: 'r@example.com' },
        items: [],
        rejectedItems: [],
        createdAt: null,
        modifiedAt: null,
        ...overrides
    };
}

function user(overrides: Partial<UserDTO>): UserDTO {
    return {
        uid: 'u',
        email: null,
        displayName: null,
        customClaims: null,
        isDisabled: true,
        isDeleted: null,
        phoneNumber: null,
        requestedItems: null,
        distributedItems: null,
        notes: null,
        organization: null,
        title: null,
        termsAccepted: null,
        createdAt: null,
        modifiedAt: null,
        ...overrides
    };
}

describe('parseNotificationTab', () => {
    it('accepts valid tab keys', () => {
        expect(parseNotificationTab('pending-users')).toBe('pending-users');
    });
    it('falls back to the default for unknown/undefined', () => {
        expect(parseNotificationTab(undefined)).toBe('pending-approval');
        expect(parseNotificationTab('bogus')).toBe('pending-approval');
    });
});

describe('groupByDonor', () => {
    it('groups by email, then name, then bulk submission', () => {
        const donations = [
            donation({ id: 'a', donorEmail: 'JANE@x.com', donorName: 'Jane Doe', bulkCollection: 'bulk1' }),
            donation({ id: 'b', donorEmail: 'jane@x.com', donorName: 'Jane Doe', bulkCollection: 'bulk1' }),
            donation({ id: 'c', donorEmail: 'jane@x.com', donorName: 'Jane Doe', bulkCollection: 'bulk2' })
        ];
        const groups = groupByDonor(donations);
        expect(groups).toHaveLength(1);
        expect(groups[0].totalItems).toBe(3);
        expect(groups[0].nameGroups).toHaveLength(1);
        // Two distinct bulk submissions under the one name.
        expect(groups[0].nameGroups[0].submissions).toHaveLength(2);
        expect(groups[0].nameGroups[0].submissions.flat().map((d) => d.id).sort()).toEqual(['a', 'b', 'c']);
    });

    it('title-cases the display name and sorts groups by name', () => {
        const groups = groupByDonor([
            donation({ id: 'z', donorEmail: 'zed@x.com', donorName: 'zed zebra', bulkCollection: 'b' }),
            donation({ id: 'a', donorEmail: 'amy@x.com', donorName: 'amy apple', bulkCollection: 'b' })
        ]);
        expect(groups.map((g) => g.nameGroups[0].displayName)).toEqual(['Amy Apple', 'Zed Zebra']);
    });

    it('keys donors with no email by name so they are not merged together', () => {
        const groups = groupByDonor([
            donation({ id: 'a', donorEmail: '', donorName: 'Anon One', bulkCollection: 'b' }),
            donation({ id: 'b', donorEmail: '', donorName: 'Anon Two', bulkCollection: 'b' })
        ]);
        expect(groups).toHaveLength(2);
    });
});

describe('groupByRequestor', () => {
    it('groups orders by requestor id and totals items', () => {
        const groups = groupByRequestor([
            order({ id: 'o1', requestor: { id: 'r1', name: 'Bob', email: 'b@x.com' }, items: [donation({ id: 'i1' })] }),
            order({ id: 'o2', requestor: { id: 'r1', name: 'Bob', email: 'b@x.com' }, items: [donation({ id: 'i2' }), donation({ id: 'i3' })] })
        ]);
        expect(groups).toHaveLength(1);
        expect(groups[0].orders).toHaveLength(2);
        expect(groups[0].totalItems).toBe(3);
    });
});

describe('deriveNotificationView', () => {
    const data = {
        donations: [
            donation({ id: 'p1', status: 'in processing', donorEmail: 'a@x.com', donorName: 'Ann', bulkCollection: 'b1', brand: 'Graco' }),
            donation({ id: 'd1', status: 'pending delivery', donorEmail: 'a@x.com', donorName: 'Ann', bulkCollection: 'b1' }),
            donation({ id: 'r1', status: 'reserved', donorEmail: 'a@x.com', donorName: 'Ann', bulkCollection: 'b1' })
        ],
        orders: [order({ id: 'o1', requestor: { id: 'r1', name: 'Bob', email: 'b@x.com' }, items: [donation({ id: 'i1' })] })],
        users: [
            user({ uid: 'u1', displayName: 'Pending Pat', email: 'pat@x.com' }),
            user({ uid: 'u2', displayName: 'Deleted Dan', email: 'dan@x.com', isDeleted: true })
        ]
    };

    it('partitions donations by status and counts each tab', () => {
        const view = deriveNotificationView(data, '');
        expect(view.hasAny).toBe(true);
        expect(view.counts).toEqual({
            'pending-approval': 1,
            'pending-delivery': 1,
            requested: 1,
            'pending-pickup': 1,
            'pending-users': 1 // deleted user excluded
        });
    });

    it('excludes deleted users from the pending-users tab', () => {
        const view = deriveNotificationView(data, '');
        expect(view.pendingUsers.map((u) => u.uid)).toEqual(['u1']);
    });

    it('applies the search query across every tab', () => {
        const view = deriveNotificationView(data, 'graco');
        expect(view.counts['pending-approval']).toBe(1);
        expect(view.counts['pending-delivery']).toBe(0);
        expect(view.counts.requested).toBe(0);
        expect(view.counts['pending-users']).toBe(0);
    });

    it('reports hasAny=false only when all raw collections are empty', () => {
        const empty = deriveNotificationView({ donations: [], orders: [], users: [] }, '');
        expect(empty.hasAny).toBe(false);
    });
});
