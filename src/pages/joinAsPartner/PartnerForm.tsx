"use client";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Building2,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ScrollText,
} from "lucide-react";

const PartnerForm: React.FC = () => {
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "Code Warriors Ltd",
    ownerName: "Code Warriors",
    mobile: "01712345678",
    tradeLicense: "99999999999999",
    email: "codewarriors@email.com",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted Data:", formData);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl p-8 md:p-12">
        {/* Form Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-800">
            Become a YummyGo Partner
          </h1>
          <p className="text-slate-500 mt-2">
            Fill out the form below to start your journey with us.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Two-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Company Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  name="companyName"
                  placeholder="Your official company name"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EF451C]"
                  required
                />
              </div>
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Owner’s Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  name="ownerName"
                  placeholder="Full name of the owner"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EF451C]"
                  required
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="tel"
                  name="mobile"
                  placeholder="Contact mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EF451C]"
                  required
                />
              </div>
            </div>

            {/* Trade License Number */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Trade License Number
              </label>
              <div className="relative">
                <ScrollText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  name="tradeLicense"
                  placeholder="Valid trade license number"
                  value={formData.tradeLicense}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EF451C]"
                  required
                />
              </div>
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  name="email"
                  placeholder="Your primary email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EF451C]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EF451C]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 bg-[#EF451C] text-white text-lg font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EF451C]"
            >
              Submit Application
            </button>
          </div>
        </form>

        {/* Already Registered */}
        <p className="mt-8 text-center text-sm text-slate-500">
          Already have a partner account?{" "}
          <a href="/partner-login" className="font-semibold text-[#EF451C] hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default PartnerForm;