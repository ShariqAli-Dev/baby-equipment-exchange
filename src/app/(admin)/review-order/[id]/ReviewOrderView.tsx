'use client';

//Hooks
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
//Components
import { Button, IconButton } from '@mui/material';
import OrderItemCard from './OrderItemCard';
import CustomDialog from '@/components/CustomDialog';
//Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
//Api
import { addErrorEvent } from '@/api/firebase';
import { removeDonationFromOrderAction } from '@/server/actions/orders';
//Styles
import '@/styles/globalStyles.css';
//Types
import type { OrderDTO, OrderItemRejectionResolution } from '@/server/orders';
import type { UserDTO } from '@/server/users';

type ReviewOrderViewProps = {
    order: OrderDTO;
    activeUsers: UserDTO[];
};

const ReviewOrderView = (props: ReviewOrderViewProps) => {
    const { order, activeUsers } = props;
    const router = useRouter();

    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [dialogContent, setDialogContent] = useState<string>('');

    const handleRemoveFromOrder = async (donationId: string, resolution: OrderItemRejectionResolution): Promise<void> => {
        try {
            await removeDonationFromOrderAction(order.id, donationId, resolution);
            setDialogContent(
                resolution.action === 'available'
                    ? 'Donation returned to available inventory.'
                    : resolution.action === 'requested'
                      ? `Donation reassigned to ${resolution.requestor.name}.`
                      : 'Donation marked as unavailable.'
            );
        } catch (error) {
            addErrorEvent('Error removing donation from order', error);
            setDialogContent('Something went wrong. Please try again.');
        }
        setIsDialogOpen(true);
        router.refresh();
    };

    const handleClose = () => setIsDialogOpen(false);

    return (
        <>
            <div className="page--header">
                <h2>Review Order</h2>
                <IconButton onClick={() => router.back()} aria-label="Back">
                    <ArrowBackIcon />
                </IconButton>
            </div>
            <div className="content--container">
                <h3>
                    <b>Requested by:</b> {order.requestor.name} ({order.requestor.email})
                </h3>
                {order.items.length > 0 && (
                    <>
                        <h4>Items ready for pickup</h4>
                        {order.items.map((item) => (
                            <OrderItemCard key={item.id} donation={item} activeUsers={activeUsers} onRemove={handleRemoveFromOrder} />
                        ))}
                    </>
                )}
                {order.rejectedItems.length > 0 && (
                    <>
                        <h4>Rejected items</h4>
                        {order.rejectedItems.map((item) => (
                            <OrderItemCard key={item.id} donation={item} activeUsers={activeUsers} showRemoveButton={false} />
                        ))}
                    </>
                )}
                <Button variant="contained" component={Link} href={`/review-order/${order.id}/schedule`}>
                    {order.items.length > 0 ? 'Send Pickup Email' : 'Send Rejection Email'}
                </Button>
            </div>
            <CustomDialog isOpen={isDialogOpen} onClose={handleClose} title="Order Updated" content={dialogContent} />
        </>
    );
};

export default ReviewOrderView;
