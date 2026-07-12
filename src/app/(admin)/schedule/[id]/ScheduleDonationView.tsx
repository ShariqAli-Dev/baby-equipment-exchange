'use client';

import { useState, ChangeEvent } from 'react';

import '@/styles/globalStyles.css';

import { Box, Button, NativeSelect, TextField } from '@mui/material';

import type { EventType } from '@/types/CalendlyTypes';

type ScheduleDonationViewProps = {
    donorEmail: string;
    // Calendly calendars, fetched by the server page.
    events: EventType[];
};

const ScheduleDonationView = (props: ScheduleDonationViewProps) => {
    const { events } = props;
    const [inviteUrl, setInviteUrl] = useState<string>('');
    const [notes, setNotes] = useState<string>('');

    const handleSelect = (event: ChangeEvent<HTMLSelectElement>) => {
        setInviteUrl(event.target.value);
    };

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => setNotes(event.target.value);

    // Pre-existing gap: sending was never implemented on this page.
    const handleSubmit = async () => {};

    return (
        <>
            <div className="page--header">
                <h1>Accept Donation</h1>
                <h4>Select an optional calendar for this email</h4>
            </div>
            <div className="content--container">
                <Box display={'flex'} flexDirection={'column'} gap={4}>
                    <NativeSelect variant="outlined" name="location" id="location" onChange={handleSelect} value={inviteUrl}>
                        <option value="">Send without calendar invite</option>
                        {events.map((event, index) => (
                            <option key={index} value={event.scheduling_url}>
                                {event.name}
                            </option>
                        ))}
                    </NativeSelect>
                    <TextField
                        type="text"
                        label="Notes"
                        name="notes"
                        id="notes"
                        value={notes}
                        multiline={true}
                        minRows={8}
                        maxRows={Infinity}
                        placeholder="Add notes here"
                        onChange={handleInputChange}
                    ></TextField>
                    <Button onClick={handleSubmit}>Send Email</Button>
                </Box>
            </div>
        </>
    );
};

export default ScheduleDonationView;
