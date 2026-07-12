import { PendingDonationsProvider } from '@/contexts/PendingDonationsContext';

// Scopes the localStorage-backed donation-draft context to the two donate flows
// (it used to wrap the whole app from the root layout).
export default function DonateLayout({ children }: { children: React.ReactNode }) {
    return <PendingDonationsProvider>{children}</PendingDonationsProvider>;
}
