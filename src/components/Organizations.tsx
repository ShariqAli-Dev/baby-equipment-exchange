'use client';

// INTERIM: only the admin Dashboard (deleted in the home/dashboard vertical) still
// renders this. The canonical organizations list is the server page at
// /organizations; rows navigate to /organizations/[id] and "Create new" links to
// /organizations/create instead of the in-place detail/form state switches.

//Hooks
import { Dispatch, SetStateAction } from 'react';
//Components
import Link from 'next/link';
import { Button, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
//Styles
import '@/styles/globalStyles.css';

type OrganizationsProps = {
    orgNamesAndIds: { [key: string]: string };
    // Still passed by the Dashboard (dies in the home/dashboard vertical); unused
    // here since mutations happen on the canonical /organizations routes now.
    setOrgsUpdated?: Dispatch<SetStateAction<boolean>>;
    handleRefresh?: () => void;
};

const Organizations = (props: OrganizationsProps) => {
    const { orgNamesAndIds } = props;

    const orgNames = Object.keys(orgNamesAndIds);

    return (
        <>
            <div className="page--header">
                <Typography variant="h5">Organizations</Typography>
            </div>
            <Button variant="contained" component={Link} href="/organizations/create">
                Create new
            </Button>

            <div className="content--container">
                <List>
                    {orgNames.map((org) => (
                        <ListItem key={org}>
                            <ListItemButton component={Link} href={`/organizations/${orgNamesAndIds[org]}`}>
                                <ListItemText primary={org} sx={{ color: 'black' }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </div>
        </>
    );
};

export default Organizations;
