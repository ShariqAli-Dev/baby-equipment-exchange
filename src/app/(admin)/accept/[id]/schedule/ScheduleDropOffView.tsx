'use client';

//Hooks
import { useState, ChangeEvent } from 'react';
import { renderToString } from 'react-dom/server';
import { useRouter } from 'next/navigation';
//Components
import { Box, Button, FormControl, NativeSelect, TextField, InputLabel } from '@mui/material';
import DonationCardSmall from '@/components/DonationCardSmall';
import Loader from '@/components/Loader';
import CustomDialog from '@/components/CustomDialog';
//Api
import { addErrorEvent } from '@/api/firebase';
import sendMail from '@/api/nodemailer';
import accept from '@/email-templates/accept';
import reject from '@/email-templates/reject';
import { acceptDonationAction, updateDonationStatusAction } from '@/server/actions/donations';
//Styles
import '@/styles/globalStyles.css';
//Types
import type { DonationDTO } from '@/server/donations';
import type { EventType } from '@/types/CalendlyTypes';

type ScheduleDropOffViewProps = {
    accepted: DonationDTO[];
    rejected: DonationDTO[];
    // Calendly calendars, fetched by the server page.
    events: EventType[];
};

const ScheduleDropOffView = (props: ScheduleDropOffViewProps) => {
    const { accepted, rejected, events } = props;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [inviteUrl, setInviteUrl] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    const router = useRouter();

    let donorEmail = '';
    let donorName = '';
    if (accepted.length > 0) {
        donorEmail = accepted[0].donorEmail ?? '';
        donorName = accepted[0].donorName ?? '';
    } else if (rejected.length > 0) {
        donorEmail = rejected[0].donorEmail ?? '';
        donorName = rejected[0].donorName ?? '';
    }

    const handleClose = () => {
        setIsDialogOpen(false);
        router.push('/');
    };

    const handleSelect = (event: ChangeEvent<HTMLSelectElement>) => {
        setInviteUrl(event.target.value);
    };

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => setNotes(event.target.value);

    // Accepting assigns a tag number and stamps dateAccepted server-side.
    const acceptPromise = async (donations: DonationDTO[]): Promise<string[]> => {
        const tagNumbers: string[] = [];
        await Promise.all(
            donations.map(async (donation) => {
                try {
                    const newTagNumber = await acceptDonationAction(donation.id, donation.category ?? '');
                    tagNumbers.push(newTagNumber);
                } catch (error) {
                    addErrorEvent('Error accepting donation', error);
                    throw error;
                }
            })
        );
        return tagNumbers;
    };
    const rejectPromise = async (donations: DonationDTO[]) => {
        await Promise.all(
            donations.map(async (donation) => {
                await updateDonationStatusAction(donation.id, 'rejected');
            })
        );
    };

    const message = (
        <>
            <p>{`Hello ${donorName},`}</p>
            <p>Thank you for submitting your donation to the Baby Product Exchange.</p>
            {accepted.length > 0 && (
                <>
                    <p>The following items have been accepted:</p>
                    <ul>
                        {accepted.map((donation) => (
                            <DonationCardSmall key={donation.id} donation={donation} />
                        ))}
                    </ul>
                </>
            )}
            {rejected.length > 0 && (
                <>
                    <p>Unfortunately, the following items could not be accepted:</p>
                    <ul>
                        {rejected.map((donation) => (
                            <DonationCardSmall key={donation.id} donation={donation} />
                        ))}
                    </ul>
                </>
            )}
        </>
    );

    const handleSubmit = async () => {
        //send email with renderToString(message) and update donation statuses. If donation is accepted, assign a tagNumber
        setIsLoading(true);
        try {
            let tagNumbers: string[] = [];
            if (accepted.length > 0) tagNumbers = await acceptPromise(accepted);
            if (rejected.length > 0) await rejectPromise(rejected);
            const emailMsg =
                accepted.length > 0
                    ? accept(donorEmail, inviteUrl, renderToString(message), tagNumbers, notes)
                    : reject(donorEmail, renderToString(message), notes);
            await sendMail(emailMsg);
            setIsDialogOpen(true);
        } catch (error) {
            addErrorEvent('Error submitting accept/reject email', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="page--header">
                <h3>Send Accept/Reject Email</h3>
            </div>
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <p>{`The following email will be sent to ${donorEmail}:`}</p>
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
                            ></TextField>
                            {accepted.length > 0 && (
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
                                <Button onClick={handleSubmit} variant="contained">
                                    Send Email
                                </Button>
                                <Button variant="outlined" type="button" onClick={() => router.back()}>
                                    Cancel
                                </Button>
                            </Box>
                        </Box>
                    </div>
                </>
            )}
            <CustomDialog isOpen={isDialogOpen} onClose={handleClose} title="Email sent" content={`Email successfully sent to ${donorEmail}`} />
        </>
    );
};

export default ScheduleDropOffView;
