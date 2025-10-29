/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ServerCrash,
  History,
  CheckCircle2,
  XCircle,
  MapPin,
  UtensilsCrossed,
  ChevronRight, // Keep for route display
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";

// --- Type Definitions ---
type DeliveryType = {
  _id: string; // Delivery ID
  order_number: string;
  user_email: string;
  total_amount?: number; // Might be on the associated order, optional here
  delivery_fee?: number; // Rider's earning for this delivery
  status: 'delivered' | 'cancelled'; // Only history statuses
  delivery_address?: any;
  restaurant_address?: any;
  delivered_at?: string; // ISO String
  cancelled_at?: string; // ISO String
};

// --- Helper Components ---
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  // Responsive padding and text size
  const baseClasses = "inline-flex items-center gap-1.5 py-1 px-2 sm:px-3 rounded-full text-xs font-bold capitalize";
  if (status === 'delivered') {
    return (
      <span className={`${baseClasses} bg-green-100 text-green-800`}>
        <CheckCircle2 size={14} /> Delivered
      </span>
    );
  }
  if (status === 'cancelled') {
    return (
      <span className={`${baseClasses} bg-red-100 text-red-800`}>
        <XCircle size={14} /> Cancelled
      </span>
    );
  }
  // Fallback for unexpected statuses
  return <span className={`${baseClasses} bg-slate-100 text-slate-800`}>{status}</span>;
};


// --- Main Component ---
const RiderHistory: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [deliveries, setDeliveries] = useState<DeliveryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<'All' | 'delivered' | 'cancelled'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10; // Keep 10 per page for history

  // --- Data Fetching ---
  useEffect(() => {
    if (authLoading || !user?.email) {
      setIsLoading(authLoading);
      if (!authLoading && !user?.email) {
          setError("Please log in to view delivery history.");
          setIsLoading(false);
      }
      return;
    }

    const fetchDeliveryHistory = async () => {
      const riderEmail = user.email;
      setIsLoading(true);
      setError(null);

      try {
        // Step 1: Get Rider ID
        console.log(`Fetching rider details for: ${riderEmail}`);
        const riderResponse = await axiosSecure.get(`/riders/email/${riderEmail}`);
        const riderId = riderResponse.data?._id || riderResponse.data?.data?._id;

        if (!riderId) {
          console.error("Rider document not found for email:", riderEmail, "Response:", riderResponse.data);
          throw new Error("Could not find your rider profile. Ensure your application is approved.");
        }
        console.log(`Rider ID found: ${riderId}`);

        // Step 2: Get Deliveries for Rider
        console.log(`Fetching deliveries for rider ID: ${riderId}`);
        const deliveriesResponse = await axiosSecure.get(`/deliveries/rider/${riderId}`);
        const data = Array.isArray(deliveriesResponse.data) ? deliveriesResponse.data : deliveriesResponse.data?.data || [];
        console.log(`Received ${data.length} total deliveries.`);

        // Filter for history (delivered or cancelled)
        const historyData = data.filter(
          (d: any) => d.status === 'delivered' || d.status === 'cancelled'
        );
         console.log(`Filtered down to ${historyData.length} history entries.`);
        setDeliveries(historyData);

      } catch (err: any) {
        console.error("API Fetch Error:", err);
         if (err.response?.status === 404 && err.config?.url?.includes('/riders/email/')) {
             setError("Could not find your rider profile. Ensure your application is approved.");
        } else {
            setError(err?.response?.data?.message || err.message || "Failed to load delivery history.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliveryHistory();
  }, [user, authLoading, axiosSecure]); // Effect dependencies

  // --- Filtering & Pagination ---
  const filteredDeliveries = useMemo(() => {
    return deliveries
      .filter((d) => statusFilter === 'All' || d.status === statusFilter)
      .filter((d) => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return true;
        return (
          String(d.order_number || "").toLowerCase().includes(query) ||
          String(d.user_email || "").toLowerCase().includes(query)
        );
      })
      // Sort by completion/cancellation date, newest first
      .sort((a, b) => new Date(b.delivered_at || b.cancelled_at || 0).getTime() - new Date(a.delivered_at || a.cancelled_at || 0).getTime());
  }, [deliveries, statusFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredDeliveries.length / perPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedDeliveries = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredDeliveries.slice(start, start + perPage);
  }, [filteredDeliveries, currentPage, perPage]);

  // --- Helper ---
  const formatAddress = (addr: any): string => {
    if (!addr) return "N/A";
    if (typeof addr === "string") return addr;
    const parts = [addr.street, addr.area, addr.city].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Address details missing";
  };

  const formatDate = (dateString?: string): string => {
      if (!dateString) return 'N/A';
      try {
          // Responsive date format
          return new Date(dateString).toLocaleDateString("en-GB", {
              day: 'numeric', month: 'short', year: 'numeric'
          });
      } catch (e) {
          console.warn("Invalid date format:", dateString);
          return 'Invalid Date';
      }
  };

  // --- Loading & Error States ---
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-150px)] bg-slate-50 text-slate-500">
        <History className="animate-spin text-[#EF451C]" size={48} />
        <p className="mt-4 text-lg font-semibold">Loading Delivery History...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-150px)] text-center bg-slate-50 p-4">
        <ServerCrash className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-slate-800">Error Loading History</h2>
        <p className="text-slate-500 text-sm sm:text-base">{error}</p>
      </div>
    );
  }

  // --- Main JSX ---
  return (
    // Responsive page padding
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Responsive heading */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-slate-800">My Delivery History 📜</h1>

        {/* Filters & Search - Responsive */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6 shadow-sm">
          {/* Flex wrap for smaller screens */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filter Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap space-x-1 border border-slate-200 p-1 rounded-lg w-full md:w-auto">
              {(['All', 'delivered', 'cancelled'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setStatusFilter(tab); setCurrentPage(1); }}
                  // Responsive text and padding
                  className={`flex-1 sm:flex-none py-1.5 px-2 sm:py-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-md transition-all capitalize whitespace-nowrap ${
                    statusFilter === tab ? "bg-[#EF451C] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
             {/* Search Input - Responsive */}
            <div className="relative w-full md:flex-grow md:min-w-[200px] lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              <input
                type="text"
                placeholder="Search Order # or Customer..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                // Responsive text and padding
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#EF451C] focus:border-[#EF451C]"
              />
            </div>
          </div>
        </div>

        {/* History Table Container */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
          {/* Min-width for horizontal scroll */}
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {/* Responsive padding */}
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Order Info</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Route</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Earning (৳)</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {paginatedDeliveries.length > 0 ? (
                paginatedDeliveries.map((delivery) => (
                  <tr key={delivery._id} className="hover:bg-slate-50 transition-colors duration-150 text-xs sm:text-sm">
                    {/* Order Info Cell - Responsive Padding */}
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{delivery.order_number || 'N/A'}</div>
                      <div className="text-slate-500">{delivery.user_email || 'N/A'}</div>
                    </td>
                    {/* Route Cell (Hidden on mobile) - Responsive Padding */}
                    <td className="px-4 sm:px-6 py-4 text-slate-600 hidden md:table-cell max-w-sm">
                        {/* Flex wrap on smaller md screens if needed */}
                       <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2">
                            <div className="flex items-center gap-1 text-xs">
                                <UtensilsCrossed size={14} className="text-[#EF451C] flex-shrink-0" />
                                <span className="truncate">{formatAddress(delivery.restaurant_address)}</span>
                            </div>
                            <ChevronRight size={14} className="text-slate-400 hidden lg:inline-block flex-shrink-0" />
                             <div className="flex items-center gap-1 text-xs">
                                <MapPin size={14} className="text-blue-500 flex-shrink-0" />
                                <span className="truncate">{formatAddress(delivery.delivery_address)}</span>
                             </div>
                       </div>
                    </td>
                    {/* Earning Cell - Responsive Padding */}
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-bold text-green-600">
                      {/* Use delivery_fee if available, otherwise show N/A */}
                      {delivery.delivery_fee ? Number(delivery.delivery_fee).toFixed(2) : 'N/A'}
                    </td>
                    {/* Status Cell - Responsive Padding */}
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                        <StatusBadge status={delivery.status} />
                    </td>
                    {/* Date Cell - Responsive Padding */}
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-slate-600">
                      {formatDate(delivery.delivered_at || delivery.cancelled_at)}
                    </td>
                  </tr>
                ))
              ) : (
                // No Results Row
                <tr>
                   {/* Responsive padding */}
                  <td colSpan={5} className="text-center py-10 sm:py-12 px-4 sm:px-6 text-slate-500">
                    <History size={28} className="mx-auto mb-2 text-slate-400" />
                    <p className="font-semibold text-sm sm:text-base">No History Found</p>
                    <p className="text-xs sm:text-sm mt-1">No completed or cancelled deliveries match.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls - Responsive */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6">
            {/* Responsive padding and text size */}
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button>
            <div className='text-xs sm:text-sm text-slate-700 font-medium'>Page {currentPage} of {totalPages}</div>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderHistory;