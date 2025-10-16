/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ServerCrash,
  DollarSign,
  PackageCheck,
  Calculator,
} from "lucide-react";

// Make sure to import hooks from your project's correct path
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";

// --- Type Definitions ---
type EarningType = {
  _id: string;
  order_number: string;
  user_email: string;
  delivery_fee: number;
  status: 'delivered';
  delivered_at: string;
};

// --- Helper Components ---
const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; color: string }> = ({ icon, title, value, color }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 ${color}`}>
    <div className="bg-opacity-10 p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

// --- Main Component ---
const RiderEarnings: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [allDeliveries, setAllDeliveries] = useState<EarningType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // --- Data Fetching Effect ---
  useEffect(() => {
    if (authLoading || !user) {
      setIsLoading(authLoading);
      return;
    }

    const fetchEarningsHistory = async () => {
      const riderEmail = user.email;
      if (!riderEmail) {
        setError("Could not find rider's email. Please log in again.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // ✅ Step 1: Get the rider's ID using their email (FIX: removed '/api' prefix)
        const userProfileResponse = await axiosSecure.get(`/users/${riderEmail}`);
        const riderId = userProfileResponse.data?.data?._id || userProfileResponse.data?._id;

        if (!riderId) {
          throw new Error("Could not retrieve rider's ID from profile.");
        }

        // ✅ Step 2: Use the retrieved rider ID to get their deliveries (FIX: removed '/api' prefix)
        const deliveriesResponse = await axiosSecure.get(`/deliveries/rider/${riderId}`);
        const data = Array.isArray(deliveriesResponse.data) ? deliveriesResponse.data : deliveriesResponse.data?.data || [];
        
        const earningsData = data.filter(
          (d: any) => d.status === 'delivered'
        );
        setAllDeliveries(earningsData);

      } catch (err: any) {
        console.error("API Fetch Error:", err);
        setError(err?.response?.data?.message || "Failed to load earnings data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEarningsHistory();
  }, [user, authLoading, axiosSecure]);

  // --- Memoized Filtering and Calculations ---
  const filteredDeliveries = useMemo(() => {
    let dateFiltered = allDeliveries;

    if (dateFilter !== 'all') {
      const days = dateFilter === '7d' ? 7 : 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      dateFiltered = allDeliveries.filter(d => new Date(d.delivered_at) >= cutoffDate);
    }
    
    return dateFiltered.filter((d) => {
      const query = searchTerm.trim().toLowerCase();
      if (!query) return true;
      return d.order_number.toLowerCase().includes(query);
    });
  }, [allDeliveries, dateFilter, searchTerm]);

  const stats = useMemo(() => {
    const totalDeliveries = filteredDeliveries.length;
    const totalEarnings = filteredDeliveries.reduce((sum, d) => sum + d.delivery_fee, 0);
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

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 text-slate-500">
        <DollarSign className="animate-bounce text-[#EF451C]" size={48} />
        <p className="mt-4 text-lg font-semibold">Calculating Your Earnings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center bg-slate-50 p-4">
        <ServerCrash className="text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold mb-2">Error Loading Earnings</h2>
        <p className="text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-slate-800">My Earnings 💰</h1>
        <p className="text-slate-500 mb-6">Here's a summary of your completed deliveries and earnings.</p>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex space-x-1 border border-slate-200 p-1 rounded-lg bg-white">
                <button onClick={() => setDateFilter('all')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${dateFilter === 'all' ? 'bg-[#EF451C] text-white shadow' : 'text-slate-600'}`}>All Time</button>
                <button onClick={() => setDateFilter('30d')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${dateFilter === '30d' ? 'bg-[#EF451C] text-white shadow' : 'text-slate-600'}`}>Last 30 Days</button>
                <button onClick={() => setDateFilter('7d')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${dateFilter === '7d' ? 'bg-[#EF451C] text-white shadow' : 'text-slate-600'}`}>Last 7 Days</button>
            </div>
             <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search by Order #" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-lg"/>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatCard icon={<DollarSign size={24}/>} title="Total Earnings" value={`$${stats.totalEarnings}`} color="text-green-500 bg-green-500"/>
            <StatCard icon={<PackageCheck size={24}/>} title="Total Deliveries" value={stats.totalDeliveries.toString()} color="text-blue-500 bg-blue-500"/>
            <StatCard icon={<Calculator size={24}/>} title="Avg. Earning/Delivery" value={`$${stats.averageEarning}`} color="text-orange-500 bg-orange-500"/>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-md overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Earning</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Date Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedDeliveries.length > 0 ? (
                paginatedDeliveries.map((delivery) => (
                  <tr key={delivery._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-800">{delivery.order_number}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{delivery.user_email}</td>
                    <td className="px-6 py-4 font-bold text-green-600">${Number(delivery.delivery_fee || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(delivery.delivered_at).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-500">
                    <p className="font-semibold">No Earnings Record Found.</p>
                    <p className="text-sm">No completed deliveries match your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-lg bg-white border hover:bg-slate-100 disabled:opacity-50">Previous</button>
            <div className='text-sm text-slate-700'>Page {currentPage} of {totalPages}</div>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg bg-white border hover:bg-slate-100 disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderEarnings;