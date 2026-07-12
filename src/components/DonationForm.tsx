'use client';

//Hooks
import { useState } from 'react';
//Components
import ImageThumbnail from './ImageThumbnail';
import InputContainer from '@/components/InputContainer';
import { Autocomplete, Box, Button, Stack, TextField } from '@mui/material';
import CustomDialog from './CustomDialog';
import Loader from './Loader';
//Icons
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
//Api
import { appendImagesToState, removeImageFromState } from '@/controllers/images';
//styles
import styles from './DonationForm.module.css';
import '../styles/globalStyles.css';

export type DonationFormCategory = { name: string; active: boolean };

export type DonationFormValues = {
    category: string | null;
    brand: string;
    model: string;
    description: string;
    tagNumber: string | null;
    newImages: File[];
    keptImageUrls: string[];
};

export type DonationFormProps = {
    mode: 'create' | 'admin-create' | 'edit';
    categories: DonationFormCategory[];
    initial?: Partial<Omit<DonationFormValues, 'newImages'>> & { status?: string };
    onSubmit: (values: DonationFormValues) => void | Promise<void>;
    onCancel?: () => void;
    onGenerateTagNumber?: (category: string) => Promise<string>;
};

export default function DonationForm(props: DonationFormProps) {
    const { mode, categories, initial, onSubmit, onCancel, onGenerateTagNumber } = props;
    const isEdit = mode === 'edit';

    const [category, setCategory] = useState<string | null>(initial?.category ?? null);
    const [brand, setBrand] = useState<string>(initial?.brand ?? '');
    const [model, setModel] = useState<string>(initial?.model ?? '');
    const [description, setDescription] = useState<string>(initial?.description ?? '');
    const [tagNumber, setTagNumber] = useState<string | null>(initial?.tagNumber ?? null);
    const [keptImageUrls, setKeptImageUrls] = useState<string[]>(initial?.keptImageUrls ?? []);
    const [newImages, setNewImages] = useState<File[] | null>();
    const [isImageDialogOpen, setIsImageDialogOpen] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Donors may not pick inactive categories; admins (admin-create/edit) may.
    const isCategoryDisabled = (name: string): boolean => {
        if (mode !== 'create') return false;
        return !categories.find((cat) => cat.name === name)?.active;
    };

    const isDisabled = isEdit
        ? (!newImages || newImages.length === 0) && keptImageUrls.length === 0
        : !newImages || !category || brand.length === 0 || model.length === 0 || description.length === 0;

    function resetForm() {
        setCategory(null);
        setBrand('');
        setModel('');
        setDescription('');
        setNewImages(null);
    }

    async function handleSubmit(event: React.SyntheticEvent) {
        event.preventDefault();
        if (!isEdit && (!newImages || newImages.length === 0)) {
            setIsImageDialogOpen(true);
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmit({
                category: category,
                brand: brand,
                model: model,
                description: description,
                tagNumber: tagNumber,
                newImages: newImages ?? [],
                keptImageUrls: keptImageUrls
            });
            if (!isEdit) resetForm();
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleGenerateTagNumber() {
        if (category && onGenerateTagNumber) {
            setTagNumber(await onGenerateTagNumber(category));
        }
    }

    if (isSubmitting) {
        return <Loader />;
    }

    return (
        <div className="content--container">
            {!isEdit && <p>Enter item details:</p>}
            <Box component="form" className={styles['form']} onSubmit={isEdit ? handleSubmit : undefined}>
                <Box className={styles['form__section--left']}>
                    <Box display={'flex'} flexDirection={'column'} gap={isEdit ? 3 : 1}>
                        <Autocomplete
                            sx={{ maxWidth: isEdit ? { sm: '88%', xs: '80%' } : '87%' }}
                            disablePortal
                            options={categories.map((option) => option.name)}
                            getOptionDisabled={isCategoryDisabled}
                            renderInput={(params) => <TextField {...params} label="Category" required={!isEdit} />}
                            value={category}
                            onChange={(event: any, newValue: string | null) => setCategory(newValue)}
                            aria-label="Category"
                        />
                        {isEdit && initial?.status !== 'rejected' && (
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    type="text"
                                    label="Tag Number"
                                    name="tagNumber"
                                    id="tagNumber"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>): void => setTagNumber(event.target.value)}
                                    value={tagNumber ?? ''}
                                />
                                {onGenerateTagNumber && (
                                    <Button variant="text" type="button" onClick={handleGenerateTagNumber}>
                                        Generate New Tag Number
                                    </Button>
                                )}
                            </Stack>
                        )}
                        <TextField
                            required
                            type="text"
                            label="Brand"
                            name="brand"
                            id="brand"
                            placeholder={isEdit ? undefined : ' Brand'}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setBrand(event.target.value)}
                            value={brand}
                        />
                        <TextField
                            required
                            type="text"
                            label="Model"
                            name="model"
                            id="model"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setModel(event.target.value)}
                            value={model}
                        />
                        <TextField
                            required
                            multiline={true}
                            name="description"
                            label="Description"
                            rows={isEdit ? 4 : 12}
                            placeholder={
                                isEdit
                                    ? undefined
                                    : 'Key details might include: special features, accessories, how the item works, ease of cleaning, size, and/or information about missing or damaged parts'
                            }
                            id="description"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDescription(event.target.value)}
                            value={description}
                        />
                    </Box>
                </Box>
                <Box className={styles['form__section--right']}>
                    <InputContainer for="images" label={isEdit ? 'Images' : 'Upload images (required)'}>
                        <div className={styles['image-uploader__container']}>
                            {keptImageUrls.map((image) => (
                                <ImageThumbnail
                                    key={image}
                                    url={image}
                                    width={'32%'}
                                    margin={'.66%'}
                                    removeFromDb={() => setKeptImageUrls(keptImageUrls.filter((url) => url !== image))}
                                />
                            ))}
                            <div className={styles['image-uploader__display']}>
                                {newImages &&
                                    newImages.map((image, index) => (
                                        <ImageThumbnail
                                            key={`${image.name}-${index}`}
                                            file={image}
                                            width={'32%'}
                                            margin={'.66%'}
                                            removeFromState={(fileToRemove: File) => removeImageFromState(newImages, setNewImages, fileToRemove)}
                                        />
                                    ))}
                            </div>
                            <div className={styles['image-uploader__input']}>
                                <label id="labelForImages" htmlFor="images">
                                    <input
                                        required={!isEdit}
                                        type="file"
                                        id="images"
                                        name="images"
                                        accept="image/*"
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => appendImagesToState(newImages, setNewImages, event)}
                                        multiple
                                    />
                                    <Button variant="contained" component="span" className={styles['form-btn']} endIcon={<AddPhotoAlternateIcon />}>
                                        Add Image
                                    </Button>
                                </label>
                            </div>
                        </div>
                    </InputContainer>
                </Box>
                <Box className={styles['form__section--bottom']}>
                    {isEdit ? (
                        <Button variant="contained" type="submit" disabled={isDisabled}>
                            Save changes
                        </Button>
                    ) : (
                        <Button variant="contained" fullWidth={false} size="medium" type="button" onClick={handleSubmit} disabled={isDisabled}>
                            Add item
                        </Button>
                    )}
                    {onCancel && (
                        <Button variant="outlined" fullWidth={false} size="medium" type="button" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                </Box>
            </Box>
            <CustomDialog
                isOpen={isImageDialogOpen}
                onClose={() => setIsImageDialogOpen(false)}
                title="Image required"
                content="You must provide at least one image for your donation."
            />
        </div>
    );
}
