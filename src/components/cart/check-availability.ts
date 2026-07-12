'use client';

import { areDonationsAvailableAction } from '@/server/actions/donations';
import { InventoryItem } from '@/models/inventoryItem';

// Pre-submit availability check shared by both carts: returns a user-facing
// message naming the items that are no longer available, or null when the
// whole cart is still requestable.
export async function checkUnavailableItems(requestedInventory: InventoryItem[]): Promise<string | null> {
    const requestedItemIds = requestedInventory.map((item) => item.id);
    const unavailableItemIds = await areDonationsAvailableAction(requestedItemIds);
    if (unavailableItemIds.length === 0) return null;

    const unavailableItems = requestedInventory.filter((item) => unavailableItemIds.includes(item.id));
    let message = 'The following items are no longer available: ';
    unavailableItems.forEach((item, i) => {
        message += i < unavailableItems.length - 1 ? `"${item.brand} ${item.model}," ` : `"${item.brand} ${item.model}." `;
    });
    message += 'Please remove them from your cart and try again.';
    return message;
}
