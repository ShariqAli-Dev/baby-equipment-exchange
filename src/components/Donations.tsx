'use client';

// INTERIM: only the admin Dashboard (deleted in the home/dashboard vertical) still
// renders this. The canonical donations list is the server page at /donations;
// card clicks navigate to /donations/[id] instead of the deleted details dialog.

//Hooks
import { SetStateAction, useState, Dispatch, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
//Components
import { Box, Button, Chip, Autocomplete, TextField, Stack, Typography, InputAdornment } from '@mui/material';
import DonationCard, { DonationCardData } from '@/components/DonationCard';
//Api
import { getAllCategories } from '@/api/firebase-categories';

//Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
//Styles
import '@/styles/globalStyles.css';
//Types
import { Donation, DonationStatuses, donationStatuses } from '@/models/donation';
import { Category } from '@/models/category';
import { addErrorEvent } from '@/api/firebase';

type DonationsProps = {
    donations: Donation[];
    setDonationsUpdated?: Dispatch<SetStateAction<boolean>>;
};

const statusSelectOptions = Object.keys(donationStatuses);

function toCardData(donation: Donation): DonationCardData {
    return {
        id: donation.id,
        brand: donation.brand,
        model: donation.model,
        category: donation.category,
        tagNumber: donation.tagNumber ?? null,
        status: donation.status,
        donorEmail: donation.donorEmail,
        images: donation.images,
        dateLabel:
            (donation.dateAccepted ?? donation.createdAt)?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) ?? null
    };
}

const Donations = (props: DonationsProps) => {
    const { donations } = props;
    const [searchInput, setSearchInput] = useState<string>('');
    const [categories, setCategories] = useState<Category[] | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<string[] | undefined>([]);
    const [statusFilter, setStatusFilter] = useState<string[] | undefined>([]);
    const router = useRouter();

    const fetchCategories = async (): Promise<void> => {
        try {
            const categoriesResult = await getAllCategories();
            setCategories(categoriesResult);
        } catch (error) {
            addErrorEvent('Error fetching all categories: ', error);
            throw error;
        }
    };

    //Updates displayed donations anytimes filters or search field changes
    const donationsToDisplay = useMemo(() => {
        let currentDonations = donations;
        if (searchInput.length > 0) {
            const search = searchInput.toLowerCase();
            currentDonations = currentDonations.filter((donation) => {
                const searchableValues = [
                    donation.tagNumber,
                    donation.status,
                    donation.category,
                    donation.brand,
                    donation.model,
                    donation.description,
                    donation.donorName,
                    donation.donorEmail,
                    donation.requestor?.name,
                    donation.requestor?.email,
                    donation.distributor?.name,
                    donation.distributor?.email
                ];
                return searchableValues.some((value) => String(value ?? '').toLowerCase().includes(search));
            });
        }
        if (categoryFilter && categoryFilter.length > 0) {
            currentDonations = currentDonations.filter((donation) => categoryFilter.includes(donation.category));
        }
        if (statusFilter && statusFilter.length > 0) {
            currentDonations = currentDonations.filter((donation) =>
                statusFilter.some((filter) => donationStatuses[filter as keyof DonationStatuses] === donation.status)
            );
        }
        return currentDonations;
    }, [donations, categoryFilter, statusFilter, searchInput]);

    useEffect(() => {
        if (!categories) fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <div className="page--header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5">Donations</Typography>
                <Button startIcon={<AddIcon />} variant="contained" type="button" onClick={() => router.push('/admin-donate')}>
                    Add New
                </Button>
            </div>
            <Stack spacing={2} sx={{ mb: 3 }}>
                <TextField
                    label="Search"
                    id="search-field"
                    placeholder="Search by tag, donor, brand, model, or category"
                    value={searchInput}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>): void => setSearchInput(event.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        )
                    }}
                />
                {categories && (
                    <Autocomplete
                        sx={{ maxWidth: '83vw' }}
                        multiple
                        id="category-filter"
                        options={categories.map((category) => category.name)}
                        value={categoryFilter}
                        onChange={(event, newValue) => setCategoryFilter(newValue)}
                        renderInput={(params) => <TextField {...params} variant="standard" label="Filter by category" placeholder="Category" />}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => {
                                const { key, ...tagProps } = getTagProps({ index });
                                return <Chip key={key} label={option} {...tagProps} />;
                            })
                        }
                    />
                )}

                <Autocomplete
                    sx={{ maxWidth: '83vw' }}
                    multiple
                    id="status-filter"
                    options={statusSelectOptions}
                    value={statusFilter}
                    onChange={(event, newValues) => setStatusFilter(newValues)}
                    renderInput={(params) => <TextField {...params} variant="standard" label="Filter by status" placeholder="Status" />}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                            const { key, ...tagProps } = getTagProps({ index });
                            return <Chip key={key} label={option} {...tagProps} />;
                        })
                    }
                />
            </Stack>
            {donationsToDisplay.length === 0 ? (
                <Typography variant="body1">No donations found.</Typography>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)',
                            lg: 'repeat(4, 1fr)'
                        },
                        gap: 2
                    }}
                >
                    {donationsToDisplay.map((donation) => (
                        <DonationCard key={donation.id} donation={toCardData(donation)} href={`/donations/${donation.id}`} />
                    ))}
                </Box>
            )}
        </>
    );
};

export default Donations;
