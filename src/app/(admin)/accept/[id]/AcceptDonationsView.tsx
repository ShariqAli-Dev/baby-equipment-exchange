'use client';

//Hooks
import { useFilterParams } from '@/lib/use-filter-params';
import { buildQueryString } from '@/lib/search-params';
import Link from 'next/link';
//Components
import { Button } from '@mui/material';
import AcceptRejectItemCard from './AcceptRejectItemCard';
//Styles
import '@/styles/globalStyles.css';
//Types
import type { DonationDTO } from '@/server/donations';

type AcceptDonationsViewProps = {
    bulkId: string;
    donations: DonationDTO[];
};

type ButtonStatus = 'accepted' | 'rejected' | null;

const AcceptDonationsView = (props: AcceptDonationsViewProps) => {
    const { bulkId, donations } = props;
    const { getListParam, setParams } = useFilterParams();

    const accepted = getListParam('accepted');
    const rejected = getListParam('rejected');

    // Send is enabled only once every donation has a decision.
    const isDisabled = accepted.length + rejected.length !== donations.length;

    const handleAcceptReject = (value: ButtonStatus, id: string): void => {
        const nextAccepted = accepted.filter((item) => item !== id);
        const nextRejected = rejected.filter((item) => item !== id);
        if (value === 'accepted') nextAccepted.push(id);
        if (value === 'rejected') nextRejected.push(id);
        setParams({
            accepted: nextAccepted.length > 0 ? nextAccepted : null,
            rejected: nextRejected.length > 0 ? nextRejected : null
        });
    };

    return (
        <div style={{ marginTop: '4em' }}>
            <div className="page--header">
                <h3>Review donation</h3>
            </div>
            {donations.length === 0 && <p>No donations awaiting review in this collection.</p>}
            {donations.length > 0 && (
                <div>
                    {donations.length > 1 && <p>Several items are included in this donation.</p>}
                    {donations.map((donation) => (
                        <AcceptRejectItemCard
                            key={donation.id}
                            donation={donation}
                            status={accepted.includes(donation.id) ? 'accepted' : rejected.includes(donation.id) ? 'rejected' : null}
                            onChange={handleAcceptReject}
                        />
                    ))}
                    <Button
                        type="button"
                        variant="contained"
                        disabled={isDisabled}
                        component={Link}
                        href={`/accept/${bulkId}/schedule${buildQueryString({ accepted, rejected })}`}
                        aria-disabled={isDisabled}
                    >
                        {rejected.length > 0 ? 'Send Rejection Email' : 'Send Email'}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AcceptDonationsView;
