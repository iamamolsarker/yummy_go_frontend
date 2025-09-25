import React from "react";
import { Mail, Lock } from "lucide-react";

const PartnerLoginForm = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f9f9f9]">
      <div className="bg-white/90 backdrop-blur-md p-10 rounded-[10px] shadow-lg w-full max-w-md">
        {/* Title */}
        <h2 className="text-[32px] font-bold text-[#363636] mb-6 text-center">
          Partner Login
        </h2>

        {/* Form */}
        <form className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-[16px] font-medium text-[#7c848a] mb-2">
              Email Address
            </label>
            <div className="flex items-center border border-[#3636361a] rounded-[10px] px-4">
              <Mail className="text-[#7c848a]" size={20} />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-3 bg-transparent outline-none text-[#363636] text-[16px]"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[16px] font-medium text-[#7c848a] mb-2">
              Password
            </label>
            <div className="flex items-center border border-[#3636361a] rounded-[10px] px-4">
              <Lock className="text-[#7c848a]" size={20} />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-3 py-3 bg-transparent outline-none text-[#363636] text-[16px]"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-[#EF451C] hover:bg-[#d63e18] text-white font-semibold py-3 px-6 rounded-[10px] text-[18px] transition-colors duration-300"
          >
            Login
          </button>

          {/* Bottom Links */}
          <div className="flex justify-between items-center text-[16px] mt-4">
            <a href="#" className="text-[#EF451C] hover:underline">
              Forgot Password?
            </a>
            <a href="/partner-form" className="text-[#7c848a] hover:text-[#363636] hover:underline">
              Create Account
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartnerLoginForm;
