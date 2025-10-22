/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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

// Import your project hooks
import useAuth from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useUserRole from "../../hooks/useUserRole";

// Define the type for our form data
type PartnerFormData = {
  companyName: string;
  ownerName: string;
  mobile: string;
  tradeLicense: string;
  email: string;
  password?: string; // Optional for logged-in users
};

const PartnerForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, createUser, updateUser, loading, setLoading } = useAuth();
  const axiosPublic = useAxios();
  const axiosSecure = useAxiosSecure();
  const { isRestaurantOwner } = useUserRole();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PartnerFormData>();

  const [showPassword, setShowPassword] = useState(false);

  
  // Show warning if logged-in user is already a restaurant owner
  useEffect(() => {
    if (user && isRestaurantOwner) {
      toast.warning("You are already registered as a restaurant owner.");
      navigate("/");
    }
  }, [user, isRestaurantOwner, navigate]);
  


  // Auto-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setValue("ownerName", user.displayName || "");
      setValue("email", user.email || "");
      if (user.phoneNumber) {
        setValue("mobile", user.phoneNumber);
      }
    }
  }, [user, setValue]);

  const onSubmit = async (data: PartnerFormData) => {
    setLoading(true);

    // ✅ PREPARE DATA: This data goes to the 'restaurants' collection
    const restaurantData = {
      name: data.companyName, // Restaurant name is the Company Name
      email: data.email,      // Restaurant email
      phone: data.mobile,
      category: 'restaurant', 
      cuisine: [],            // Default cuisine
      // Backend model 'Restaurant.js' will set status to 'pending' by default
    };

    try {
      if (user) {
        // --- CASE 2: USER IS LOGGED IN (UPGRADE FLOW) ---

        // 1. Data for 'users' collection profile update
        const profileUpdateData = {
          phone: data.mobile,
          companyName: data.companyName,
          tradeLicense: data.tradeLicense,
        };

        // 2. Data for 'users' collection role update
        const roleUpdateData = {
          role: "restaurant_owner",
        };
        
        // 3. ✅ API CALLS: Send all 3 requests concurrently
        await Promise.all([
          // Update user profile (PATCH /users/:email/profile)
          axiosSecure.patch(`/users/${user.email}/profile`, profileUpdateData),
          // Update user role (PATCH /users/:email/role)
          axiosSecure.patch(`/users/${user.email}/role`, roleUpdateData),
          // Create new restaurant entry (POST /restaurants)
          axiosSecure.post("/restaurants", restaurantData)
        ]);
        
        toast.success(
          `Thank you, ${data.ownerName}! Your partner application has been submitted.`
        );
        navigate("/");

      } else {
        // --- CASE 1: NEW USER REGISTRATION ---

        // 1. Create Firebase User
        await createUser(data.email, data.password!);

        // 2. Update Firebase Profile
        await updateUser({ displayName: data.ownerName });

        // 3. Data for 'users' collection
        const partnerInfo = {
          name: data.ownerName,
          email: data.email,
          phone: data.mobile,
          companyName: data.companyName,
          tradeLicense: data.tradeLicense,
          role: "restaurant_owner", // Backend 'User.js' model sets status to 'pending'
        };

        // 4. ✅ API CALLS: Send both requests concurrently
        await Promise.all([
          // Create new user (POST /users)
          axiosPublic.post("/users", partnerInfo),
          // Create new restaurant entry (POST /restaurants)
          axiosPublic.post("/restaurants", restaurantData)
        ]);

        toast.success(
          `Welcome, ${data.ownerName}! Your partner application has been submitted.`
        );
        navigate("/");
      }
    } catch (err: any) {
      console.error("Partner form submission error:", err.response?.data || err.message);
      if (err.response?.data?.message.includes("Restaurant with this name already exists")) {
        toast.error("A restaurant with this company name already exists.");
      } else if (err.response?.data?.message.includes("User with this email already exists")) {
        toast.error("This email is already registered. Please log in.");
      } else {
        toast.error(err.message || "Something went wrong during registration.");
      }
    } finally {
      setLoading(false);
    }
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
            {user
              ? "Please fill in the details below to apply for partnership."
              : "Fill out the form below to start your journey with us."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Two-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Company Name
              </label>
              <div className="relative">
                <Building2
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="text"
                  {...register("companyName", {
                    required: "Company name is required",
                  })}
                  placeholder="Your official company name"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EF451C]"
                />
              </div>
              {errors.companyName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Owner’s Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="text"
                  {...register("ownerName", {
                    required: "Owner's name is required",
                  })}
                  placeholder="Full name of the owner"
                  disabled={!!user}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EF451C] disabled:bg-slate-100"
                />
              </div>
              {errors.ownerName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.ownerName.message}
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="tel"
                  {...register("mobile", {
                    required: "Mobile number is required",
                  })}
                  placeholder="Contact mobile number"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EF451C]"
                />
              </div>
              {errors.mobile && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.mobile.message}
                </p>
              )}
            </div>

            {/* Trade License Number */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Trade License Number
              </label>
              <div className="relative">
                <ScrollText
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="text"
                  {...register("tradeLicense", {
                    required: "Trade license is required",
                  })}
                  placeholder="Valid trade license number"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EF451C]"
                />
              </div>
              {errors.tradeLicense && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.tradeLicense.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  placeholder="Your primary email address"
                  disabled={!!user}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EF451C] disabled:bg-slate-100"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            {!user && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EF451C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#EF451C] text-white text-lg font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EF451C] disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </div>
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </form>

        {/* Already Registered */}
        {!user && (
          <p className="mt-8 text-center text-sm text-slate-500">
            Already have a partner account?{" "}
            <Link
              to="/auth/log-in"
              className="font-semibold text-[#EF451C] hover:underline"
            >
              Login here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default PartnerForm;