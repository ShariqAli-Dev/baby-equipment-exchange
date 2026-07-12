// Presentational header renderers shared by the donor-grouped panels
// (approval / delivery / pickup). Server components — no interactivity, so they
// render on the server and keep client JS to the mutation cards only.
import { Typography } from '@mui/material';
import type { DonorGroup } from '@/lib/notifications-grouping';

export const itemCount = (n: number) => `${n} item${n !== 1 ? 's' : ''}`;

function EmailHeader({ email, count }: { email: string; count: number }) {
    return (
        <Typography variant="body2" fontWeight={600}>
            {email || 'No email'}
            <Typography component="span" variant="body2" color="text.secondary">
                {` — ${itemCount(count)}`}
            </Typography>
        </Typography>
    );
}

export function DonorHeader({ group }: { group: DonorGroup }) {
    if (group.nameGroups.length === 1) {
        return (
            <Typography variant="body2" fontWeight={600}>
                {group.nameGroups[0].displayName}
                <Typography component="span" variant="body2" color="text.secondary">
                    {group.donorEmail ? ` (${group.donorEmail})` : ''}
                    {` — ${itemCount(group.totalItems)}`}
                </Typography>
            </Typography>
        );
    }
    return <EmailHeader email={group.donorEmail} count={group.totalItems} />;
}

export function NameSubHeader({ name, count }: { name: string; count: number }) {
    return (
        <Typography variant="body2" fontWeight={500}>
            {name}
            <Typography component="span" variant="body2" color="text.secondary">
                {` — ${itemCount(count)}`}
            </Typography>
        </Typography>
    );
}
