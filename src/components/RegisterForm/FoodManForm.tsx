"use client";
import React, { useState } from "react";

const FoodManForm: React.FC = () => {
  const [step, setStep] = useState<number>(1);

  // Step Change
  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep((prev) => prev + 1);
  };

  const handlePrev = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("✅ Registration Submitted Successfully!");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#fdfdfd] px-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-[10px] p-8 border border-[#3636361a]">
        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-8">
          <div
            className={`flex-1 h-2 rounded-full mr-2 ${
              step >= 1 ? "bg-[#EF451C]" : "bg-[#e5e7eb]"
            }`}
          ></div>
          <div
            className={`flex-1 h-2 rounded-full mr-2 ${
              step >= 2 ? "bg-[#EF451C]" : "bg-[#e5e7eb]"
            }`}
          ></div>
          <div
            className={`flex-1 h-2 rounded-full ${
              step >= 3 ? "bg-[#EF451C]" : "bg-[#e5e7eb]"
            }`}
          ></div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <>
            <h2 className="text-[28px] font-bold text-[#363636] mb-6 text-center">
              Earn with Your Bike, Car or Cycle
            </h2>
            <form onSubmit={handleNext} className="space-y-5">
              {/* Vehicle Type */}
              <div>
                <label className="block text-[16px] font-medium text-[#363636] mb-2">
                  Vehicle Type
                </label>
                <select className="w-full px-4 py-3 border border-[#3636361a] rounded-[10px] focus:ring-2 focus:ring-[#EF451C]">
                  <option>Bike</option>
                  <option>Car</option>
                  <option>Cycle</option>
                </select>
              </div>

              {/* First & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  defaultValue="Yousuf" // demo value
                  className="px-4 py-3 border border-[#3636361a] rounded-[10px] focus:ring-2 focus:ring-[#EF451C]"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  defaultValue="Ali" // demo value
                  className="px-4 py-3 border border-[#3636361a] rounded-[10px] focus:ring-2 focus:ring-[#EF451C]"
                />
              </div>

              {/* Mobile Number */}
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                defaultValue="01754954385" // demo value
                className="w-full px-4 py-3 border border-[#3636361a] rounded-[10px] focus:ring-2 focus:ring-[#EF451C]"
              />

              {/* City */}
              <select className="w-full px-4 py-3 border border-[#3636361a] rounded-[10px] focus:ring-2 focus:ring-[#EF451C]">
                <option>Select City</option>
                <option>Dhaka</option>
                <option>Chittagong</option>
                <option>Khulna</option>
                <option>Rajshahi</option>
              </select>

              {/* Next Button */}
              <button
                type="submit"
                className="w-full py-3 bg-[#EF451C] text-white text-[20px] font-semibold rounded-[10px] shadow-md hover:bg-[#d93e18] transition"
              >
                Next Step →
              </button>
            </form>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <h2 className="text-[28px] font-bold text-[#363636] mb-6 text-center">
              Complete Your Personal Information
            </h2>
            <form onSubmit={handleNext} className="space-y-5">
              {/* Full Name */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  defaultValue="Yousuf" // demo value
                  className="px-4 py-3 border border-[#3636361a] rounded-[10px]"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  defaultValue="Ali" // demo value
                  className="px-4 py-3 border border-[#3636361a] rounded-[10px]"
                />
              </div>

              <input
                type="tel"
                placeholder="Mobile Number"
                defaultValue="01754954385" // demo value
                className="w-full px-4 py-3 border border-[#3636361a] rounded-[10px]"
              />

              <input
                type="date"
                className="w-full px-4 py-3 border border-[#3636361a] rounded-[10px]"
              />

              <select className="w-full px-4 py-3 border border-[#3636361a] rounded-[10px]">
                <option>Select City</option>
                <option>Dhaka</option>
                <option>Chittagong</option>
              </select>

              {/* Services */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" /> Bike Ride
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" /> Food Delivery
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" /> Parcel Delivery
                </label>
              </div>

              {/* NID Upload */}
              <input
                type="file"
                className="w-full border border-[#3636361a] p-2 rounded-[10px]"
              />

              {/* Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={handlePrev}
                  className="px-6 py-3 bg-[#7c848a] text-white rounded-[10px] hover:bg-[#5a6066] transition"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#EF451C] text-white rounded-[10px] hover:bg-[#d93e18] transition"
                >
                  Next Step →
                </button>
              </div>
            </form>
          </>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <>
            <h2 className="text-[28px] font-bold text-[#363636] mb-6 text-center">
              Vehicle Information
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <select className="px-4 py-3 border border-[#3636361a] rounded-[10px]">
                  <option>Select Brand</option>
                </select>
                <select className="px-4 py-3 border border-[#3636361a] rounded-[10px]">
                  <option>Select Model</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Registration Number"
                defaultValue="58456684585" // demo NID/Registration
                className="w-full px-4 py-3 border border-[#3636361a] rounded-[10px]"
              />

              <input
                type="text"
                placeholder="Tax Token Number"
                className="w-full px-4 py-3 border border-[#3636361a] rounded-[10px]"
              />

              <input
                type="text"
                placeholder="Fitness Number"
                className="w-full px-4 py-3 border border-[#3636361a] rounded-[10px]"
              />

              {/* Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={handlePrev}
                  className="px-6 py-3 bg-[#7c848a] text-white rounded-[10px] hover:bg-[#5a6066] transition"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#EF451C] text-white rounded-[10px] hover:bg-[#d93e18] transition"
                >
                  Submit ✔
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default FoodManForm;
