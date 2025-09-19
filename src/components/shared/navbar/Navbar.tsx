import React from "react";
import { FiShoppingCart } from "react-icons/fi";
import logo from "/yummy-go-logo.png";

const Navbar: React.FC = () => {
  return (
    <nav className="shadow-md sticky top-0 z-99 bg-[#ffe5df] backdrop-blur-3xl">
      <div className="container mx-auto flex items-center justify-between py-1.5  px-3 ">
        {/* Logo + Brand Name */}
        <div className="flex items-center gap-2">
          <div>
            <img src={logo} alt="" className="h-14 " />
          </div>
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold text-[#EF451C]">Yummy  Go</h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <button className="text-2xl text-gray-700 hover:text-[#ef451c]">
            <FiShoppingCart />
          </button>

          {/* Sign in button */}
          <button className="px-4 py-1 border border-[#ef451c] rounded-md text-[#ef451c] hover:bg-[#ffe5df] transition">
            Sign in
          </button>

          {/* Sign up button */}
          <button className="px-4 py-1 bg-[#ef451c] text-white rounded-md hover:bg-[#c23312] transition">
            Sign up
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
