'use client';

import { useMemo, useState } from 'react';
import { useUserContext } from '@/contexts/UserContext';
import { useRequestedInventoryContext } from '@/contexts/RequestedInventoryContext';
import { useRouter } from 'next/navigation';
import { Badge, Box, Button, IconButton, Paper, Snackbar, SnackbarCloseReason, Tooltip, Typography } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import InventoryItemCard from '@/components/InventoryItemCard';
import InventoryDetailsDialog from '@/components/InventoryDetailsDialog';
import { InventoryItem } from '@/models/inventoryItem';
import type { InventoryItemDTO } from '@/server/donations';
import '@/styles/globalStyles.css';

// The cart context (localStorage-backed) and the card/dialog leaves are all
// built around the InventoryItem model. Image fields are already download URLs
// (see src/server/images.ts), so a DTO → model rehydrate is a plain field copy.
function toInventoryItem(dto: InventoryItemDTO): InventoryItem {
    return new InventoryItem({
        id: dto.id,
        category: dto.category ?? '',
        brand: dto.brand ?? '',
        model: dto.model ?? '',
        description: dto.description,
        tagNumber: dto.tagNumber,
        status: dto.status,
        images: dto.images
    });
}

type InventoryViewProps = {
    items: InventoryItemDTO[];
};

// Client leaf for the server-fetched /inventory list. Search/category filtering
// lives in the URL (FilterBar) now; this component only owns the cart-add
// interaction and item-detail dialog.
export default function InventoryView({ items }: InventoryViewProps) {
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [isSnackBarOpen, setIsSnackBarOpen] = useState<boolean>(false);

    const { isAidWorker, isAdmin } = useUserContext();
    const { addRequestedInventoryItem, requestedInventory } = useRequestedInventoryContext();
    const router = useRouter();

    const inventoryToDisplay = useMemo(() => {
        const requestedInventoryIds = new Set(requestedInventory.map((i) => i.id));
        return items.filter((item) => !requestedInventoryIds.has(item.id)).map(toInventoryItem);
    }, [items, requestedInventory]);

    const handleCloseSnackBar = (_event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
        if (reason === 'clickaway') return;
        setIsSnackBarOpen(false);
    };

    const handleOpenCart = () => {
        if (isAdmin) {
            router.push('/admin-cart');
        } else if (isAidWorker) {
            router.push('/inventory-cart');
        }
    };

    const handleRequestInventoryItem = (inventoryItem: InventoryItem) => {
        addRequestedInventoryItem(inventoryItem);
        setIsSnackBarOpen(true);
    };

    const snackbarAction = (
        <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackBar}>
            <CloseIcon fontSize="small" />
        </IconButton>
    );

    return (
        <>
            <Paper variant="outlined" sx={{ padding: '2px', mb: 2 }}>
                <Typography variant="body1">
                    <b>DISCLAIMER: </b> ALL ITEMS ARE TRANSFERRED AS IS. THE EXCHANGE EXPRESSLY DISCLAIMS ALL OTHER WARRANTIES EXPRESS OR IMPLIED, INCLUDING BUT
                    NOT LIMITED TO ANY IMPLIED WARRANTY OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. Recipients of products from the Exchange should
                    inspect items and verify recall status prior to use.
                </Typography>
            </Paper>

            {requestedInventory.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Badge badgeContent={requestedInventory.length} color="primary">
                        <Tooltip title="View order">
                            <IconButton color="inherit" onClick={handleOpenCart}>
                                <ShoppingCartIcon />
                            </IconButton>
                        </Tooltip>
                    </Badge>
                </Box>
            )}

            {inventoryToDisplay.length === 0 ? (
                <p>No products found.</p>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)',
                            lg: 'repeat(4, 1fr)'
                        },
                        gap: 2
                    }}
                >
                    {inventoryToDisplay.map((inventoryItem: InventoryItem) => (
                        <InventoryItemCard
                            key={inventoryItem.id}
                            inventoryItem={inventoryItem}
                            onSelect={(item) => setSelectedItem(item)}
                            handleRequestInventoryItem={handleRequestInventoryItem}
                        />
                    ))}
                </Box>
            )}

            {requestedInventory.length > 0 && (
                <Button variant="contained" onClick={handleOpenCart} sx={{ mt: 2 }}>
                    Checkout
                </Button>
            )}

            <InventoryDetailsDialog
                open={selectedItem !== null}
                item={selectedItem}
                onClose={() => setSelectedItem(null)}
                handleRequestInventoryItem={handleRequestInventoryItem}
            />
            <Snackbar open={isSnackBarOpen} autoHideDuration={6000} onClose={handleCloseSnackBar} message="Item added to order" action={snackbarAction} />
        </>
    );
}
