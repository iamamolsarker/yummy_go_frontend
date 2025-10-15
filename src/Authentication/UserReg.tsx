"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import { Link, useNavigate } from "react-router";

import { toast } from "react-toastify";
import useAuth from "../hooks/useAuth";
import SocialLogin from "./SocialLogin";
import useAxios from "../hooks/useAxios";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const UserReg: React.FC = () => {
  const { createUser, updateUser, loading, setLoading } = useAuth();
  const axiosPublic = useAxios();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "" };
    
    let strength = 0;
    const checks = {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    strength = Object.values(checks).filter(Boolean).length;
    
    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const colors = ["text-red-500", "text-orange-500", "text-yellow-500", "text-blue-500", "text-green-500"];
    
    return {
      strength: (strength / 5) * 100,
      label: labels[Math.min(strength - 1, 4)] || "",
      color: colors[Math.min(strength - 1, 4)] || "text-gray-400",
      checks
    };
  };

  const password = watch("password");
  const passwordStrength = getPasswordStrength(password || "");

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      // 1️⃣ Create the user
      await createUser(data.email, data.password);
      
      // 2️⃣ Update user profile with name
      if (data.name) {
        await updateUser({ displayName: data.name });
      }

      // 3️⃣ Save user info to database
      const userInfo = {
        name: data.name,
        email: data.email,
      };
      
      try {
        const userRes = await axiosPublic.post("/users", userInfo);
        console.log("User saved to database:", userRes.data);
      } catch (dbError) {
        console.error("Error saving user to database:", dbError);
        // Don't fail the registration if database save fails
      }

      // 4️⃣ Success toast
      toast.success(`Welcome to Yummy Go, ${data.name}!`);

      // 5️⃣ Navigate to home
      navigate("/");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong during registration");
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-[#f7f9fa] flex items-center justify-center p-6 mb-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Create your account 
          </h1>
          <p className="text-gray-600 mt-1">
            Join <span className="font-semibold text-orange-600">Yummy Go</span> and start ordering food in minutes 
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  {...register("name", { required: "Full name is required" })}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl 
                    focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                    transition-all duration-200 outline-none"
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email"
                    }
                  })}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl 
                    focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                    transition-all duration-200 outline-none"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
                    }
                  })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl 
                    focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                    transition-all duration-200 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Password Strength</span>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        passwordStrength.strength <= 20 ? 'bg-red-500' :
                        passwordStrength.strength <= 40 ? 'bg-orange-500' :
                        passwordStrength.strength <= 60 ? 'bg-yellow-500' :
                        passwordStrength.strength <= 80 ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 space-y-1">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className={passwordStrength.checks?.length ? 'text-green-500' : 'text-gray-400'}>
                        ✓ 6+ characters
                      </span>
                      <span className={passwordStrength.checks?.lowercase ? 'text-green-500' : 'text-gray-400'}>
                        ✓ lowercase
                      </span>
                      <span className={passwordStrength.checks?.uppercase ? 'text-green-500' : 'text-gray-400'}>
                        ✓ uppercase
                      </span>
                      <span className={passwordStrength.checks?.number ? 'text-green-500' : 'text-gray-400'}>
                        ✓ number
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: value => value === watch("password") || "Passwords do not match"
                  })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl 
                    focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                    transition-all duration-200 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white 
                py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl 
                transform hover:-translate-y-0.5 transition-all duration-200 
                disabled:opacity-50 disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Social Login Component */}
          <SocialLogin />

          {/* Redirect to Login */}
          <p className="text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <Link
              to="/auth/log-in"
              className="text-orange-500 font-semibold hover:text-orange-600 underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserReg;