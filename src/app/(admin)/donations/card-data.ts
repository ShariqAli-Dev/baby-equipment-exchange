import type { DonationDTO } from '@/server/donations';
import type { DonationCardData } from '@/components/DonationCard';

// Fixed locale so the server-rendered label matches client hydration.
export function formatCardDate(iso: string | null): string | null {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function toDonationCardData(donation: DonationDTO): DonationCardData {
    return {
        id: donation.id,
        brand: donation.brand,
        model: donation.model,
        category: donation.category,
        tagNumber: donation.tagNumber,
        status: donation.status,
        donorEmail: donation.donorEmail,
        images: donation.images,
        dateLabel: formatCardDate(donation.dateAccepted ?? donation.createdAt)
    };
}
