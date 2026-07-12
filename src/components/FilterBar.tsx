'use client';

//Hooks
import { useFilterParams } from '@/lib/use-filter-params';
//Components
import { Box, Checkbox, InputAdornment, ListItemText, MenuItem, TextField } from '@mui/material';
//Icons
import SearchIcon from '@mui/icons-material/Search';

export type FilterOption = { value: string; label: string };
export type FilterDef = { key: string; label: string; options: FilterOption[] };

type FilterBarProps = {
    searchKey?: string;
    searchPlaceholder?: string;
    filters?: FilterDef[];
};

// One search + filter row that reads/writes URL query params (?q=, ?status=a,b, …)
// instead of component state — filtered views are linkable and survive refresh.
export default function FilterBar({ searchKey = 'q', searchPlaceholder = 'Search', filters = [] }: FilterBarProps) {
    const { getParam, getListParam, setParam, setTextParam } = useFilterParams();

    return (
        <Box display="flex" flexWrap="wrap" gap={2} sx={{ marginBottom: '1em' }}>
            <TextField
                type="search"
                size="small"
                placeholder={searchPlaceholder}
                defaultValue={getParam(searchKey)}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTextParam(searchKey, event.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    )
                }}
                sx={{ minWidth: 220 }}
            />
            {filters.map((filter) => {
                const selected = getListParam(filter.key);
                return (
                    <TextField
                        key={filter.key}
                        select
                        size="small"
                        label={filter.label}
                        value={selected}
                        onChange={(event) => {
                            // MUI multiple-select delivers string[] through a ChangeEvent value
                            const value = event.target.value as unknown as string[];
                            setParam(filter.key, value.length > 0 ? value : null);
                        }}
                        SelectProps={{
                            multiple: true,
                            renderValue: (value) =>
                                (value as string[])
                                    .map((selectedValue) => filter.options.find((option) => option.value === selectedValue)?.label ?? selectedValue)
                                    .join(', ')
                        }}
                        sx={{ minWidth: 180 }}
                    >
                        {filter.options.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                <Checkbox checked={selected.includes(option.value)} />
                                <ListItemText primary={option.label} />
                            </MenuItem>
                        ))}
                    </TextField>
                );
            })}
        </Box>
    );
}
