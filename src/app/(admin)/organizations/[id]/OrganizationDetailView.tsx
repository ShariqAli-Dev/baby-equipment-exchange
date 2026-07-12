'use client';

//Hooks
import { useState } from 'react';
import { useRouter } from 'next/navigation';
//Components
import Link from 'next/link';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from '@mui/material';
import Loader from '@/components/Loader';
import CustomDialog from '@/components/CustomDialog';
//Api
import { addErrorEvent } from '@/api/firebase';
import { deleteOrganizationAction } from '@/server/actions/organizations';
//icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
//Styles
import '@/styles/globalStyles.css';
//Types
import { orgTags, OrganizationTagKeys } from '@/models/organization';
import type { OrganizationDTO } from '@/server/organizations';

const tagNames: OrganizationTagKeys[] = Object.keys(orgTags) as OrganizationTagKeys[];

export default function OrganizationDetailView({ organization }: { organization: OrganizationDTO }) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const router = useRouter();

    const handleDeleteOrganization = async (): Promise<void> => {
        setShowDeleteDialog(false);
        setIsLoading(true);
        try {
            await deleteOrganizationAction(organization.id);
            setIsDialogOpen(true);
        } catch (error) {
            addErrorEvent('Error deleting organization', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsDialogOpen(false);
        // Action already revalidated /organizations; the deleted org is gone from the list.
        router.push('/organizations');
    };

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="page--header">
            <h3>Organization Details</h3>
            <IconButton component={Link} href="/organizations" aria-label="Back to organizations">
                <ArrowBackIcon />
            </IconButton>
            <div className="content--container">
                <h3>{organization.name}</h3>
                {organization.address && (
                    <div className="address">
                        <p>{organization.address.line_1}</p>
                        <p>{organization.address.line_2}</p>
                        <p>
                            {organization.address.city} {organization.address.state} {organization.address.zipcode}
                        </p>
                    </div>
                )}
                {organization.county && (
                    <p>
                        <b>County: </b>
                        {organization.county}
                    </p>
                )}
                {organization.phoneNumber && (
                    <p>
                        <b>Phone: </b>
                        {organization.phoneNumber}
                    </p>
                )}
                <p>
                    <b>Tags:</b>
                </p>

                <ul>
                    {organization.tags.map((tag) => (
                        <li key={tag}>{tagNames.find((tagname) => orgTags[tagname] === tag)}</li>
                    ))}
                </ul>

                {organization.notes.length > 0 && (
                    <>
                        <p>
                            <b>Notes:</b>
                        </p>
                        <ul>
                            {organization.notes.map((note, i) => (
                                <li key={i}>{note}</li>
                            ))}
                        </ul>
                    </>
                )}
                <Box display="flex" gap={2}>
                    <Button type="button" variant="contained" startIcon={<EditIcon />} component={Link} href={`/organizations/${organization.id}/edit`}>
                        Edit Organization
                    </Button>
                    <Button type="button" variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => setShowDeleteDialog(true)}>
                        Delete Organiztion
                    </Button>
                </Box>
                <Dialog open={showDeleteDialog} aria-labelledby="dialog-title" aria-describedby="dialog-description">
                    <DialogTitle id="dialog-title">Delete Organization</DialogTitle>
                    <DialogContent>
                        <DialogContentText>This will permanently delete the organization {organization.name}. Are you sure?</DialogContentText>
                        <DialogActions>
                            <Button variant="contained" onClick={handleDeleteOrganization}>
                                Confirm
                            </Button>
                            <Button variant="outlined" onClick={() => setShowDeleteDialog(false)}>
                                Cancel
                            </Button>
                        </DialogActions>
                    </DialogContent>
                </Dialog>
                {/* delete confirmation dialog */}
                <CustomDialog isOpen={isDialogOpen} onClose={handleClose} title={'Organization deleted.'} content={`${organization.name} has been deleted.`} />
            </div>
        </div>
    );
}
