import React from 'react';

const HeroSection: React.FC = () => {
    return (
        <section
            id="hero" // Added an ID for potential navigation
            className="relative bg-cover bg-center h-screen flex items-center justify-center pt-20"
            style={{
                backgroundImage:
                    "url('https://i.ibb.co/vCXGWnx3/herosection.jpg')",
            }}
        >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>

            {/* Content container */}
            <div className="relative z-10 text-center text-white px-4">
                {/* Main headline with updated gradient and font size */}
                <h1 className="text-[48px] md:text-[64px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 drop-shadow-lg">
                    Taste the Flavor of Life
                </h1>
                {/* Subtitle with updated text color and font size */}
                <p className="mt-4 text-[16px] md:text-[20px] max-w-2xl text-gray-200">
                    Discover a world of delicious food, crafted with passion and served
                    with love. Explore our menu and find your new favorite dish today.
                </p>
                {/* Call-to-action button with updated styles */}
                <a
                    href="#gallery" // This will scroll to the gallery section
                    className="mt-8 inline-block px-8 py-4 bg-[#EF451C] text-white text-[16px] font-bold rounded-[10px] shadow-lg hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300"
                >
                    View Our Gallery
                </a>
            </div>
        </section>
    );
};

export default HeroSection;

