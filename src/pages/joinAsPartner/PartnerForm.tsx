"use client";
import React from "react";
import { useNavigate } from "react-router";

const PartnerForm: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: "url('/joinaspartner.png')" }}
    >
      {/* Transparent Form Card */}
      <div className="relative w-full max-w-md backdrop-blur-md shadow-lg rounded-[10px] p-8 border border-[#3636361a]">
        {/* Title */}
        <h2 className="text-[32px] font-bold text-[#363636] mb-6 text-center">
          Join as a Partner
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Company Name */}
          <div>
            <label className="block text-[16px] font-medium text-[#363636] mb-2">
              Company Name
            </label>
            <input
              type="text"
              placeholder="Enter company name"
              defaultValue="Code Warriors Ltd"
              className="w-full px-4 py-3 border border-[#3636361a] rounded-[10px] text-[16px] focus:outline-none focus:ring-2 focus:ring-[#EF451C]"
              required
            />
          </div>

          {/* Owner Name */}
          <div>
            <label className="block text-[16px] font-medium text-[#363636] mb-2">
              Owner’s Name
            </label>
            <input
              type="text"
              placeholder="Enter owner name"
              defaultValue="Code Warriors"
              className="w-full px-4 py-3 border border-[#3636361a] rounded-[10px] text-[16px] focus:outline-none focus:ring-2 focus:ring-[#EF451C]"
              required
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-[16px] font-medium text-[#363636] mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              placeholder="Enter mobile number"
              defaultValue="01712345678"
              className="w-full px-4 py-3 border border-[#3636361a] rounded-[10px] text-[16px] focus:outline-none focus:ring-2 focus:ring-[#EF451C]"
              required
            />
          </div>

          {/* Trade License Number */}
          <div>
            <label className="block text-[16px] font-medium text-[#363636] mb-2">
              Trade License Number
            </label>
            <input
              type="text"
              placeholder="Enter trade license no."
              defaultValue="99999999999999"
              className="w-full px-4 py-3 border border-[#3636361a] rounded-[10px] text-[16px] focus:outline-none focus:ring-2 focus:ring-[#EF451C]"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[16px] font-medium text-[#363636] mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              defaultValue="CodeWarriors@email.com"
              className="w-full px-4 py-3 border border-[#3636361a] rounded-[10px] text-[16px] focus:outline-none focus:ring-2 focus:ring-[#EF451C]"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[16px] font-medium text-[#363636] mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-[#3636361a] rounded-[10px] text-[16px] focus:outline-none focus:ring-2 focus:ring-[#EF451C]"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[16px] font-medium text-[#363636] mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm your password"
              className="w-full px-4 py-3 border border-[#3636361a] rounded-[10px] text-[16px] focus:outline-none focus:ring-2 focus:ring-[#EF451C]"
              required
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-3 bg-[#EF451C] text-white text-[20px] font-semibold rounded-[10px] shadow-md hover:bg-[#d93e18] transition"
          >
            Join Now
          </button>
        </form>

        {/* Already Registered */}
        <p className="mt-6 text-center text-[16px] text-[#7c848a]">
          Already have an account?{" "}
          <a href="/partner-login" className="text-[#EF451C] font-medium hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default PartnerForm;
