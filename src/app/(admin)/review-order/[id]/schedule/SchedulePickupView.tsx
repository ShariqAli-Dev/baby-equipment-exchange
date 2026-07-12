'use client';

//Hooks
import { ChangeEvent, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { useRouter } from 'next/navigation';
//Components
import DonationCardSmall from '@/components/DonationCardSmall';
import { Box, Button, FormControl, InputLabel, NativeSelect, TextField } from '@mui/material';
import CustomDialog from '@/components/CustomDialog';
import Loader from '@/components/Loader';
//Api
import { addErrorEvent } from '@/api/firebase';
import sendMail from '@/api/nodemailer';
import { closeOrderAction } from '@/server/actions/orders';
import { updateDonationStatusAction } from '@/server/actions/donations';
//Styles
import '@/styles/globalStyles.css';
//Types
import type { OrderDTO } from '@/server/orders';
import type { EventType } from '@/types/CalendlyTypes';

import schedulePickup from '@/email-templates/schedulePickup';

type SchedulePickupViewProps = {
    order: OrderDTO;
    // Calendly calendars, fetched by the server page.
    events: EventType[];
};

const SchedulePickupView = (props: SchedulePickupViewProps) => {
    const { order, events } = props;
    const { requestor, id, items, rejectedItems } = order;
    const router = useRouter();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [inviteUrl, setInviteUrl] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    const allRejected = items.length === 0;

    const handleClose = () => {
        setIsDialogOpen(false);
        router.push('/');
    };

    const handleSelect = (event: ChangeEvent<HTMLSelectElement>) => {
        setInviteUrl(event.target.value);
    };
    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => setNotes(event.target.value);

    const handleSubmit = async () => {
        setIsLoading(true);
        const tagNumbers: string[] = [];
        items.map((item) => {
            if (item.tagNumber) tagNumbers.push(item.tagNumber);
        });
        const emailMsg = schedulePickup(requestor.email, inviteUrl, renderToString(message), tagNumbers, notes);
        try {
            if (!allRejected) {
                await Promise.all(
                    items.map(async (item) => {
                        await updateDonationStatusAction(item.id, 'reserved');
                    })
                );
            }
            await closeOrderAction(id);
            sendMail(emailMsg);
            setIsDialogOpen(true);
        } catch (error) {
            addErrorEvent('Error submitting schedule pickup email', error);
        } finally {
            setIsLoading(false);
        }
    };

    const message = allRejected ? (
        <>
            <p>{`Hello ${requestor.name}`}</p>
            <p>Unfortunately, none of the items you requested are currently available:</p>
            {rejectedItems.length > 0 && (
                <>
                    {rejectedItems.map((item) => (
                        <DonationCardSmall key={item.id} donation={item} />
                    ))}
                </>
            )}
            <p>We apologize for the inconvenience and hope to serve you better in the future.</p>
        </>
    ) : (
        <>
            <p>{`Hello ${requestor.name}`}</p>
            <p>Your request for the following items has been fulfilled:</p>
            {items.map((item) => (
                <DonationCardSmall key={item.id} donation={item} />
            ))}
            {rejectedItems.length > 0 && (
                <>
                    <p>Unfortunately, the following items you requested are no longer available:</p>
                    {rejectedItems.map((item) => (
                        <DonationCardSmall key={item.id} donation={item} />
                    ))}
                </>
            )}
        </>
    );

    return (
        <>
            <div className="page--header">
                <h3>{allRejected ? 'Send Rejection Email' : 'Send Pickup Email'}</h3>
            </div>
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <p>{`The following email will be sent to ${requestor.email}`}</p>
                    <div className="content--container">
                        <Box display={'flex'} flexDirection={'column'}>
                            {message}
                            <TextField
                                type="text"
                                label="Additional notes"
                                name="notes"
                                id="notes"
                                value={notes}
                                multiline={true}
                                minRows={4}
                                maxRows={Infinity}
                                placeholder="Add any additional notes here"
                                onChange={handleInputChange}
                            />
                            {!allRejected && (
                                <FormControl fullWidth sx={{ marginTop: '2em' }}>
                                    <InputLabel variant="standard" htmlFor="location" shrink={true}>
                                        Select calendar for accepted donations
                                    </InputLabel>
                                    <NativeSelect variant="outlined" name="location" id="location" onChange={handleSelect} value={inviteUrl}>
                                        <option value="">Send without calendar invite</option>
                                        {events.map((event, index) => (
                                            <option key={index} value={event.scheduling_url}>
                                                {event.name}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </FormControl>
                            )}
                            <Box sx={{ marginTop: '2em' }} display={'flex'} gap={2}>
                                <Button variant="contained" onClick={handleSubmit}>
                                    {allRejected ? 'Send Rejection Email' : 'Send Pickup Email'}
                                </Button>
                                <Button variant="outlined" onClick={() => router.push(`/review-order/${id}`)}>
                                    Cancel
                                </Button>
                            </Box>
                        </Box>
                    </div>
                </>
            )}
            <CustomDialog isOpen={isDialogOpen} onClose={handleClose} title="Email sent" content={`Email successfully sent to ${requestor.email}`} />
        </>
    );
};

export default SchedulePickupView;
