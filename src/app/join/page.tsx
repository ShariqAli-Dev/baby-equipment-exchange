import type { Metadata } from 'next';

import JoinForm from './JoinForm';
import { getOrganizationNames } from '@/server/organizations';

export const metadata: Metadata = { title: 'Join' };

// Public page, but org names come from Firestore — skip build-time prerender.
export const dynamic = 'force-dynamic';

export default async function JoinPage() {
    const orgNamesAndIds = await getOrganizationNames();
    return <JoinForm orgNamesAndIds={orgNamesAndIds} />;
}
