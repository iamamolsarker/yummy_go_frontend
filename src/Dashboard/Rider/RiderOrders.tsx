/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Edit,
  Truck,
  MapPin,
  UtensilsCrossed,
  ServerCrash,
  CheckCircle2,
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Local Imports ---
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import type { JSX } from 'react/jsx-runtime';

// --- Type Definitions ---
type OrderType = {
  _id: string;
  order_number: string;
  user_email: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'prepared' | 'picked_up' | 'delivered' | 'cancelled';
  delivery_address?: any;
  restaurant_address?: any;
  placed_at?: string;
  isDropdownOpen?: boolean;
};

// --- Main Component ---
export default function RiderOrders(): JSX.Element {
  const { user, loading } = useAuth();
  const axiosSecure = useAxiosSecure();

  // --- Component State ---
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;

  // --- Data Fetching Effect with 2-Step Logic ---
  useEffect(() => {
    if (loading || !user) {
      setIsLoading(loading);
      return;
    }

    const fetchRiderDataAndDeliveries = async () => {
      const riderEmail = user?.email;

      if (!riderEmail) {
        setError('Rider email not found. Please log in again.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // 👉 Step 1: Get the rider's ID using their email
        // আপনার API গাইড অনুযায়ী, এই রুটে একজন ইউজারের প্রোফাইল পাওয়া যায়
        const userProfileResponse = await axiosSecure.get(`/users/${riderEmail}`);
        const riderId = userProfileResponse.data?.data?._id || userProfileResponse.data?._id;

        if (!riderId) {
          throw new Error("Could not retrieve rider's ID from profile.");
        }

        // 👉 Step 2: Use the retrieved rider ID to get their deliveries
        // আপনার deliveryRoutes.js অনুযায়ী এই রুটটি ব্যবহার করা হচ্ছে
        const deliveriesResponse = await axiosSecure.get(`/deliveries/rider/${riderId}`);
        const data = Array.isArray(deliveriesResponse.data) ? deliveriesResponse.data : deliveriesResponse.data?.data || [];
        
        const normalized = data.map((o: any) => ({ ...o, isDropdownOpen: false }));
        setOrders(normalized);

      } catch (err: any) {
        console.error("API Fetch Error:", err);
        setError(err?.response?.data?.message || "Failed to load your deliveries.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRiderDataAndDeliveries();
  }, [user, loading, axiosSecure]);

  // --- Memoized Filtering and Pagination (No Changes) ---
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => statusFilter === 'All' || o.status === statusFilter)
      .filter((o) => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return true;
        return (
          String(o.order_number || "").toLowerCase().includes(query) ||
          String(o.user_email || "").toLowerCase().includes(query)
        );
      });
  }, [orders, statusFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / perPage));
  
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredOrders.slice(start, start + perPage);
  }, [filteredOrders, currentPage]);

  // --- Action Handlers (No Changes) ---
  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await axiosSecure.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: status as OrderType['status'], isDropdownOpen: false } : o)));
      toast.success(`Order marked as ${status.replace('_', ' ')}!`);
    } catch (err) {
      console.error("Status Update Error:", err);
      toast.error("Failed to update order status.");
    }
  };

  // --- Helper Functions (No Changes) ---
  const formatAddress = (addr: any): string => {
    if (!addr) return "N/A";
    if (typeof addr === "string") return addr;
    const parts = [addr.street, addr.area, addr.city].filter(Boolean);
    return parts.join(", ");
  };

  const riderStatusOptions: OrderType['status'][] = ['picked_up', 'delivered'];

  // --- Conditional Rendering for Loading/Error States (No Changes) ---
  if (isLoading)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 text-gray-500">
        <Truck className="animate-pulse text-[#EF451C]" size={48} />
        <p className="mt-4 text-lg font-semibold">Loading your deliveries...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center bg-gray-50 p-4">
        <ServerCrash className="text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold mb-2">Error</h2>
        <p className="text-gray-500">{error}</p>
      </div>
    );

  // --- Main JSX (No Changes) ---
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">My Deliveries 🚚</h1>

        {/* Filters & Search Bar */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow flex space-x-1 border border-gray-200 p-1 rounded-lg">
              {['All', 'prepared', 'picked_up', 'delivered'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setStatusFilter(tab);
                    setCurrentPage(1);
                  }}
                  className={`w-full py-2 px-3 text-sm font-semibold rounded-md transition-all capitalize ${
                    statusFilter === tab ? "bg-[#EF451C] text-white shadow" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>
            <div className="relative min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search by Order # or User Email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#EF451C]/50"
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">From (Restaurant)</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">To (Customer)</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold">{order.order_number}</div>
                    <div className="text-xs text-gray-500">{order.user_email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed size={16} className="text-[#EF451C]" />
                      <span>{formatAddress(order.restaurant_address)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-blue-500" />
                      <span>{formatAddress(order.delivery_address)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800">${Number(order.total_amount || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    {order.status === 'delivered' || order.status === 'cancelled' ? (
                      <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 py-1 px-3 rounded-md text-xs font-bold">
                        <CheckCircle2 size={14} /> Completed
                      </span>
                    ) : (
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setOrders((prev) =>
                              prev.map((o) => (o._id === order._id ? { ...o, isDropdownOpen: !o.isDropdownOpen } : { ...o, isDropdownOpen: false }))
                            )
                          }
                          className="bg-gray-100 text-gray-800 hover:bg-gray-200 py-1 px-3 rounded-md text-xs inline-flex items-center capitalize"
                        >
                          {order.status.replace('_', ' ')}
                          <Edit size={14} className="ml-1" />
                        </button>
                        {order.isDropdownOpen && (
                          <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-40 z-10">
                            {riderStatusOptions.map((s) => (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(order._id, s)}
                                disabled={order.status === s}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 capitalize disabled:bg-gray-200 disabled:cursor-not-allowed ${
                                  order.status === s ? "bg-[#EF451C] text-white" : ""
                                }`}
                              >
                                Mark as {s.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
                <p className="font-semibold">No deliveries found.</p>
                <p className="text-sm">Try changing your filter.</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white border hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <div className='text-sm text-gray-700'>
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white border hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}