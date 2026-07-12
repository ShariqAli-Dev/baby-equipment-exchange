'use client';

//Hooks
import { useRequestedInventoryContext } from '@/contexts/RequestedInventoryContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
//Components
import { Button, Autocomplete, TextField } from '@mui/material';
import CartView from '@/components/cart/CartView';
import CustomDialog from '@/components/CustomDialog';
//Libs
import { adminRequestInventoryItemsAction } from '@/server/actions/donations';
import { checkUnavailableItems } from '@/components/cart/check-availability';
import { addErrorEvent } from '@/api/firebase';
//Styles
import '@/styles/globalStyles.css';
import styles from '@/components/cart/InventoryCart.module.css';
//Types
import type { UserDTO } from '@/server/users';

type AdminCartViewProps = {
    // Requestor candidates, server-provided by the page.
    activeUsers: UserDTO[];
};

const AdminCartView = (props: AdminCartViewProps) => {
    const { activeUsers } = props;
    const { requestedInventory, removeRequestedInventoryItem, isLoading, clearRequestedInventory } = useRequestedInventoryContext();

    const [loading, setLoading] = useState<boolean>(false);
    const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState<boolean>(false);
    const [isUnavailableDialogOpen, setIsUnavailableDialogOpen] = useState<boolean>(false);
    const [unavailableDialogContent, setUnavailableDialogContent] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
    const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

    const router = useRouter();

    const handleSuccessDialogClose = () => {
        setIsSuccessDialogOpen(false);
        // The scheduler is a real route now — no showScheduler state.
        if (createdOrderId) router.push(`/review-order/${createdOrderId}/schedule`);
    };

    const handleUnavailableDialogClose = () => {
        setUnavailableDialogContent('');
        setIsUnavailableDialogOpen(false);
    };

    const handleAdminRequestItems = async (): Promise<void> => {
        if (!selectedUser) return;
        setLoading(true);
        try {
            //Make sure requested items are still available
            const unavailableMessage = await checkUnavailableItems(requestedInventory);
            if (unavailableMessage) {
                setUnavailableDialogContent(unavailableMessage);
                setIsUnavailableDialogOpen(true);
                return;
            }

            const requestorInfo = {
                id: selectedUser.uid,
                name: selectedUser.displayName ?? '',
                email: selectedUser.email ?? ''
            };

            const order = await adminRequestInventoryItemsAction(
                requestedInventory.map((item) => item.id),
                requestorInfo
            );
            setCreatedOrderId(order.id);
            clearRequestedInventory();
            localStorage.removeItem('requestedInventory');
            setIsSuccessDialogOpen(true);
        } catch (error) {
            addErrorEvent('Handle request items', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <CartView items={requestedInventory} isLoading={loading || isLoading} onRemove={removeRequestedInventoryItem}>
                <Autocomplete
                    sx={{ marginTop: '2em', maxWidth: { sm: '88%', xs: '80%' } }}
                    value={selectedUser}
                    onChange={(event, newValue: UserDTO | null) => setSelectedUser(newValue)}
                    id="requestor-select"
                    options={activeUsers}
                    getOptionLabel={(user) => `${user.displayName} (${user.email})`}
                    isOptionEqualToValue={(option, value) => option.uid === value.uid}
                    renderInput={(params) => <TextField {...params} label="Requestor" />}
                />

                <div className={styles['btn--group']}>
                    <Button variant="outlined" onClick={() => router.push('/')}>
                        Continue browsing
                    </Button>
                    <Button variant="contained" disabled={!selectedUser} onClick={handleAdminRequestItems}>
                        Request Items
                    </Button>
                </div>
            </CartView>

            <CustomDialog
                isOpen={isUnavailableDialogOpen}
                onClose={handleUnavailableDialogClose}
                title="Item(s) no longer available."
                content={unavailableDialogContent}
            />

            <CustomDialog
                isOpen={isSuccessDialogOpen}
                onClose={handleSuccessDialogClose}
                title="Your request has been submitted."
                content="Your requested items have been submitted. Click OK to send a pickup email."
            />
        </>
    );
};

export default AdminCartView;
