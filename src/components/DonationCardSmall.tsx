'use client';

const thumbnailStyles = {
    width: '80px',
    height: '80px'
};

// Structural type so Donation model instances, DonationBody drafts, and
// server DonationDTOs all fit — the card only renders these three fields.
type DonationCardSmallProps = {
    donation: {
        brand?: string | null;
        model?: string | null;
        images?: string[] | null;
    };
};

export default function DonationCardSmall(props: DonationCardSmallProps) {
    const { donation } = props;
    const image = donation.images ? donation.images[0] : '';

    //Uses in-line styles to appear correctly in HTMl emails
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                width: '300px',
                marginBottom: '2em',
                border: '0.5px solid black'
            }}
        >
            <img src={image} alt={donation.model ?? ''} style={thumbnailStyles} />
            <div>
                <p>
                    <b>{donation.brand}</b>
                </p>
                <p>{donation.model}</p>
            </div>
        </div>
    );
}
