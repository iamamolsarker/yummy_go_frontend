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
  ChevronRight,
} from "lucide-react";

// Make sure to import hooks from your project's correct path
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";

// --- Type Definitions ---
type DeliveryType = {
  _id: string;
  order_number: string;
  user_email: string;
  total_amount: number;
  status: 'delivered' | 'cancelled';
  delivery_address?: any;
  restaurant_address?: any;
  delivered_at?: string;
  cancelled_at?: string;
};

// --- Helper Components ---
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'delivered') {
    return (
      <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 py-1 px-3 rounded-md text-xs font-bold">
        <CheckCircle2 size={14} /> Delivered
      </span>
    );
  }
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-2 bg-red-100 text-red-800 py-1 px-3 rounded-md text-xs font-bold">
        <XCircle size={14} /> Cancelled
      </span>
    );
  }
  return <span className="capitalize">{status}</span>;
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
  const perPage = 10;

  useEffect(() => {
    if (authLoading || !user) {
      setIsLoading(authLoading);
      return;
    }

    const fetchDeliveryHistory = async () => {
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
        
        const historyData = data.filter(
          (d: any) => d.status === 'delivered' || d.status === 'cancelled'
        );
        setDeliveries(historyData);

      } catch (err: any) {
        console.error("API Fetch Error:", err);
        setError(err?.response?.data?.message || "Failed to load delivery history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliveryHistory();
  }, [user, authLoading, axiosSecure]);

  const filteredDeliveries = useMemo(() => {
    return deliveries
      .filter((d) => statusFilter === 'All' || d.status === statusFilter)
      .filter((d) => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return true;
        return (
          d.order_number.toLowerCase().includes(query) ||
          d.user_email.toLowerCase().includes(query)
        );
      });
  }, [deliveries, statusFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredDeliveries.length / perPage));
  
  const paginatedDeliveries = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredDeliveries.slice(start, start + perPage);
  }, [filteredDeliveries, currentPage]);

  const formatAddress = (addr: any): string => {
    if (!addr) return "N/A";
    if (typeof addr === "string") return addr;
    return [addr.street, addr.area, addr.city].filter(Boolean).join(", ");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 text-slate-500">
        <History className="animate-spin text-[#EF451C]" size={48} />
        <p className="mt-4 text-lg font-semibold">Loading Delivery History...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center bg-slate-50 p-4">
        <ServerCrash className="text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold mb-2">Error Loading History</h2>
        <p className="text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-slate-800">My Delivery History 📜</h1>
        <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow flex space-x-1 border border-slate-200 p-1 rounded-lg">
              {(['All', 'delivered', 'cancelled'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setStatusFilter(tab);
                    setCurrentPage(1);
                  }}
                  className={`w-full py-2 px-3 text-sm font-semibold rounded-md transition-all capitalize ${
                    statusFilter === tab ? "bg-[#EF451C] text-white shadow" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by Order # or User..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#EF451C]/50"
              />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-md overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Route</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Date Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedDeliveries.length > 0 ? (
                paginatedDeliveries.map((delivery) => (
                  <tr key={delivery._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{delivery.order_number}</div>
                      <div className="text-xs text-slate-500">{delivery.user_email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed size={16} className="text-[#EF451C] flex-shrink-0" />
                        <span>{formatAddress(delivery.restaurant_address)}</span>
                        <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
                        <MapPin size={16} className="text-blue-500 flex-shrink-0" />
                        <span>{formatAddress(delivery.delivery_address)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">${Number(delivery.total_amount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center"><StatusBadge status={delivery.status} /></td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {delivery.status === 'delivered' && delivery.delivered_at ? new Date(delivery.delivered_at).toLocaleDateString() : delivery.cancelled_at ? new Date(delivery.cancelled_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    <p className="font-semibold">No history found.</p>
                    <p className="text-sm">No completed or cancelled deliveries match your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white border hover:bg-slate-100 disabled:opacity-50"
            >
              Previous
            </button>
            <div className='text-sm text-slate-700'>
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white border hover:bg-slate-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderHistory;