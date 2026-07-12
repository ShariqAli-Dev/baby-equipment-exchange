import type { Metadata } from 'next';

import ListPageShell from '@/components/ListPageShell';
import FilterBar from '@/components/FilterBar';
import CategoriesList from './CategoriesList';
import NewCategoryButton from './NewCategoryButton';
import { getAllCategories } from '@/server/categories';
import { parseStringParam, type SearchParamValue } from '@/lib/search-params';

export const metadata: Metadata = { title: 'Categories' };

type CategoriesPageProps = {
    searchParams: Record<string, SearchParamValue>;
};

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
    const q = parseStringParam(searchParams.q).toLowerCase();

    let categories = await getAllCategories();
    if (q) {
        categories = categories.filter((category) =>
            [category.name, category.description, category.tagPrefix].some((value) => String(value ?? '').toLowerCase().includes(q))
        );
    }

    return (
        <ListPageShell
            title="Categories"
            actions={<NewCategoryButton />}
            filterBar={<FilterBar searchPlaceholder="Search by name, description, or tag prefix" />}
        >
            {categories.length === 0 ? (
                <p>No categories found</p>
            ) : (
                <CategoriesList categories={categories.map(({ id, name, active }) => ({ id, name, active }))} />
            )}
        </ListPageShell>
    );
}
