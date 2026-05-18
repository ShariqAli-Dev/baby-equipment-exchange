'use client';

import { useState, useEffect } from 'react';
import { Box, Dialog, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

type Props = { images: string[]; alt: string; aspectRatio?: string };

export default function ImageGallery({ images, alt, aspectRatio = '4/3' }: Props) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    useEffect(() => { setActiveIndex(0); }, [images]);

    if (!images || images.length === 0) return null;

    const safeIndex = activeIndex < images.length ? activeIndex : 0;
    const next = () => setActiveIndex((i) => (i + 1) % images.length);
    const prev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);

    return (
        <Box sx={{ mb: 2, maxWidth: 480, mx: 'auto' }}>
            <Box
                onClick={() => setIsLightboxOpen(true)}
                sx={{
                    aspectRatio,
                    maxHeight: 360,
                    borderRadius: 2,
                    border: '1px solid #e5e5e5',
                    overflow: 'hidden',
                    cursor: 'zoom-in',
                    bgcolor: '#fafafa',
                    position: 'relative',
                    '& img': {
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        transition: 'opacity 150ms ease',
                        display: 'block'
                    }
                }}
            >
                <img key={images[safeIndex]} src={images[safeIndex]} alt={alt} />
            </Box>

            {images.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1, overflowX: 'auto', pb: 0.5, justifyContent: 'center' }}>
                    {images.map((src, i) => (
                        <Box
                            key={src}
                            onClick={() => setActiveIndex(i)}
                            sx={{
                                width: 64,
                                height: 64,
                                flexShrink: 0,
                                borderRadius: 1.5,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                border: i === safeIndex ? '2px solid #3d9991' : '2px solid transparent',
                                transition: 'transform 120ms ease, box-shadow 120ms ease',
                                '&:hover': { transform: 'translateY(-1px)', boxShadow: 2 },
                                '& img': { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
                            }}
                        >
                            <img src={src} alt={`${alt} ${i + 1}`} />
                        </Box>
                    ))}
                </Box>
            )}

            <Dialog
                open={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
                maxWidth="lg"
                fullWidth
                onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') next();
                    else if (e.key === 'ArrowLeft') prev();
                }}
                PaperProps={{ sx: { bgcolor: 'rgba(0,0,0,0.92)', boxShadow: 'none' } }}
            >
                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', p: 2 }}>
                    {images.length > 1 && (
                        <Typography sx={{ position: 'absolute', top: 12, left: 16, color: '#fff', fontSize: 14 }}>
                            {safeIndex + 1} / {images.length}
                        </Typography>
                    )}
                    <IconButton onClick={() => setIsLightboxOpen(false)} sx={{ position: 'absolute', top: 8, right: 8, color: '#fff' }}>
                        <CloseIcon />
                    </IconButton>
                    {images.length > 1 && (
                        <>
                            <IconButton
                                onClick={prev}
                                sx={{
                                    position: 'absolute', left: 8,
                                    bgcolor: '#fff', color: '#3d9991',
                                    width: 48, height: 48,
                                    '&:hover': { bgcolor: '#f0f0f0' }
                                }}
                            >
                                <ChevronLeftIcon />
                            </IconButton>
                            <IconButton
                                onClick={next}
                                sx={{
                                    position: 'absolute', right: 8,
                                    bgcolor: '#fff', color: '#3d9991',
                                    width: 48, height: 48,
                                    '&:hover': { bgcolor: '#f0f0f0' }
                                }}
                            >
                                <ChevronRightIcon />
                            </IconButton>
                        </>
                    )}
                    <img
                        src={images[safeIndex]}
                        alt={alt}
                        style={{ maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain' }}
                    />
                </Box>
            </Dialog>
        </Box>
    );
}
