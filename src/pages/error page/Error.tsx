import React from "react";
import { IoMdHome } from "react-icons/io";
import Navbar from "../../components/shared/navbar/Navbar";
import errorImg from "../../assets/error/error.svg";
import { Link } from "react-router";
import { CartProvider } from "../../contextsProvider/CartContext";

const Error: React.FC = () => {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-orange-50">
        {/* Navbar */}
        <Navbar />

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-6 py-12 lg:py-16 text-center">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-xl max-w-lg w-full mx-4">
          {/* Image */}
          <div className="relative mb-8">
            <div className="absolute -inset-6 bg-orange-100 rounded-full -z-10 animate-pulse" />
            <img
              src={errorImg}
              alt="Error illustration"
              loading="lazy"
              className="w-64 h-64 mx-auto drop-shadow-lg"
            />
          </div>

          {/* Title */}
          <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent py-4">
            Oops! Something Went Wrong
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            The page you're looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>

          {/* Button */}
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-transform duration-300 hover:-translate-y-1"
          >
            <IoMdHome className="h-5 w-5 mr-2" />
            Go to Home
          </Link>
        </div>
      </main>
    </div>
    </CartProvider>
  );
};

export default Error;
