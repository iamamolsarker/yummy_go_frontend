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
import { FcGoogle } from "react-icons/fc"; 
import { Link } from "react-router";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const UserReg: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("✅ Register Data:", data);
    setIsLoading(false);
    alert("🎉 Account created successfully! Welcome to Yummy Go 🍔");
    // to do:use react toast 
  };

  return (
    <div className="min-h-screen bg-[#f7f9fa] flex items-center justify-center p-6 mb-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Create your account ✨
          </h1>
          <p className="text-gray-600 mt-1">
            Join <span className="font-semibold text-orange-600">Yummy Go</span> and start ordering food in minutes 🍕
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
                    minLength: { value: 6, message: "Password must be at least 6 characters" }
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
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white 
                py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl 
                transform hover:-translate-y-0.5 transition-all duration-200 
                disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                  Creating account...
                </div>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>


          <button className="w-full flex items-center justify-center py-3 px-4 
            border border-[#dadce0] rounded-xl bg-white text-[#3c4043] font-medium 
            hover:bg-[#f7f9fa] transition-all shadow-sm">
            <FcGoogle className="w-5 h-5 mr-3" />
            Sign up with Google
          </button>

          {/* Redirect to Login */}
          <p className="text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <Link 
              to="/log-in" 
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