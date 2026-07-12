'use client';

import Link from 'next/link';
import { Button } from '@mui/material';

export default function NewOrganizationButton() {
    return (
        <Button variant="contained" component={Link} href="/organizations/create">
            Create new
        </Button>
    );
}
