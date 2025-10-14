import React from "react";
import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import useAuth from "../hooks/useAuth";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-xl text-primary"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return (
      <Navigate 
        to="/auth/log-in" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Render children if user is authenticated
  return <>{children}</>;
};

export default PrivateRoute;