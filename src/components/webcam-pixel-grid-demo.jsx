import React, { useState } from "react";
import { PixelGrid } from "@/components/ui/webcam-pixel-grid";
import { motion, AnimatePresence } from "framer-motion";

export default function WebcamPixelGridDemo() {
  const [showContent, setShowContent] = useState(true);
  const [showLoader, setShowLoader] = useState(false);

  const handleVisitPortfolio = () => {
    setShowContent(false);

    setTimeout(() => {
      setShowLoader(true);
    }, 500);

    setTimeout(() => {
      window.location.href = 'https://swastiksharma.framer.website/';
    }, 1000);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ backgroundColor: '#cfcfcfff' }}>
      {/* Pixel grid background */}
      <div className="absolute inset-0">
        <PixelGrid
          gridCols={60}
          gridRows={40}
          maxElevation={15}
          elevationSmoothing={0.08}
          backgroundColor="#cfcdc8ff"
          gapRatio={0.05}
          borderColor="#1E1E1E"
          borderOpacity={0.05}
          className="w-full h-full"
        />
      </div>

      {/* Soft gradient overlay for text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(245,242,235,0.6) 0%, rgba(245,242,235,0.1) 70%, transparent 100%)',
        }}
      />

      {/* Hero content */}
      <div
        className="relative z-10 flex h-full flex-col items-center justify-center px-4">

        <AnimatePresence mode="wait">
          {showContent && (
            <motion.div
              key="hero-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }}
              exit={{ opacity: 0, y: -40, transition: { duration: 0.5, ease: "easeIn" } }}
              className="max-w-4xl text-center"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm backdrop-blur-sm"
                style={{
                  backgroundColor: '#cad9e0ff',
                  color: '#1E1E1E',
                  border: '2px solid #1E1E1E',
                  boxShadow: '3px 3px 0px 0px #1E1E1E',
                  fontWeight: 600,
                }}
              >
                Software Developer &bull; Programmer
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl md:text-8xl"
                style={{ color: '#1E1E1E' }}
              >
                Swastik Sharma
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7 }}
                className="mx-auto mb-10 max-w-2xl text-base sm:text-xl"
                style={{ color: '#1E1E1E', opacity: 0.6 }}
              >
                Turning coffee and complex logic into high-performance software. Explore my profile, projects, and everything in between.
              </motion.p>

              {/* Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.7 }}
                className="flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleVisitPortfolio}
                  className="group relative inline-flex h-12 items-center justify-center gap-2 rounded-full px-8 text-base font-semibold transition-all cursor-pointer"
                  style={{
                    backgroundColor: '#1E1E1E',
                    color: '#F5F2EB',
                    border: '2px solid #1E1E1E',
                    boxShadow: '4px 4px 0px 0px #1E1E1E',
                  }}
                >
                  Visit My Portfolio
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loader spinner */}
        {showLoader && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center"
          >
            <div
              className="w-12 h-12 rounded-full animate-spin"
              style={{
                borderWidth: '4px',
                borderStyle: 'solid',
                borderTopColor: '#1E1E1E',
                borderBottomColor: '#D2D0FB',
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
              }}
            ></div>
          </motion.div>
        )}
      </div>
    </div>
  );
}