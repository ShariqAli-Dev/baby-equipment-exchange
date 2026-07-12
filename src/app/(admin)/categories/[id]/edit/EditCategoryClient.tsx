'use client';

//hooks
import { useState } from 'react';
import { useRouter } from 'next/navigation';
//components
import NumberField from '@/components/NumberField';
import Loader from '@/components/Loader';
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Stack, TextField, Typography } from '@mui/material';
import CustomDialog from '@/components/CustomDialog';
//Api
import { addErrorEvent } from '@/api/firebase';
import { updateCategoryAction } from '@/server/actions/categories';
//Styles
import '@/styles/globalStyles.css';
//types
import type { CategoryDTO } from '@/server/categories';

export default function EditCategoryClient({ category }: { category: CategoryDTO }) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [newName, setNewName] = useState<string>(category.name);
    const [newActive, setNewActive] = useState<boolean>(category.active);
    const [newTagPrefix, setNewTagPrefix] = useState<string>(category.tagPrefix);
    const [newTagCount, setNewtagCount] = useState<number>(category.tagCount);
    const [newDescription, setNewDescription] = useState<string>(category.description ?? '');
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    const router = useRouter();

    const handleCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewActive(event.target.checked);
    };

    const handleClose = () => {
        setIsDialogOpen(false);
        // Action already revalidated /categories/[id]; land on the detail view.
        router.push(`/categories/${encodeURIComponent(category.id)}`);
    };

    const handleSubmit = async (event: React.FormEvent): Promise<void> => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const updatedCategory = {
                name: newName,
                active: newActive,
                description: newDescription,
                tagPrefix: newTagPrefix,
                tagCount: newTagCount
            };
            await updateCategoryAction(category.id, updatedCategory);
            setIsDialogOpen(true);
        } catch (error) {
            addErrorEvent('Error updating category: ', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="page--header">
                <Typography variant="h5">Edit Category</Typography>
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
                            placeholder="Name"
                            onChange={(e) => setNewName(e.target.value)}
                            value={newName}
                            required
                        />
                        <FormGroup>
                            <FormControlLabel control={<Checkbox checked={newActive} onChange={handleCheck} />} label="Active" />
                        </FormGroup>
                        <TextField
                            type="text"
                            label="Tag Prefix"
                            name="Tag Prefix"
                            id="tag-prefix"
                            placeholder="Tag Prefix"
                            onChange={(e) => setNewTagPrefix(e.target.value)}
                            value={newTagPrefix}
                        />
                        <TextField
                            type="text"
                            label="Description"
                            name="description"
                            id="description"
                            placeholder="Description"
                            onChange={(e) => setNewDescription(e.target.value)}
                            value={newDescription}
                        />
                        <NumberField label="Last tag number used" value={newTagCount} onValueChange={(e) => setNewtagCount(e ?? 0)} />
                        <Stack direction="column" spacing={2}>
                            <Button variant="contained" type="submit">
                                Save
                            </Button>
                            <Button variant="outlined" type="button" onClick={() => router.push(`/categories/${encodeURIComponent(category.id)}`)}>
                                Cancel
                            </Button>
                        </Stack>
                    </Box>
                    <CustomDialog
                        isOpen={isDialogOpen}
                        onClose={handleClose}
                        title={`Category updated`}
                        content={`The category ${newName} has been sucessfully updated.`}
                    />
                </div>
            )}
        </>
    );
}
