"use client"
import React, { useState, useEffect } from 'react';

const FooterCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageError, setImageError] = useState({});
    
    const images = [
        '/images/footer-carousel-1.png',
        '/images/footer-carousel-2.png',
        '/images/footer-carousel-3.png'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        }, 7000); // 7 секунд тутамд солигдоно

        return () => clearInterval(interval);
    }, []);

    const handleImageError = (index) => {
        setImageError(prev => ({ ...prev, [index]: true }));
    };

    return (
        <div className="footer-carousel">
            <div className="carousel-container">
                <div className="slides-wrapper">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
                            style={{
                                display: index === currentIndex ? 'flex' : 'none'
                            }}
                        >
                        {imageError[index] ? (
                            <div className="placeholder-box">
                                <div className="placeholder-content">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                        <polyline points="21 15 16 10 5 21"/>
                                    </svg>
                                </div>
                            </div>
                            ) : (
                                <div className="image-wrapper">
                                    <img
                                        src={image}
                                        alt={`Footer Info ${index + 1}`}
                                        className="carousel-image"
                                        onError={() => handleImageError(index)}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .footer-carousel {
                    width: 100%;
                    position: relative;
                    z-index: 1;
                }
                
                .carousel-container {
                    position: relative;
                    width: 100%;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    overflow: hidden;
                }

                .slides-wrapper {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .carousel-slide {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 10px;
                }
                
                .carousel-slide.active {
                    animation: fadeIn 1.5s ease-in-out;
                }

                .image-wrapper {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                }
                
                .carousel-image {
                    max-width: 300px;
                    width: auto;
                    height: 80px;
                    object-fit: contain;
                    object-position: left center;
                    display: block;
                    margin: 0;
                }
                
                .placeholder-box {
                    width: 100%;
                    height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    border: none;
                }
                
                .placeholder-content {
                    text-align: center;
                    color: #d1d5db;
                    opacity: 0.5;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @media (max-width: 768px) {
                    .carousel-container {
                        height: 70px;
                    }

                    .carousel-image {
                        height: 60px;
                    }
                }
            `}</style>
        </div>
    );
};

export default FooterCarousel;

