'use client';

// INTERIM: only the admin Dashboard (deleted in the home/dashboard vertical) still
// renders this. The canonical categories list is the server page at /categories;
// rows navigate to /categories/[id] and "Add New" links to /categories/create
// instead of the in-place detail/form state switches.

//Hoooks
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
//Components
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';
//Styles
import '@/styles/globalStyles.css';
//Types
import { Category } from '@/models/category';
import { Button, InputAdornment, List, ListItem, ListItemButton, ListItemText, TextField, Typography } from '@mui/material';

type CategoryProps = {
    categories: Category[];
    // Still passed by the Dashboard (dies in the home/dashboard vertical); unused
    // here since mutations happen on the canonical /categories routes now.
    setCategoriesUpdated?: Dispatch<SetStateAction<boolean>>;
};

const Categories = (props: CategoryProps) => {
    const { categories } = props;
    const [searchInput, setSearchInput] = useState<string>('');
    const [filteredCategories, setFilteredCategories] = useState<Category[] | null>(categories);

    useEffect(() => {
        setFilteredCategories(
            categories.filter((category) => Object.values(category).some((value) => String(value).toLowerCase().includes(searchInput.toLowerCase())))
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    return (
        <>
            <div className="page--header">
                <Typography variant="h5">Categories</Typography>
            </div>
            <Button variant="contained" component={Link} href="/categories/create">
                Add New
            </Button>
            <TextField
                label="Search"
                id="search-field"
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
            <div className="content--container">
                {filteredCategories && (
                    <List>
                        {filteredCategories.map((category) => (
                            <ListItem key={category.name}>
                                {/* Category doc ids are the category name — encode for the URL */}
                                <ListItemButton
                                    sx={{ backgroundColor: 'white', border: '1px solid black' }}
                                    component={Link}
                                    href={`/categories/${encodeURIComponent(category.id)}`}
                                >
                                    <ListItemText primary={category.name} sx={{ color: category.active ? 'black' : 'gray' }} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )}
            </div>
        </>
    );
};

export default Categories;
