import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ImgCarouselProps {
  images: string[];
  alt?: string;
  width?: string;
  height?: string;
}

export const ImgCarousel: React.FC<ImgCarouselProps> = ({
  images,
  alt,
  width = "100%",
  height = "100%",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevImage = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);

  return (
    <div
      className="relative mx-auto"
      style={{ width, height }}
      role="region"
      aria-label="Image Carousel"
    >
      {/* Image slides */}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={alt || `Carousel image ${currentIndex + 1}`}
          className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>

      {/* Vertically centered prev/next buttons */}
      <button
        onClick={prevImage}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-500"
        aria-label="Previous Slide"
      >
        ‹
      </button>
      <button
        onClick={nextImage}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-500"
        aria-label="Next Slide"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 w-full flex justify-center space-x-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full ${
              idx === currentIndex ? "bg-white" : "bg-white/50"
            }`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            aria-current={idx === currentIndex ? "true" : undefined}
          />
        ))}
      </div>

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite">
        Slide {currentIndex + 1} of {images.length}
      </div>
    </div>
  );
};
