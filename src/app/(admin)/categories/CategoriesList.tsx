'use client';

import Link from 'next/link';
import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';

export type CategoryListEntry = { id: string; name: string; active: boolean };

export default function CategoriesList({ categories }: { categories: CategoryListEntry[] }) {
    return (
        <div className="content--container">
            <List>
                {categories.map((category) => (
                    <ListItem key={category.id}>
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
        </div>
    );
}
