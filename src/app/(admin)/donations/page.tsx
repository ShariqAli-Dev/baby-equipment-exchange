import type { Metadata } from 'next';

import ListPageShell from '@/components/ListPageShell';
import FilterBar, { FilterDef } from '@/components/FilterBar';
import DonationsGrid from './DonationsGrid';
import NewDonationButton from './NewDonationButton';
import { getDonationsForAdmin } from '@/server/donations';
import { getAllCategories } from '@/server/categories';
import { parseListParam, parseStringParam, type SearchParamValue } from '@/lib/search-params';
import { donationStatuses } from '@/models/donation';
import { toDonationCardData } from './card-data';

export const metadata: Metadata = { title: 'Donations' };

type DonationsPageProps = {
    searchParams: Record<string, SearchParamValue>;
};

export default async function DonationsPage({ searchParams }: DonationsPageProps) {
    const q = parseStringParam(searchParams.q);
    const category = parseListParam(searchParams.category);
    const status = parseListParam(searchParams.status);

    const [donations, categories] = await Promise.all([
        getDonationsForAdmin({
            q: q || undefined,
            category: category.length > 0 ? category : undefined,
            status: status.length > 0 ? status : undefined
        }),
        getAllCategories()
    ]);

    const filters: FilterDef[] = [
        {
            key: 'category',
            label: 'Category',
            options: categories.map((c) => ({ value: c.name, label: c.name }))
        },
        {
            key: 'status',
            label: 'Status',
            options: Object.entries(donationStatuses).map(([label, value]) => ({ value, label }))
        }
    ];

    return (
        <ListPageShell
            title="Donations"
            actions={<NewDonationButton />}
            filterBar={<FilterBar searchPlaceholder="Search by tag, donor, brand, model, or category" filters={filters} />}
        >
            {donations.length === 0 ? <p>No donations found.</p> : <DonationsGrid donations={donations.map(toDonationCardData)} />}
        </ListPageShell>
    );
}
