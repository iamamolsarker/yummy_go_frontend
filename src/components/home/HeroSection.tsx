import React from "react";
import { Search, MapPin } from "lucide-react";
import bannerImg from "../../assets/home/Delivery-man-removebg.png";

const HeroSection: React.FC = () => {
  return (
    <section className="bg-[#ffe5df]/40 min-h-screen flex items-center py-12">
      <div className="container mx-auto w-[90%]">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
          {/* Left Side - Content */}
          <div className="text-center lg:text-left space-y-6">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
              <span className="text-[#ef451c] block">Fast, Fresh</span>
              <span className="text-[#ef451c]">& Right </span>
              <span className="text-gray-800">To Your Door</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-lg mx-auto lg:mx-0">
              Order dishes from favorite restaurants near you.
            </p>

            {/* Search Bar */}
            <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center">
                <div className="flex items-center flex-1 px-2 py-1.5 md:px-4 md:py-3">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mr-1.5  md:mr-3" />
                  <input
                    type="text"
                    placeholder="Enter your delivery address..."
                    className="flex-1 outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
                <button className="bg-[#ef451c] hover:bg-[#d63e18] text-white px-3 md:px-8 py-3 rounded-xl font-semibold flex items-center gap-1 md:gap-2 transition-colors duration-300">
                  <Search className="w-4 h-4 md:w-5 md:h-5" />
                  Find Food
                </button>
              </div>
            </div>
            <div className="pt-5">
              <p className="text-gray-600 text-xl">
                Are you a Restaurant Owner?{" "}
                <span className="text-[#ef451c] cursor-pointer font-medium underline">Join as a Partner</span>
              </p>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="flex justify-center lg:justify-end relative">
            {/* Enhanced Image with better styling */}
            <div className="relative">
              {/* Subtle background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#ef451c]/10 to-transparent rounded-3xl transform rotate-3"></div>
              
              <img
                src={bannerImg}
                alt="Delivery person with food"
                className="relative w-full max-w-lg lg:max-w-xl xl:max-w-2xl object-contain transform hover:scale-105 transition-transform duration-500 drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;




