/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash,
  FaUtensils
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuth from "../hooks/useAuth";
import SocialLogin from "./SocialLogin";
import useAxios from "../hooks/useAxios";

// Updated type with firstName and lastName
type RegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// Explicit type for password strength checks
type PasswordChecks = {
    length?: boolean;
    lowercase?: boolean;
    uppercase?: boolean;
    number?: boolean;
    special?: boolean;
};


const UserReg: React.FC = () => {
  const { createUser, updateUser, loading, setLoading } = useAuth();
  const axiosPublic = useAxios();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength checker with explicit return type
  const getPasswordStrength = (password: string): { strength: number; label: string; color: string; checks: PasswordChecks } => {
    if (!password) return { strength: 0, label: "", color: "text-gray-400", checks: {} };
    let strength = 0;
    const checks: PasswordChecks = { // Use the defined type
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    strength = Object.values(checks).filter(Boolean).length;
    const strengthPercentage = (strength / 5) * 100; // Use 5 checks
    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const colors = ["text-red-500", "text-orange-500", "text-yellow-500", "text-blue-500", "text-green-500"];
    return {
      strength: strengthPercentage,
      label: labels[Math.min(strength, 5) - 1] || "",
      color: colors[Math.min(strength, 5) - 1] || "text-gray-400",
      checks
    };
  };

  const password = watch("password");
  const passwordStrength = getPasswordStrength(password || "");

  // onSubmit logic remains the same
  const onSubmit: SubmitHandler<RegisterForm> = async (data) => {
    setLoading(true);
    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();

    try {
      const userCredential = await createUser(data.email, data.password);
      console.log("Firebase user created:", userCredential?.user?.uid);

      if (fullName) {
        await updateUser({ displayName: fullName });
        console.log("Firebase profile updated with name:", fullName);
      }

      const userInfo = { name: fullName, email: data.email, role: "user", status: "active" };

      try {
        console.log("Attempting to save user to database:", userInfo);
        const userRes = await axiosPublic.post("/users", userInfo);
        console.log("User saved to database:", userRes.data);
        toast.success(`Welcome to Yummy Go, ${data.firstName}! Registration successful.`);
        navigate("/");

      } catch (dbError: any) {
        console.error("Error saving user to database:", dbError.response?.data || dbError.message);
        toast.error(`Account created, but failed to save profile: ${dbError.response?.data?.message || dbError.message}.`);
      }

    } catch (authError: any) {
      console.error("Firebase Authentication Error:", authError);
      if (authError.code === 'auth/email-already-in-use') {
        toast.error("This email is already registered. Please log in.");
      } else {
        toast.error(authError.message || "Something went wrong during registration.");
      }
    } finally {
      setLoading(false);
    }
  };


  const handleReturnHome = () => {
    navigate("/")
  }

  // Common Input Styling
  const inputBaseClass = "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 outline-none text-sm";
  const iconBaseClass = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400";

  // --- JSX ---
  return (
    <div className="min-h-screen bg-[#f7f9fa] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4">
            <div onClick={handleReturnHome} className="bg-gradient-to-r from-orange-500 to-red-500 p-3 sm:p-4 rounded-3xl shadow-lg cursor-pointer">
              <FaUtensils className="text-white text-2xl sm:text-3xl" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Create your account
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Join <span onClick={handleReturnHome} className="font-semibold text-orange-600 cursor-pointer">Yummy Go</span> and start ordering
          </p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-6 sm:p-8 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  First Name
                </label>
                <div className="relative">
                  <FaUser className={iconBaseClass} size={16}/>
                  <input type="text" {...register("firstName", { required: "First name is required" })}
                    placeholder="John" className={inputBaseClass} />
                </div>
                {errors.firstName && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <FaUser className={iconBaseClass} size={16}/>
                  <input type="text" {...register("lastName", { required: "Last name is required" })}
                    placeholder="Doe" className={inputBaseClass} />
                </div>
                {errors.lastName && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className={iconBaseClass} size={16}/>
                <input type="email" {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" }
                  })}
                  placeholder="you@example.com" className={inputBaseClass} />
              </div>
              {errors.email && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className={iconBaseClass} size={16}/>
                <input type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be >= 6 characters" },
                    pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: "Needs Upper, Lower, Number" }
                  })}
                  placeholder="••••••••" className={`${inputBaseClass} pr-10`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <FaEyeSlash size={18}/> : <FaEye size={18}/>}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.password.message}</p>}

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Strength</span>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${
                       passwordStrength.strength <= 20 ? 'bg-red-500' :
                       passwordStrength.strength <= 40 ? 'bg-orange-500' :
                       passwordStrength.strength <= 60 ? 'bg-yellow-500' :
                       passwordStrength.strength <= 80 ? 'bg-blue-500' : 'bg-green-500'
                    }`} style={{ width: `${passwordStrength.strength}%` }}></div>
                  </div>
                  {/* Strength Criteria */}
                   <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] sm:text-xs">
                     {/* ✅ FIX: Correctly check the 'length' boolean property */}
                     <span className={passwordStrength.checks.length ? 'text-green-500' : 'text-gray-400'}>✓ 6+ chars</span>
                     <span className={passwordStrength.checks.lowercase ? 'text-green-500' : 'text-gray-400'}>✓ Lowercase</span>
                     <span className={passwordStrength.checks.uppercase ? 'text-green-500' : 'text-gray-400'}>✓ Uppercase</span>
                     <span className={passwordStrength.checks.number ? 'text-green-500' : 'text-gray-400'}>✓ Number</span>
                     {/* Uncomment if using special char check */}
                     {/* <span className={passwordStrength.checks.special ? 'text-green-500' : 'text-gray-400'}>✓ Special</span> */}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <FaLock className={iconBaseClass} size={16}/>
                <input type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: value => value === watch("password") || "Passwords do not match"
                  })}
                  placeholder="••••••••" className={`${inputBaseClass} pr-10`}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPassword ? <FaEyeSlash size={18}/> : <FaEye size={18}/>}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white
                py-2.5 sm:py-3 rounded-xl font-semibold shadow-md hover:shadow-lg
                transform hover:-translate-y-0.5 transition-all duration-200
                disabled:opacity-60 disabled:transform-none disabled:cursor-not-allowed text-sm sm:text-base">
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Creating account...
                </div>
              ) : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 sm:my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-gray-500 text-xs sm:text-sm">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Social Login Component */}
          <SocialLogin />

          {/* Redirect to Login */}
          <p className="text-center text-gray-600 mt-5 sm:mt-6 text-xs sm:text-sm">
            Already have an account?{" "}
            <Link to="/auth/log-in" className="text-orange-500 font-semibold hover:text-orange-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserReg;