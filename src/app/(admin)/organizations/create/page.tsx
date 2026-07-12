import type { Metadata } from 'next';

import OrganizationFormClient from './OrganizationFormClient';

export const metadata: Metadata = { title: 'Create organization' };

export default function CreateOrganizationPage() {
    return <OrganizationFormClient />;
}
