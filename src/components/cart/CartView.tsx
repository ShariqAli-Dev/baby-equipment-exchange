'use client';

//Hooks
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
//Components
import { Card, Button, Box, Typography, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Loader from '@/components/Loader';
import Image from 'next/image';
//Styles
import '@/styles/globalStyles.css';
import styles from './InventoryCart.module.css';
//Types
import { InventoryItem } from '@/models/inventoryItem';

type CartViewProps = {
    items: InventoryItem[];
    isLoading: boolean;
    onRemove: (index: number) => void;
    // Footer controls below the item list — requestor picker, submit buttons.
    children?: ReactNode;
};

// Shared shell for the aid-worker and admin carts (they only differ in the
// footer controls and submit flow).
const CartView = (props: CartViewProps) => {
    const { items, isLoading, onRemove, children } = props;
    const router = useRouter();

    return (
        <>
            <div className="page--header">
                <Typography variant="h5" sx={{ marginTop: '2em' }}>
                    Your Cart
                </Typography>
            </div>
            {isLoading ? (
                <Loader />
            ) : (
                <div className="content--container">
                    {items.length === 0 ? (
                        <Stack spacing={2}>
                            <Typography variant="body1">There are no items in your cart</Typography>
                            <Button variant="outlined" onClick={() => router.push('/')}>
                                Back to browsing
                            </Button>
                        </Stack>
                    ) : (
                        <Box>
                            <Typography variant="h5">Items to be requested:</Typography>
                            <Box className={styles['inventoryItem--container']}>
                                {items.map((inventoryItem, i) => {
                                    if (inventoryItem.images)
                                        return (
                                            <Card key={i} elevation={5} className={styles['inventoryItem--card']}>
                                                <div className={styles['inventoryItem--card-content']}>
                                                    <Image
                                                        src={inventoryItem.images[0] as string}
                                                        alt={`${inventoryItem.brand} ${inventoryItem.model}`}
                                                        width={80}
                                                        height={80}
                                                        style={{ objectFit: 'cover', aspectRatio: '1/1' }}
                                                    />
                                                    <Typography variant="body1">
                                                        {inventoryItem.brand} - {inventoryItem.model}
                                                    </Typography>
                                                </div>

                                                <Button variant="outlined" type="button" onClick={() => onRemove(i)}>
                                                    <DeleteIcon />
                                                </Button>
                                            </Card>
                                        );
                                })}
                            </Box>
                            {children}
                        </Box>
                    )}
                </div>
            )}
        </>
    );
};

export default CartView;
