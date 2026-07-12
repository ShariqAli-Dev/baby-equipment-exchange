'use client';

import Link from 'next/link';
import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';

export type OrganizationListEntry = { id: string; name: string };

export default function OrganizationsList({ organizations }: { organizations: OrganizationListEntry[] }) {
    return (
        <div className="content--container">
            <List>
                {organizations.map((organization) => (
                    <ListItem key={organization.id}>
                        <ListItemButton component={Link} href={`/organizations/${organization.id}`}>
                            <ListItemText primary={organization.name} sx={{ color: 'black' }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    );
}
