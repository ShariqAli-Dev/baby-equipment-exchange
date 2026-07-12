'use client';

//Hooks
import { useState } from 'react';
import { useRouter } from 'next/navigation';
//Api
import { addErrorEvent } from '@/api/firebase';
import { uploadImages } from '@/api/firebase-images';
import { updateDonationAction } from '@/server/actions/donations';
import { getTagNumberAction } from '@/server/actions/categories';
//Components
import { Paper } from '@mui/material';
import DonationForm, { DonationFormCategory, DonationFormValues } from '@/components/DonationForm';
import CustomDialog from '@/components/CustomDialog';
//Styles
import '@/styles/globalStyles.css';
//Types
import type { DonationDTO } from '@/server/donations';

type EditDonationClientProps = {
    donation: DonationDTO;
    categories: DonationFormCategory[];
};

export default function EditDonationClient({ donation, categories }: EditDonationClientProps) {
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [dialogContent, setDialogContent] = useState<string>('');
    const router = useRouter();

    async function handleEditSubmit(values: DonationFormValues): Promise<void> {
        try {
            let addedImageUrls: string[] = [];
            if (values.newImages.length > 0) {
                // Image upload stays client-side (browser File objects, client SDK).
                addedImageUrls = await uploadImages(values.newImages);
            }
            await updateDonationAction(donation.id, {
                category: values.category,
                tagNumber: values.tagNumber ?? '',
                brand: values.brand,
                model: values.model,
                description: values.description,
                images: [...addedImageUrls, ...values.keptImageUrls]
            });
            setDialogContent(`The donation ${values.model} has been updated successfully.`);
            setIsDialogOpen(true);
        } catch (error) {
            addErrorEvent('Error submitting donation update', error);
            throw error;
        }
    }

    const backToDetail = (): void => {
        router.push(`/donations/${donation.id}`);
    };

    return (
        <div className="page--header">
            <h3>Edit Donation</h3>
            <Paper className="content--container" elevation={8} square={false}>
                <DonationForm
                    mode="edit"
                    categories={categories}
                    initial={{
                        category: donation.category,
                        brand: donation.brand ?? '',
                        model: donation.model ?? '',
                        description: donation.description ?? '',
                        tagNumber: donation.tagNumber,
                        keptImageUrls: donation.images,
                        status: donation.status
                    }}
                    onSubmit={handleEditSubmit}
                    onCancel={backToDetail}
                    onGenerateTagNumber={getTagNumberAction}
                />
            </Paper>
            <CustomDialog isOpen={isDialogOpen} title="Donation updated" content={dialogContent} onClose={backToDetail} />
        </div>
    );
}
