import React from "react";
import useAuth from "../../../hooks/useAuth";

// FIX #1: Define the shape of your user object.
// This tells TypeScript what properties to expect.
type CustomUser = {
  email?: string | null;
  displayName?: string | null;
  name?: string; // For the single name field
  firstName?: string; // For the first name field
  lastName?: string; // For the last name field
};

const ProfileOpeningLoading: React.FC = () => {
  // FIX #2: Apply the CustomUser type to the user object from the hook.
  const { user } = useAuth() as { user: CustomUser | null };

  // This logic now works without errors because TypeScript knows the possible properties.
  const displayName =
    user?.displayName ||
    (user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name) ||
    "User";

  const displayEmail = user?.email || "";

  const hasRealName = displayName !== "User";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-amber-100">
      {/* Animated Delivery Loader */}
      <div className="relative">
        <div className="w-24 h-24 border-8 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="absolute inset-0 flex items-center justify-center text-5xl">
          🛵
        </span>
      </div>

      {/* Loading Text */}
      <p className="mt-6 text-2xl font-semibold text-amber-700 animate-pulse">
        {hasRealName
          ? `Opening ${displayName}'s profile...`
          : "Opening your profile..."}
      </p>

      <p className="text-sm text-amber-500 mt-2">
        {displayEmail
          ? `Fetching data for ${displayEmail} 🍕`
          : "Please wait while we serve your data 🍕"}
      </p>
    </div>
  );
};

export default ProfileOpeningLoading;