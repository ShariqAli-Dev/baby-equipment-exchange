'use client';

import Link from 'next/link';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export default function NewCategoryButton() {
    return (
        <Button startIcon={<AddIcon />} variant="contained" component={Link} href="/categories/create">
            Add New
        </Button>
    );
}
