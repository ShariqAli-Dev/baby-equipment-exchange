import type { Metadata } from 'next';

import ListPageShell from '@/components/ListPageShell';
import FilterBar, { FilterDef } from '@/components/FilterBar';
import InventoryView from './InventoryView';
import { getInventory } from '@/server/donations';
import { getAllCategories } from '@/server/categories';
import { parseListParam, parseStringParam, type SearchParamValue } from '@/lib/search-params';

export const metadata: Metadata = { title: 'Inventory' };

type InventoryPageProps = {
    searchParams: Record<string, SearchParamValue>;
};

// Canonical /inventory route (was only reachable as a Dashboard tab / home
// branch). Server-fetches available items; q/category live in the URL.
export default async function InventoryPage({ searchParams }: InventoryPageProps) {
    const q = parseStringParam(searchParams.q);
    const category = parseListParam(searchParams.category);

    const [inventory, categories] = await Promise.all([
        getInventory({
            q: q || undefined,
            category: category.length > 0 ? category : undefined
        }),
        getAllCategories()
    ]);

    const filters: FilterDef[] = [
        {
            key: 'category',
            label: 'Category',
            options: categories.map((c) => ({ value: c.name, label: c.name }))
        }
    ];

    return (
        <ListPageShell title="Inventory" filterBar={<FilterBar searchPlaceholder="Search by tag, brand, model, or category" filters={filters} />}>
            <InventoryView items={inventory} />
        </ListPageShell>
    );
}
