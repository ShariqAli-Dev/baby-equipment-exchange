import type { Metadata } from 'next';

import CategoryFormClient from './CategoryFormClient';

export const metadata: Metadata = { title: 'Create category' };

export default function CreateCategoryPage() {
    return <CategoryFormClient />;
}
