'use client';

import Link from 'next/link';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export default function NewDonationButton() {
    return (
        <Button startIcon={<AddIcon />} variant="contained" component={Link} href="/admin-donate">
            Add New
        </Button>
    );
}
