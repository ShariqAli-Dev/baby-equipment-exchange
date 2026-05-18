'use client';

import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Typography,
    Box,
    Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { getStatusChipProps } from '@/utils/statusChipProps';
import { getInventoryItemById } from '@/api/firebase-donations';
import { addErrorEvent } from '@/api/firebase';
import Loader from './Loader';
import ImageGallery from './ImageGallery';
import { InventoryItem } from '@/models/inventoryItem';

type InventoryDetailsDialogProps = {
    open: boolean;
    item: InventoryItem | null;
    onClose: () => void;
    handleRequestInventoryItem: (item: InventoryItem) => void;
};

export default function InventoryDetailsDialog({ open, item, onClose, handleRequestInventoryItem }: InventoryDetailsDialogProps) {
    const [itemDetails, setItemDetails] = useState<InventoryItem | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open && item) {
            setItemDetails(item);
        }
    }, [open, item]);

    async function fetchItem(id: string) {
        setIsLoading(true);
        try {
            const fetched = await getInventoryItemById(id);
            setItemDetails(fetched);
        } catch (error) {
            addErrorEvent('Fetch inventory item by ID', error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (open && item && !item.images?.length) {
            fetchItem(item.id);
        }
    }, [open, item]);

    const handleAdd = () => {
        if (itemDetails && itemDetails.status === 'available') {
            handleRequestInventoryItem(itemDetails);
            onClose();
        }
    };

    if (!item) return null;

    const details = itemDetails || item;
    const statusChip = getStatusChipProps(details.status);
    const canRequest = details.status === 'available';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Item Details
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {isLoading && <Loader />}
                    {!isLoading && (
                        <>
                            <ImageGallery images={details.images as string[]} alt={details.model} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="h6">{details.brand} {details.model}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <b>Tag number:</b> {details.tagNumber ?? 'No tag'}
                                </Typography>
                                <Box>
                                    <Chip size="small" label={statusChip.label} sx={{ ...statusChip.sx, fontWeight: 600 }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    <b>Category:</b> {details.category}
                                </Typography>
                                {details.description && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>{details.description}</Typography>
                                )}
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={onClose}>Close</Button>
                    <Button
                        variant="contained"
                        startIcon={<AddShoppingCartIcon />}
                        onClick={handleAdd}
                        disabled={!canRequest}
                    >
                        Add to order
                    </Button>
                </DialogActions>
        </Dialog>
    );
}
