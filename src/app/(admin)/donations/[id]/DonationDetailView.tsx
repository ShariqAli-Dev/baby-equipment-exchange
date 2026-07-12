'use client';

//Hooks
import { MouseEventHandler, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
//Api
import { addErrorEvent } from '@/api/firebase';
import { productLifeCycleReportFromDTO } from '@/api/firebase-reports';
import { updateDonationAction, updateDonationStatusAction } from '@/server/actions/donations';
//Components
import { Dialog, DialogActions, ImageList, ImageListItem, Button, Divider, IconButton, Typography, Stack } from '@mui/material';
import Loader from '@/components/Loader';
import CustomDialog from '@/components/CustomDialog';
//Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
//Styles
import '@/styles/globalStyles.css';
//Types
import { getStatusChipProps } from '@/utils/statusChipProps';
import type { DonationDTO } from '@/server/donations';

const toDateString = (iso: string | null): string | null => (iso ? new Date(iso).toDateString() : null);

export default function DonationDetailView({ donation }: { donation: DonationDTO }) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
    const [openImageURL, setOpenImageURL] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [dialogContent, setDialogContent] = useState<string>('');
    const router = useRouter();

    const removeFromInventory = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await updateDonationStatusAction(donation.id, 'unavailable');
            setDialogContent(`'${donation.brand} - ${donation.model}' has been removed from inventory.`);
            setIsDialogOpen(true);
        } catch (error) {
            addErrorEvent('Error removing donation from inventory', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const addToInventory = async (): Promise<void> => {
        setIsLoading(true);
        try {
            // Mirrors the old addToInventory: a plain status update (no dateReceived stamp).
            await updateDonationAction(donation.id, { status: 'available' });
            setDialogContent(`'${donation.brand} - ${donation.model}' has been added to inventory.`);
            setIsDialogOpen(true);
        } catch (error) {
            addErrorEvent('Error adding donation to inventory', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = (): void => {
        setDialogContent('');
        setIsDialogOpen(false);
        router.refresh(); // action already revalidated; re-render with fresh data
    };

    const handleImageClick: MouseEventHandler<HTMLImageElement> = (event) => {
        setOpenImageURL(event.currentTarget.src);
        setIsImageOpen(true);
    };

    const handleImageClose = () => setIsImageOpen(false);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="page--header">
            <h3>Donation Details</h3>
            <IconButton component={Link} href="/donations" aria-label="Back to donations">
                <ArrowBackIcon />
            </IconButton>

            <div className="content--container">
                <ImageList>
                    {donation.images.map((image) => (
                        <ImageListItem key={image}>
                            <img src={`${image}`} alt={donation.model ?? 'donation'} loading="lazy" onClick={handleImageClick} />
                        </ImageListItem>
                    ))}
                </ImageList>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ marginBottom: '1em' }}>
                    <Button variant="contained" startIcon={<EditIcon />} component={Link} href={`/donations/${donation.id}/edit`}>
                        Edit Donation
                    </Button>
                    <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => productLifeCycleReportFromDTO(donation)}>
                        Lifecycle Report
                    </Button>
                    {donation.status === 'available' && (
                        <Button variant="contained" startIcon={<RemoveCircleOutlineIcon />} color="error" onClick={removeFromInventory}>
                            Remove from inventory
                        </Button>
                    )}

                    {donation.status === 'unavailable' && (
                        <Button variant="contained" startIcon={<AddIcon />} color="error" onClick={addToInventory}>
                            Add to inventory
                        </Button>
                    )}
                </Stack>

                <Divider sx={{ marginBottom: '1em' }}></Divider>
                <Typography variant="h5">
                    {donation.brand} - {donation.model}
                </Typography>
                {donation.status !== 'rejected' && <Typography variant="h6">{donation.tagNumber ?? 'No tag number'}</Typography>}
                <Typography variant="body1">
                    <b>Status: </b>
                    {getStatusChipProps(donation.status).label}
                </Typography>
                {(donation.status === 'available' || donation.status === 'unavailable') && donation.daysInStorage !== null && (
                    <Typography variant="body1">
                        <b>Days in storage: </b>
                        {donation.daysInStorage}
                    </Typography>
                )}

                <Typography variant="body1" sx={{ marginTop: '1em' }}>
                    <b>Category: </b> {donation.category}
                </Typography>

                <Typography variant="body1">
                    <b>Description: </b>
                    {donation.description}
                </Typography>
                {donation.dateAccepted && (
                    <Typography variant="body1">
                        <b>Accepted on: </b>
                        {toDateString(donation.dateAccepted)}
                    </Typography>
                )}
                {((donation.donorEmail ?? '').length > 0 || (donation.donorName ?? '').length > 0) && (
                    <Typography variant="body1">
                        <b>Donated by: </b>
                        {donation.donorName} ({donation.donorEmail})
                    </Typography>
                )}

                {donation.dateReceived && (
                    <Typography variant="body1">
                        <b>Received on: </b>
                        {toDateString(donation.dateReceived)}
                    </Typography>
                )}
                {donation.requestor && (
                    <Typography variant="body1">
                        <b>Requested by: </b>
                        {donation.requestor.name}
                    </Typography>
                )}
                {donation.dateRequested && (
                    <Typography variant="body1">
                        <b>Requested on: </b>
                        {toDateString(donation.dateRequested)}
                    </Typography>
                )}
                {donation.distributor && (
                    <Typography variant="body1">
                        <b>Distributed by: </b>
                        {donation.distributor.name} ({donation.distributor.email})
                    </Typography>
                )}
                {donation.dateDistributed && (
                    <Typography variant="body1">
                        <b>Date distributed: </b>
                        {toDateString(donation.dateDistributed)}
                    </Typography>
                )}
                <Dialog open={isImageOpen} onClose={handleImageClose} sx={{ width: '100%' }}>
                    <img src={openImageURL} alt={openImageURL} style={{ maxWidth: '100%' }} />
                    <DialogActions>
                        <Button type="button" onClick={handleImageClose}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
                <CustomDialog isOpen={isDialogOpen} title="Donation updated" content={dialogContent} onClose={handleClose} />
            </div>
        </div>
    );
}
