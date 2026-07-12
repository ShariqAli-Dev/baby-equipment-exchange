'use client';

//Hooks
import { useState } from 'react';
import { useRouter } from 'next/navigation';
//Components
import { Box, Button, TextField, Typography } from '@mui/material';
import CustomDialog from '@/components/CustomDialog';
import Loader from '@/components/Loader';
//API
import { addErrorEvent } from '@/api/firebase';
import { addCategoryAction } from '@/server/actions/categories';
//Styles
import '@/styles/globalStyles.css';
//Types
import { categoryBody } from '@/types/CategoryTypes';

export default function CategoryFormClient() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [tagPrefix, setTagPrefix] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    const router = useRouter();

    const handleClose = () => {
        setIsDialogOpen(false);
        // L12 fixed: /categories exists now, so landing there after create works.
        router.push('/categories');
    };

    const handleSubmit = async (event: React.FormEvent): Promise<void> => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const categoryToCreate: categoryBody = {
                name: name,
                tagPrefix: tagPrefix,
                description: description
            };
            await addCategoryAction(categoryToCreate);
            setIsDialogOpen(true);
        } catch (error) {
            addErrorEvent('Error submitting new category: ', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="page--header">
                <Typography variant="h5">Create Category</Typography>
            </div>

            {isLoading && <Loader />}
            {!isLoading && (
                <div className="content--container">
                    <Box component="form" display={'flex'} flexDirection={'column'} gap={4} className="form--container" onSubmit={handleSubmit}>
                        <TextField
                            type="text"
                            label="Name"
                            name="name"
                            id="name"
                            placeholder="Category Name"
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            required
                        />
                        <TextField
                            type="text"
                            label="Tag Number Prefix"
                            name="Tag Number Prefix"
                            id="tag-prefix"
                            placeholder="Prefix for Tag Numbers"
                            onChange={(e) => setTagPrefix(e.target.value)}
                            value={tagPrefix}
                            required
                        />
                        <TextField
                            type="text"
                            label="Description"
                            name="Description"
                            id="description"
                            placeholder="Description"
                            onChange={(e) => setDescription(e.target.value)}
                            value={description}
                        />
                        <Button variant="contained" type="submit" disabled={name.length === 0 || tagPrefix.length === 0}>
                            Create Category
                        </Button>
                        <Button variant="outlined" type="button" onClick={() => router.push('/categories')}>
                            Cancel
                        </Button>
                    </Box>
                    <CustomDialog
                        isOpen={isDialogOpen}
                        onClose={handleClose}
                        title="Cateory created"
                        content={`The category "${name}" has been successfuly created`}
                    />
                </div>
            )}
        </>
    );
}
