// Shared lift-on-hover treatment for the card grids (DonationCard, InventoryItemCard).
export const cardHoverSx = {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 2,
    transition: 'box-shadow 0.2s, transform 0.2s',
    '&:hover': {
        boxShadow: 6,
        transform: 'translateY(-2px)'
    }
} as const;
