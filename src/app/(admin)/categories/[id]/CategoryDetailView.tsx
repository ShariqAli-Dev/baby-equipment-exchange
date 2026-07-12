'use client';

//Hooks
import { useState } from 'react';
import { useRouter } from 'next/navigation';
//Components
import Link from 'next/link';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import Loader from '@/components/Loader';
//Api
import { addErrorEvent } from '@/api/firebase';
import { updateCategoryAction } from '@/server/actions/categories';
//icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
//Styles
import '@/styles/globalStyles.css';
//Types
import type { CategoryDTO } from '@/server/categories';

export default function CategoryDetailView({ category }: { category: CategoryDTO }) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleToggleActive = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await updateCategoryAction(category.id, { active: !category.active });
            router.refresh(); // action already revalidated; re-render with fresh data
        } catch (error) {
            addErrorEvent('Error toggling category active status: ', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="page--header">
                <Typography variant="h5">Category Details</Typography>
                <IconButton component={Link} href="/categories" aria-label="Back to categories">
                    <ArrowBackIcon />
                </IconButton>
            </div>

            {isLoading && <Loader />}
            {!isLoading && (
                <div className="content--container">
                    <Typography variant="h5">{category.name}</Typography>
                    <Typography variant="caption">Status</Typography>
                    {category.active ? (
                        <Stack direction="row" spacing={2}>
                            <Typography variant="h6">Active</Typography>
                            <Button variant="text" onClick={handleToggleActive}>
                                Make inactive
                            </Button>
                        </Stack>
                    ) : (
                        <Stack direction="row">
                            <Typography variant="h6">Inactive</Typography>
                            <Button variant="text" onClick={handleToggleActive}>
                                Make Active
                            </Button>
                        </Stack>
                    )}
                    {category.description && category.description.length > 0 && (
                        <Typography variant="body1">
                            <b>Description: </b>
                            {category.description}
                        </Typography>
                    )}
                    <Typography variant="body1">
                        <b>Tag Prefix: </b>
                        {category.tagPrefix}
                    </Typography>
                    <Typography variant="body1">
                        <b>Last tag number used: </b>
                        {category.tagCount}
                    </Typography>
                    <Stack sx={{ marginTop: '2em' }}>
                        <Button
                            variant="contained"
                            type="button"
                            startIcon={<EditIcon />}
                            component={Link}
                            href={`/categories/${encodeURIComponent(category.id)}/edit`}
                        >
                            Edit Category
                        </Button>
                    </Stack>
                </div>
            )}
        </>
    );
}
