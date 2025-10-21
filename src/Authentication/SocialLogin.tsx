/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router";
import Swal from "sweetalert2";
import type { User } from "firebase/auth";

import useAxios from "../hooks/useAxios";
import useAuth from "../hooks/useAuth";

// Define user info interface
interface UserInfo {
  name: string | null;
  email: string | null;
  role: string; // Backend 'createUser' expects a role
}

// Define location state interface
interface LocationState {
  from?: string;
}

const SocialLogin: React.FC = () => {
  const { logInWithGoogle } = useAuth();
  const location = useLocation() as { state?: LocationState };
  const axiosPublic = useAxios();
  const navigate = useNavigate();

  const handleGoogleSignIn = (): void => {
    logInWithGoogle()
      .then(async (result) => {
        const user: User = result.user;
        console.log("Firebase User:", user);
        
        // Create proper user data structure for the backend
        const userInfo: UserInfo = {
          name: user.displayName,
          email: user.email,
          role: 'user', // Set default role as per backend logic
        };

        try {
          const userRes = await axiosPublic.post("/api/users", userInfo);
          console.log("User saved/retrieved from DB:", userRes.data);
        } catch (dbError: any) {
          // It's okay if the user already exists (often a 400 Bad Request)
          if (dbError.response?.data?.message?.includes("already exists")) {
            console.warn("User already exists in DB, proceeding with login.");
          } else if (dbError.response) {
            console.error("Database save failed:", dbError.response.data);
          } else {
            console.error("Database request failed:", dbError.message);
          }
        }
        
        const redirectTo: string = location.state?.from || "/";
        navigate(redirectTo, { replace: true });

        Swal.fire({
          icon: "success",
          title: "Login successful!",
          text: `Welcome, ${user.displayName}!`,
          showConfirmButton: false,
          timer: 1500,
        });
      })
      .catch((error: Error) => {
        console.error("Error during Google sign-in:", error);
        
        let errorMessage = "Login failed. Please try again.";
        if (error.message.includes("popup-closed-by-user")) {
          errorMessage = "Login was cancelled.";
        }
        
        Swal.fire({
          icon: "error",
          title: "Login failed",
          text: errorMessage,
        });
      });
  };

  return (
    <div className="w-full space-y-4">
      <motion.button
        onClick={handleGoogleSignIn}
        className="w-full bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <svg
          aria-label="Google logo"
          width="24"
          height="24"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <g>
            <path d="m0 0H512V512H0" fill="#fff"></path>
            <path
              fill="#34a853"
              d="m153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
            ></path>
            <path
              fill="#4285f4"
              d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
            ></path>
            <path
              fill="#fbbc02"
              d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
            ></path>
            <path
              fill="#ea4335"
              d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
            ></path>
          </g>
        </svg>
        <span className="text-lg">Continue with Google</span>
      </motion.button>
    </div>
  );
};

export default SocialLogin;

