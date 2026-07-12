import { PendingDonationsProvider } from '@/contexts/PendingDonationsContext';

// admin-donate lives in the (admin) group for role gating; it still needs the
// localStorage-backed draft context that the (donate) group provides for /donate.
export default function AdminDonateLayout({ children }: { children: React.ReactNode }) {
    return <PendingDonationsProvider>{children}</PendingDonationsProvider>;
}
