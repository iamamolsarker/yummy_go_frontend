import React from "react";
import { Link, useLocation } from "react-router";
import { Shield, Home, ArrowLeft } from "lucide-react";
import type { LocationState } from "../../types/router";

const Forbidden: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  const from = state?.from || "/";
  const message = state?.message || "You don't have permission to access this page";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-6 rounded-full">
            <Shield className="w-16 h-16 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Access Forbidden
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Need access?</strong> Please contact your system administrator 
            or <Link to="/contact" className="underline hover:no-underline">contact support</Link>.
          </p>
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && from && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-left">
            <p className="text-xs text-gray-600">
              <strong>Debug Info:</strong><br />
              Attempted to access: <code className="bg-gray-200 px-1 rounded">{from}</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forbidden;