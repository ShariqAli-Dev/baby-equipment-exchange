'use client';

//Hooks
import { useRequestedInventoryContext } from '@/contexts/RequestedInventoryContext';
import { useUserContext } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
//Components
import { Button } from '@mui/material';
import CartView from '@/components/cart/CartView';
import CustomDialog from '@/components/CustomDialog';
//Libs
import { requestInventoryItemsAction } from '@/server/actions/donations';
import { checkUnavailableItems } from '@/components/cart/check-availability';
import { addErrorEvent } from '@/api/firebase';
//Styles
import '@/styles/globalStyles.css';
import styles from '@/components/cart/InventoryCart.module.css';

const InventoryCartView = () => {
    const { requestedInventory, removeRequestedInventoryItem, isLoading, clearRequestedInventory } = useRequestedInventoryContext();

    const [loading, setLoading] = useState<boolean>(false);
    const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState<boolean>(false);
    const [isUnavailableDialogOpen, setIsUnavailableDialogOpen] = useState<boolean>(false);
    const [unavailableDialogContent, setUnavailableDialogContent] = useState<string>('');

    const router = useRouter();
    const { currentUser } = useUserContext();

    const handleSuccessDialogClose = () => {
        setIsSuccessDialogOpen(false);
        router.push('/');
    };

    const handleUnavailableDialogClose = () => {
        setUnavailableDialogContent('');
        setIsUnavailableDialogOpen(false);
    };

    const handleRequestItems = async (): Promise<void> => {
        if (!requestedInventory || requestedInventory.length == 0 || !currentUser) return;
        setLoading(true);
        try {
            //Make sure requested items are still available
            const unavailableMessage = await checkUnavailableItems(requestedInventory);
            if (unavailableMessage) {
                setUnavailableDialogContent(unavailableMessage);
                setIsUnavailableDialogOpen(true);
                return;
            }

            const user = {
                id: currentUser.uid,
                name: currentUser.displayName ?? '',
                email: currentUser.email ?? ''
            };

            await requestInventoryItemsAction(
                requestedInventory.map((item) => item.id),
                user
            );
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
                <div className={styles['btn--group']}>
                    <Button variant="outlined" onClick={() => router.push('/')}>
                        Continue browsing
                    </Button>
                    <Button variant="contained" onClick={handleRequestItems}>
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
                content="Your requested items have been submitted. You will receive an email with next steps once your order has been processed."
            />
        </>
    );
};

export default InventoryCartView;
