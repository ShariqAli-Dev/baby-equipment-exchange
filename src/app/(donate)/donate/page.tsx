import type { Metadata } from 'next';
import { getAllCategories } from '@/server/categories';
import DonateClient from './DonateClient';

export const metadata: Metadata = { title: 'Donate' };
export const dynamic = 'force-dynamic'; // categories are admin-editable — fetch per request, not at build

export default async function DonatePage() {
    const categories = await getAllCategories();
    return <DonateClient categories={categories.map(({ name, active }) => ({ name, active }))} />;
}
