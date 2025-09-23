import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";

import googleIcon from "../../assets/auth/icons8-google-48.png";
import appleIcon from "../../assets/auth/icons8-apple-50.png";
import facebookIcon from "../../assets/auth/icons8-facebook-50.png";

// Validation Schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Handle Submit
  const onSubmit = async (data: LoginFormValues) => {
    console.log("Form Data:", data);
    alert('please add login functionality')
    
  };

  return (
    <section className="bg-[#ffe5df]/40 min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md relative z-10 border border-gray-100"
      >
        {/* Title */}
        <h1 className="text-3xl font-extrabold text-center text-[#ef451c] mb-2">
          Welcome Back!
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Sign in to continue ordering delicious food <br /> from Yammy Go 🍔🍕
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div>
            <input
              id="username"
              placeholder="Enter Email / Phone No"
              {...register("username")}
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-[#ef451c] focus:ring-2 focus:ring-[#ef451c]/40 outline-none transition"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              id="password"
              type="password"
              placeholder="Passcode"
              {...register("password")}
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-[#ef451c] focus:ring-2 focus:ring-[#ef451c]/40 outline-none transition"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Forgot Password */}
          <p className="text-sm text-gray-500 cursor-pointer hover:underline">
            Having trouble signing in?
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#ef451c] hover:bg-[#d63e18] text-white py-3 rounded-md font-semibold transition-colors duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300" />
          <span className="mx-2 text-gray-400 text-sm">Or Sign in with</span>
          <div className="flex-grow border-t border-gray-300" />
        </div>

        {/* Social Logins */}
        <div className="flex justify-center gap-3">
          <button className="flex items-center justify-center gap-2 flex-1 border border-gray-300 rounded-md py-2 hover:border-[#ef451c] transition">
            <img className="h-5" src={googleIcon} alt="Google" />
            Google
          </button>
          <button className="flex items-center justify-center gap-2 flex-1 border border-gray-300 rounded-md py-2 hover:border-[#ef451c] transition">
            <img className="h-5" src={appleIcon} alt="Apple" />
            Apple ID
          </button>
          <button className="flex items-center justify-center gap-2 flex-1 border border-gray-300 rounded-md py-2 hover:border-[#ef451c] transition">
            <img className="h-5" src={facebookIcon} alt="Facebook" />
            Facebook
          </button>
        </div>

        {/* Register Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <span
            className="text-[#ef451c] hover:underline cursor-pointer font-medium"
            onClick={() => navigate("/register")}
          >
            Create One
          </span>
        </p>
      </motion.div>

      {/* Background Decoration */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute w-96 h-96 bg-gradient-to-br from-[#ef451c]/20 to-[#fdc872]/30 rounded-full blur-3xl -top-20 -right-20"
      />
    </section>
  );
}
