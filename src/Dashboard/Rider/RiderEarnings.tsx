/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  ServerCrash,
  DollarSign,
  PackageCheck,
  Calculator,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";

// --- Type Definitions ---
type DeliveryType = {
  _id: string;
  order_number: string;
  user_email: string;
  delivery_fee: number;
  status: 'delivered';
  delivered_at: string; // ISO String format
};

// --- Helper Components ---
const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; color: string }> = ({ icon, title, value, color }) => (
  <div className={`bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 ${color}`}>
    {/* Responsive icon padding */}
    <div className="bg-opacity-10 p-2 sm:p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-xs sm:text-sm text-slate-500 font-medium">{title}</p>
      {/* Responsive value text size */}
      <p className="text-xl sm:text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

// --- Main Component ---
const RiderEarnings: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [allDeliveries, setAllDeliveries] = useState<DeliveryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // --- Data Fetching ---
  useEffect(() => {
    if (authLoading || !user?.email) {
      setIsLoading(authLoading);
      if (!authLoading && !user?.email) {
          setError("Please log in to view earnings.");
          setIsLoading(false);
      }
      return;
    }

    const fetchEarningsHistory = async () => {
      const riderEmail = user.email;
      setIsLoading(true);
      setError(null);

      try {
        const riderResponse = await axiosSecure.get(`/riders/email/${riderEmail}`);
        const riderId = riderResponse.data?._id || riderResponse.data?.data?._id;

        if (!riderId) {
           throw new Error("Could not find rider profile. Your application might be pending approval.");
        }

        const deliveriesResponse = await axiosSecure.get(`/deliveries/rider/${riderId}`);
        const deliveryData = Array.isArray(deliveriesResponse.data) ? deliveriesResponse.data : deliveriesResponse.data?.data || [];
        const deliveredEarnings = deliveryData.filter((d: any) => d.status === 'delivered');
        setAllDeliveries(deliveredEarnings);

      } catch (err: any) {
        console.error("API Fetch Error:", err);
        if (err.response?.status === 404 && err.config?.url?.includes('/riders/email/')) {
             setError("Could not find your rider profile. Ensure your application is approved.");
        } else {
             setError(err?.response?.data?.message || err.message || "Failed to load earnings data.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEarningsHistory();
  }, [user, authLoading, axiosSecure]);

  // --- Memoized Filtering & Calculations ---
  const filteredDeliveries = useMemo(() => {
    let dateFiltered = allDeliveries;
    if (dateFilter !== 'all') {
      const days = dateFilter === '7d' ? 7 : 30;
      const cutoffDate = new Date();
      cutoffDate.setHours(0, 0, 0, 0);
      cutoffDate.setDate(cutoffDate.getDate() - days);
      dateFiltered = allDeliveries.filter(d => {
          try { return new Date(d.delivered_at) >= cutoffDate; }
          catch (e) { console.warn("Invalid date:", d); return false; }
      });
    }
    return dateFiltered.filter((d) => {
      const query = searchTerm.trim().toLowerCase();
      if (!query) return true;
      return d.order_number && typeof d.order_number === 'string' && d.order_number.toLowerCase().includes(query);
    });
  }, [allDeliveries, dateFilter, searchTerm]);

  const stats = useMemo(() => {
    const totalDeliveries = filteredDeliveries.length;
    const totalEarnings = filteredDeliveries.reduce((sum, d) => sum + (Number(d.delivery_fee) || 0), 0);
    const averageEarning = totalDeliveries > 0 ? (totalEarnings / totalDeliveries) : 0;
    return {
      totalEarnings: totalEarnings.toFixed(2),
      totalDeliveries,
      averageEarning: averageEarning.toFixed(2),
    };
  }, [filteredDeliveries]);

  const totalPages = Math.max(1, Math.ceil(filteredDeliveries.length / perPage));
  const paginatedDeliveries = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredDeliveries.slice(start, start + perPage);
  }, [filteredDeliveries, currentPage]);

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] bg-slate-50 text-slate-500">
        <DollarSign className="animate-bounce text-[#EF451C]" size={48} />
        <p className="mt-4 text-lg font-semibold">Calculating Earnings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center bg-slate-50 p-4">
        <ServerCrash className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-slate-800">Error Loading Earnings</h2>
        <p className="text-slate-500 text-sm sm:text-base">{error}</p>
      </div>
    );
  }

  return (
    // Responsive padding for the whole page container
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Max width container */}
      <div className="max-w-7xl mx-auto">
        {/* Responsive heading */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800">My Earnings 💰</h1>
        <p className="text-slate-500 text-sm sm:text-base mb-6">Summary of completed deliveries.</p>

        {/* Filters and Search - Responsive Layout */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            {/* Date Filter Buttons - Flex wrap for smaller screens if needed */}
            <div className="flex flex-wrap justify-center space-x-1 border border-slate-200 p-1 rounded-lg bg-white w-full md:w-auto shadow-sm">
                {/* Responsive padding and text size */}
                <button onClick={() => { setDateFilter('all'); setCurrentPage(1); }} className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-md transition-all ${dateFilter === 'all' ? 'bg-[#EF451C] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>All Time</button>
                <button onClick={() => { setDateFilter('30d'); setCurrentPage(1); }} className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-md transition-all ${dateFilter === '30d' ? 'bg-[#EF451C] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>Last 30 Days</button>
                <button onClick={() => { setDateFilter('7d'); setCurrentPage(1); }} className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-md transition-all ${dateFilter === '7d' ? 'bg-[#EF451C] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>Last 7 Days</button>
            </div>
            {/* Search Input - Responsive width */}
             <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                {/* Responsive padding and width */}
                <input type="text" placeholder="Search by Order #" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full md:w-64 pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#EF451C] focus:border-[#EF451C] shadow-sm"/>
             </div>
        </div>

        {/* Stats Cards - Responsive Grid and Gap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            <StatCard icon={<DollarSign size={20} className="sm:size-24"/>} title="Total Earnings" value={`৳${stats.totalEarnings}`} color="text-green-600 bg-green-100"/>
            <StatCard icon={<PackageCheck size={20} className="sm:size-24"/>} title="Deliveries Made" value={stats.totalDeliveries.toString()} color="text-blue-600 bg-blue-100"/>
            <StatCard icon={<Calculator size={20} className="sm:size-24"/>} title="Avg. Earning" value={`৳${stats.averageEarning}`} color="text-orange-600 bg-orange-100"/>
        </div>

        {/* Earnings Table Container */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
          {/* Min width on table ensures horizontal scroll on small screens */}
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {/* Responsive padding */}
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Order #</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Earning (৳)</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {paginatedDeliveries.length > 0 ? (
                paginatedDeliveries.map((delivery) => (
                  <tr key={delivery._id} className="hover:bg-slate-50 transition-colors duration-150">
                    {/* Responsive padding and text size */}
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-slate-800">{delivery.order_number || 'N/A'}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-slate-500">{delivery.user_email || 'N/A'}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-green-600">{Number(delivery.delivery_fee || 0).toFixed(2)}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-slate-600">
                      {delivery.delivered_at
                         ? new Date(delivery.delivered_at).toLocaleDateString("en-GB", { year: 'numeric', month: 'short', day: 'numeric' })
                         : 'N/A'
                      }
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  {/* Responsive padding */}
                  <td colSpan={4} className="text-center py-10 sm:py-12 px-4 sm:px-6 text-slate-500">
                    <PackageCheck size={28} className="mx-auto mb-2 text-slate-400" />
                    <p className="font-semibold text-sm sm:text-base">No Earnings Found</p>
                    <p className="text-xs sm:text-sm mt-1">No completed deliveries match filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls - Responsive Gap */}
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

export default RiderEarnings;