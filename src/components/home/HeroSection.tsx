// import React from "react";

// const HeroSection: React.FC = () => {
//   return (
//     <section
//       id="hero"
//       className="relative h-screen bg-cover bg-center flex items-center justify-center"
//       style={{
//         backgroundImage: "url('https://i.ibb.co.com/zT89JVH9/heropic.png')",
//       }}
//     >
//       {/* Overlay */}
//       <div className="absolute inset-0 bg-black bg-opacity-60"></div>

//       {/* Content */}
//       <div className="relative z-10 text-center text-white px-4">
//         <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
//           Welcome to <span className="text-[#EF451C]">Yummy Food</span>
//         </h1>
//         <p className="text-lg md:text-Fxl max-w-2xl mx-auto text-gray-200 mb-6">
//           Fresh, Fast & Flavorful — delivering happiness to your doorstep.
//         </p>
//         <a
//           href="#menu"
//           className="inline-block px-8 py-4 bg-[#EF451C] text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300"
//         >
//           Order Now 🍕
//         </a>
//       </div>
//     </section>
//   );
// };

// export default HeroSection;










// new banner 
// to do: change banner image  


import React from "react";
import bannerImg from "../../assets/home/hero-2.webp"

const Banner: React.FC = () => {
  return (
    <section className="bg-[#ffe5df]/10 py-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-8 px-4">
        {/* Left Side */}
        <div className="text-center md:text-left space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            <span className="text-[#ef451c]">Fast, Fresh</span> <br />
            <span className="text-[#ef451c]">&amp; Right</span>{" "}
            <span className="text-[#363636]">To Your Door</span>
          </h1>

          <p className="text-[#7c848a]">
            Order dishes from favorite restaurants near you.
          </p>

          {/* Search Bar */}
          <div className="flex w-full max-w-lg mx-auto md:mx-0">
            <input
              type="text"
              placeholder="Enter your location"
              className="flex-1 px-4 py-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ef451c]/50"
            />
            <button className="bg-[#ef451c] hover:bg-[#c23312] text-white px-6 py-3 rounded-r-lg font-medium transition">
              Find Food
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex justify-center md:justify-end">
          <img
            src={bannerImg}
            alt="App mockup"
            className="w-full max-w-xs md:max-w-md object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default Banner;




