import type { Metadata } from 'next';
import { getAllCategories } from '@/server/categories';
import AdminDonateClient from './AdminDonateClient';

export const metadata: Metadata = { title: 'Create donation' };
export const dynamic = 'force-dynamic'; // categories are admin-editable — fetch per request, not at build

export default async function AdminDonatePage() {
    const categories = await getAllCategories();
    return <AdminDonateClient categories={categories.map(({ name, active }) => ({ name, active }))} />;
}
