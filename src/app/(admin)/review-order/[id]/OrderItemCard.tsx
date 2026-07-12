'use client';

//Hooks
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
//Components
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography
} from '@mui/material';
//Icons
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import BlockIcon from '@mui/icons-material/Block';
//Styles
import '@/styles/globalStyles.css';
//Types
import type { DonationDTO } from '@/server/donations';
import type { OrderItemRejectionResolution } from '@/server/orders';
import type { UserDTO } from '@/server/users';

type OrderItemCardProps = {
    donation: DonationDTO;
    // Reassignment candidates, server-provided by the review-order page.
    activeUsers: UserDTO[];
    onRemove?: (donationId: string, resolution: OrderItemRejectionResolution) => Promise<void>;
    showRemoveButton?: boolean;
};

type RejectionAction = OrderItemRejectionResolution['action'];

const rejectionOptions: {
    action: RejectionAction;
    label: string;
    description: string;
    icon: JSX.Element;
}[] = [
    {
        action: 'available',
        label: 'Return to inventory',
        description: 'Item becomes available for other requests',
        icon: <Inventory2Icon fontSize="small" />
    },
    {
        action: 'requested',
        label: 'Reserve for someone else',
        description: 'Reassign this item to a different user',
        icon: <PersonAddAlt1Icon fontSize="small" />
    },
    {
        action: 'unavailable',
        label: 'Mark as unavailable',
        description: 'Remove item from circulation',
        icon: <BlockIcon fontSize="small" />
    }
];

const OrderItemCard = (props: OrderItemCardProps) => {
    const { donation, activeUsers, onRemove, showRemoveButton = true } = props;
    const router = useRouter();
    const [showRemoveDialog, setShowRemoveDialog] = useState<boolean>(false);
    const [rejectionAction, setRejectionAction] = useState<RejectionAction>('available');
    const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const availableUsers = useMemo(() => activeUsers.filter((user) => user.uid !== donation.requestor?.id), [activeUsers, donation.requestor?.id]);

    const handleRemove = async () => {
        if (!onRemove) return;

        let resolution: OrderItemRejectionResolution;
        if (rejectionAction === 'requested') {
            if (!selectedUser) return;
            resolution = {
                action: 'requested',
                requestor: {
                    id: selectedUser.uid,
                    name: selectedUser.displayName ?? '',
                    email: selectedUser.email ?? ''
                }
            };
        } else {
            resolution = { action: rejectionAction };
        }

        setIsSubmitting(true);
        try {
            await onRemove(donation.id, resolution);
            setShowRemoveDialog(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Card className="card--container" raised>
                <CardActions className="card--container-image" onClick={() => router.push(`/donations/${donation.id}`)} sx={{ cursor: 'pointer' }}>
                    {donation.images.length > 0 && <CardMedia component="img" alt={donation.model ?? ''} image={donation.images[0]} />}
                </CardActions>
                <CardContent>
                    <Typography variant="h5">
                        {donation.brand} - {donation.model}
                    </Typography>
                    <Typography variant="h6">{donation.tagNumber}</Typography>
                </CardContent>

                {showRemoveButton && onRemove && (
                    <CardActions>
                        <Button variant="contained" startIcon={<RemoveShoppingCartIcon />} color="error" onClick={() => setShowRemoveDialog(true)}>
                            Reject
                        </Button>
                    </CardActions>
                )}
            </Card>
            {onRemove && (
                <Dialog
                    open={showRemoveDialog}
                    onClose={() => setShowRemoveDialog(false)}
                    aria-labelledby="dialog-title"
                    aria-describedby="dialog-description"
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle id="dialog-title">Reject Item</DialogTitle>
                    <DialogContent sx={{ pb: 2, overflowX: 'hidden', overflowY: 'auto' }}>
                        <DialogContentText id="dialog-description" sx={{ mb: 2.5 }}>
                            What should happen to <strong>{donation.brand} &ndash; {donation.model}</strong>?
                        </DialogContentText>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {rejectionOptions.map((option) => {
                                const selected = rejectionAction === option.action;
                                return (
                                    <Box
                                        key={option.action}
                                        onClick={() => {
                                            setRejectionAction(option.action);
                                            if (option.action !== 'requested') setSelectedUser(null);
                                        }}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            p: 1.5,
                                            borderRadius: 1,
                                            border: '2px solid',
                                            borderColor: selected ? 'primary.main' : 'divider',
                                            backgroundColor: selected ? 'primary.50' : 'transparent',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                            '&:hover': {
                                                borderColor: selected ? 'primary.main' : 'action.hover',
                                                backgroundColor: selected ? 'primary.50' : 'action.hover'
                                            }
                                        }}
                                    >
                                        <Box sx={{ color: selected ? 'primary.main' : 'text.secondary', display: 'flex' }}>
                                            {option.icon}
                                        </Box>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="body2" fontWeight={selected ? 600 : 500}>
                                                {option.label}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {option.description}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                        {rejectionAction === 'requested' && (
                            <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                                <InputLabel id={`reassign-label-${donation.id}`}>Select user</InputLabel>
                                <Select
                                    labelId={`reassign-label-${donation.id}`}
                                    value={selectedUser?.uid ?? ''}
                                    label="Select user"
                                    onChange={(e) => {
                                        const user = availableUsers.find((u) => u.uid === e.target.value) ?? null;
                                        setSelectedUser(user);
                                    }}
                                >
                                    {availableUsers.map((user) => (
                                        <MenuItem key={user.uid} value={user.uid}>
                                            {user.displayName} ({user.email})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => setShowRemoveDialog(false)}
                            sx={{ textTransform: 'none' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleRemove}
                            disabled={isSubmitting || (rejectionAction === 'requested' && !selectedUser)}
                            sx={{ textTransform: 'none' }}
                        >
                            {isSubmitting ? 'Saving…' : 'Confirm rejection'}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    );
};

export default OrderItemCard;
