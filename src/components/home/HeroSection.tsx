import React from "react";

const HeroSection: React.FC = () => {
  return (
    <section
      id="hero"
      className="relative h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: "url('https://i.ibb.co.com/zT89JVH9/heropic.png')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
          Welcome to <span className="text-[#EF451C]">Yummy Food</span>
        </h1>
        <p className="text-lg md:text-Fxl max-w-2xl mx-auto text-gray-200 mb-6">
          Fresh, Fast & Flavorful — delivering happiness to your doorstep.
        </p>
        <a
          href="#menu"
          className="inline-block px-8 py-4 bg-[#EF451C] text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300"
        >
          Order Now 🍕
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
