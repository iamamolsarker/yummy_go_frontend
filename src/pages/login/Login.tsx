"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  FaEnvelope,
  FaLock,
  FaUtensils,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router";
import useAuth from "../../hooks/useAuth";

type LoginForm = {
  email: string;
  password: string;
};



const Login: React.FC = () => {
  const { register, reset, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { logIn, logInWithGoogle, loading, setLoading } = useAuth();

  const onSubmit = async (data: LoginForm) => {
    try {
      const userCredential = await logIn(data.email, data.password);

      // success toast
      toast.success(`Welcome back, ${userCredential.user.displayName || "User"} `);
      // Swal.fire("Success!", "You are logged in!", "success");

      reset();
      navigate("/"); // go home
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Login failed");
      // Swal.fire("Error!", err.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await logInWithGoogle();
      toast.success(`Welcome back, ${result.user.displayName || "User"} to yummy go`);
      navigate("/");

    }
    catch (err) {
      console.error(err);
      toast.error("Google Sign-In failed. Please try again.");
    }
    finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fa] flex items-center justify-center p-6 mb-6">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-3xl shadow-lg">
              <FaUtensils className="text-white text-3xl" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Welcome back
          </h1>
          <p className="text-gray-600 mt-1">
            Sign in to <span className="font-semibold text-orange-600">Yummy Go </span>
            & get your food delivered fast
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
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
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
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
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
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
                  <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center py-3 px-4 
            border border-[#dadce0] rounded-xl bg-white text-[#3c4043] font-medium 
            hover:bg-[#f7f9fa] transition-all shadow-sm">
            <FcGoogle className="w-5 h-5 mr-3" />
            Continue with Google
          </button>

          {/* Sign Up */}
          <p className="text-center text-gray-600 mt-6">
            New to <span className="font-semibold text-orange-600">Yummy Go</span>?{" "}
            <Link
              to="/auth/user-reg"
              className="text-orange-500 font-semibold hover:text-orange-600 underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
