import React from "react";
import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import useAuth from "../hooks/useAuth";
import useUserRole from "../hooks/useUserRole";

interface RiderRouteProps {
  children: ReactNode;
}

const RiderRoute: React.FC<RiderRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { isRider, roleLoading, error } = useUserRole();
  const location = useLocation();

  // Show loading spinner while checking authentication and role
  if (loading || roleLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-xl text-primary"></div>
          <p className="text-gray-600">Verifying rider access...</p>
        </div>
      </div>
    );
  }

  // Handle role fetching error
  if (error) {
    console.error("Error checking rider role:", error);
    return (
      <Navigate 
        to="/error" 
        state={{ 
          from: location.pathname,
          error: "Unable to verify rider privileges" 
        }} 
        replace 
      />
    );
  }

  // Redirect if user is not authenticated
  if (!user) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Redirect if user is not a rider
  if (!isRider) {
    return (
      <Navigate 
        to="/forbidden" 
        state={{ 
          from: location.pathname,
          message: "Rider access required" 
        }} 
        replace 
      />
    );
  }

  // Render children if user is authenticated and is rider
  return <>{children}</>;
};

export default RiderRoute;