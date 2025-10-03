import React from "react";
import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import useAuth from "../hooks/useAuth";
import useUserRole from "../hooks/useUserRole";

interface RestaurantOwnerRouteProps {
  children: ReactNode;
}

const RestaurantOwnerRoute: React.FC<RestaurantOwnerRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { isRestaurantOwner, roleLoading, error } = useUserRole();
  const location = useLocation();

  // Show loading spinner while checking authentication and role
  if (loading || roleLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-xl text-primary"></div>
          <p className="text-gray-600">Verifying restaurant owner access...</p>
        </div>
      </div>
    );
  }

  // Handle role fetching error
  if (error) {
    console.error("Error checking restaurant owner role:", error);
    return (
      <Navigate 
        to="/error" 
        state={{ 
          from: location.pathname,
          error: "Unable to verify restaurant owner privileges" 
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

  // Redirect if user is not a restaurant owner
  if (!isRestaurantOwner) {
    return (
      <Navigate 
        to="/forbidden" 
        state={{ 
          from: location.pathname,
          message: "Restaurant owner access required" 
        }} 
        replace 
      />
    );
  }

  // Render children if user is authenticated and is restaurant owner
  return <>{children}</>;
};

export default RestaurantOwnerRoute;