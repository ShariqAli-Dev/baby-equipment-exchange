import type { Metadata } from 'next';

import InventoryCartView from './InventoryCartView';

export const metadata: Metadata = { title: 'Your cart' };

// The cart itself is localStorage-backed (RequestedInventoryContext), so the
// page has nothing to fetch — role gating happens in the (aid-worker) layout.
export default function InventoryCartPage() {
    return <InventoryCartView />;
}
