import { Typography } from '@mui/material';

// When a tab is empty we show either the plain default message or, if a search
// is active, a hint to check the badge counts on the other tabs.
export default function EmptyTabMessage({ query, defaultMessage }: { query: string; defaultMessage: string }) {
    return (
        <Typography sx={{ marginTop: '1rem' }} variant="body1">
            {query ? `No matches for “${query}” in this tab — check the badges above.` : defaultMessage}
        </Typography>
    );
}
