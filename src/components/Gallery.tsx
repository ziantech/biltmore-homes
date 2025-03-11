"use client";

import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";

export default function Gallery({ images }: { images: string[] }) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    return (
        <Box id="gallery" sx={{ width: "100%", mt: 4, textAlign: "center" }}>
            <Typography variant="h4" fontWeight="bold" mb={2}>
                Our Facility
            </Typography>

            {images.length > 0 ? (
                <>
                    {/* Swiper Carousel */}
                    <Swiper
                        modules={[Navigation, Pagination]}
                        navigation
                        pagination={{ clickable: true }}
                        spaceBetween={20}
                        slidesPerView={1}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                        style={{ maxWidth: "90%", margin: "0 auto" }}
                    >
                        {images.map((img, index) => (
                            <SwiperSlide key={index} onClick={() => setLightboxIndex(index)}>
                                <Box
                                    component="img"
                                    src={img}
                                    alt={`Gallery image ${index + 1}`}
                                    sx={{
                                        width: "100%",
                                        height: 250,
                                        objectFit: "cover",
                                        borderRadius: 2,
                                        cursor: "pointer",
                                        transition: "transform 0.3s",
                                        "&:hover": { transform: "scale(1.05)" },
                                    }}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Lightbox Modal */}
                    {lightboxIndex !== null && (
                        <Lightbox
                            mainSrc={images[lightboxIndex]}
                            nextSrc={images[(lightboxIndex + 1) % images.length]}
                            prevSrc={images[(lightboxIndex + images.length - 1) % images.length]}
                            onCloseRequest={() => setLightboxIndex(null)}
                            onMovePrevRequest={() =>
                                setLightboxIndex((lightboxIndex + images.length - 1) % images.length)
                            }
                            onMoveNextRequest={() =>
                                setLightboxIndex((lightboxIndex + 1) % images.length)
                            }
                        />
                    )}
                </>
            ) : (
                <Typography variant="body1" color="textSecondary">
                    No images available.
                </Typography>
            )}
        </Box>
    );
}
