/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Truck,
  MapPin,
  UtensilsCrossed,
  ServerCrash,
  CheckCircle2,
  ChevronDown,
  XCircle,
  Loader2,
  AlertTriangle,
  Clock // <-- FIX: Added Clock import
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import type { JSX, ReactNode } from 'react/jsx-runtime';

// --- Type Definitions ---
type DeliveryStatus = 'assigned' | 'picked_up' | 'delivered' | 'cancelled' | string;

type DeliveryType = {
  _id: string;
  order_id: string;
  order_number: string;
  rider_id: string;
  user_email: string;
  restaurant_id: string;
  status: DeliveryStatus;
  pickup_address?: { street?: string | null; city?: string | null; area?: string | null; contact_phone?: string | null; latitude?: number | null; longitude?: number | null; };
  delivery_address?: { street?: string | null; city?: string | null; area?: string | null; postal_code?: string | null; latitude?: number | null; longitude?: number | null; contact_phone?: string | null; instructions?: string | null; };
  delivery_fee?: number;
  assigned_at?: string;
  accepted_at?: string | null;
  picked_up_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  estimated_pickup_time?: string | null;
  estimated_delivery_time?: string | null;
  isDropdownOpen?: boolean;
};

// --- Main Component ---
export default function RiderOrders(): JSX.Element {
  const { user, loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [deliveries, setDeliveries] = useState<DeliveryType[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | DeliveryStatus>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // --- Data Fetching ---
  useEffect(() => {
    let isMounted = true;
    if (authLoading || !user?.email) {
      setIsLoading(authLoading);
      if (!authLoading && !user?.email) {
        setError("Please log in to view deliveries.");
        setIsLoading(false);
      }
      return () => { isMounted = false; };
    }

    const fetchRiderDataAndDeliveries = async () => {
      const riderEmail = user.email;
      if (!isMounted) return;
      setIsLoading(true);
      setError(null);

      try {
        console.log(`Fetching rider details for: ${riderEmail}`);
        const riderResponse = await axiosSecure.get(`/riders/email/${riderEmail}`);
        const riderId = riderResponse.data?._id || riderResponse.data?.data?._id;

        if (!riderId) {
          throw new Error("Could not find rider profile.");
        }
        console.log(`Rider ID found: ${riderId}`);

        console.log(`Fetching deliveries for rider ID: ${riderId}`);
        const deliveriesResponse = await axiosSecure.get(`/deliveries/rider/${riderId}`);
        const data = Array.isArray(deliveriesResponse.data) ? deliveriesResponse.data : (deliveriesResponse.data?.data || []);
        console.log(`Received ${data.length} deliveries.`);

        if (isMounted) {
          const normalized = data.map((d: any) => ({
            ...d,
            delivery_fee: parseFloat(d.delivery_fee) || 0,
            isDropdownOpen: false
          }));
          setDeliveries(normalized);
        }

      } catch (err: any) {
        console.error("API Fetch Error:", err);
        if (isMounted) {
            if (err.response?.status === 404 && err.config?.url?.includes('/riders/email/')) {
                 setError("Could not find rider profile. Ensure application approved.");
            } else {
                setError(err?.response?.data?.message || err.message || "Failed to load deliveries.");
            }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchRiderDataAndDeliveries();
    return () => { isMounted = false; };
  }, [user, authLoading, axiosSecure]);

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
      .sort((a, b) => {
          const statusOrder: Record<string, number> = { assigned: 1, picked_up: 2, delivered: 3, cancelled: 4 };
          const orderA = statusOrder[a.status] || 99;
          const orderB = statusOrder[b.status] || 99;
          if (orderA !== orderB) return orderA - orderB;
          const timeA = new Date(a.assigned_at || a.picked_up_at || a.delivered_at || a.cancelled_at || 0).getTime();
          const timeB = new Date(b.assigned_at || b.picked_up_at || b.delivered_at || b.cancelled_at || 0).getTime();
          return timeB - timeA;
      });
  }, [deliveries, statusFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredDeliveries.length / perPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedDeliveries = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredDeliveries.slice(start, start + perPage);
  }, [filteredDeliveries, currentPage, perPage]);

  // --- Action Handlers ---
  const handleStatusChange = async (deliveryId: string, status: DeliveryStatus) => {
    setOpenDropdownId(null);
    const currentDelivery = deliveries.find(d => d._id === deliveryId);
    if (!currentDelivery || ['delivered', 'cancelled'].includes(currentDelivery.status)) {
        toast.info("Delivery already completed or cancelled.");
        return;
    }
     if ((currentDelivery.status === 'picked_up' && status === 'assigned')) {
         toast.warn(`Cannot change status backwards.`);
         return;
    }
     if (currentDelivery.status === 'assigned' && status === 'delivered') {
         toast.warn(`Mark as 'Picked Up' first.`);
         return;
     }
    updateLocalDelivery(deliveryId, { status }); // Optimistic UI
    try {
        console.log(`Updating delivery ${deliveryId} status to ${status}`);
        await axiosSecure.patch(`/deliveries/${deliveryId}/status`, { status });
        toast.success(`Delivery marked as ${status.replace('_', ' ')}!`);
    } catch (err: any) {
        console.error("Status Update Error:", err);
        toast.error(err.response?.data?.message || "Failed to update status.");
        if (currentDelivery) { // Revert on error
            updateLocalDelivery(deliveryId, { status: currentDelivery.status });
        }
    }
  };

  const updateLocalDelivery = (id: string, updates: Partial<DeliveryType>) => {
      setDeliveries(prev => prev.map(d => d._id === id ? { ...d, ...updates } : d));
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdownId(prevId => (prevId === id ? null : id));
  };

  // --- Helper Functions ---
  const formatAddress = (addr: any): string => {
    if (!addr) return "N/A";
    if (typeof addr === "string") return addr;
    const parts = [addr.street, addr.area, addr.city].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Address details missing";
  };

  const riderSettableStatuses: DeliveryStatus[] = ['picked_up', 'delivered'];

  const statusUIConfig: Record<string, { color: string; icon?: ReactNode }> = {
    assigned: { color: 'bg-blue-100 text-blue-800', icon: <Clock size={14}/> },
    picked_up: { color: 'bg-yellow-100 text-yellow-800', icon: <Truck size={14}/> },
    delivered: { color: 'bg-green-100 text-green-800', icon: <CheckCircle2 size={14} /> },
    cancelled: { color: 'bg-red-100 text-red-800', icon: <XCircle size={14} /> },
    default: { color: 'bg-slate-100 text-slate-800', icon: <AlertTriangle size={14} /> }
  };

  // --- Loading & Error States ---
  if (isLoading) return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-150px)] bg-slate-50 text-slate-500">
           {/* FIX: Use className for responsive size */}
          <Loader2 className="animate-spin text-[#EF451C] h-10 w-10 sm:h-12 sm:w-12" />
          <p className="mt-4 text-base sm:text-lg font-semibold">Loading Your Deliveries...</p>
      </div>
  );

  if (error) return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-150px)] text-center bg-slate-50 p-4">
           {/* FIX: Use className for responsive size */}
          <ServerCrash className="text-red-500 mb-4 h-10 w-10 sm:h-12 sm:w-12" />
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-slate-800">Error Loading Deliveries</h2>
          <p className="text-slate-500 text-sm sm:text-base">{error}</p>
      </div>
  );

  // --- Main JSX ---
  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false}/>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-slate-800">My Deliveries 🚚</h1>

        {/* Filters & Search Bar */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap sm:flex-nowrap gap-1 border border-slate-200 p-1 rounded-lg w-full md:w-auto">
              {['All', 'assigned', 'picked_up', 'delivered', 'cancelled'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setStatusFilter(tab); setCurrentPage(1); }}
                  className={`flex-1 sm:flex-none py-1.5 px-2 sm:py-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-md transition-all capitalize whitespace-nowrap ${
                    statusFilter === tab ? "bg-[#EF451C] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>
            {/* Search Input */}
            <div className="relative w-full md:flex-grow md:min-w-[200px] lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              <input type="text" placeholder="Search Order # or Customer..." value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#EF451C] focus:border-[#EF451C]" />
            </div>
          </div>
        </div>

        {/* Deliveries Table Container */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 align-top">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Order Info</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Pickup</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Dropoff</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status / Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {paginatedDeliveries.length > 0 ? (
                paginatedDeliveries.map((delivery) => {
                  const uiConfig = statusUIConfig[delivery.status] || statusUIConfig.default;
                  const canUpdate = ['assigned', 'picked_up'].includes(delivery.status);

                  return (
                    <tr key={delivery._id} className="hover:bg-slate-50 transition-colors duration-150 text-xs sm:text-sm">
                      {/* Order Info */}
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap align-top">
                        <div className="font-semibold text-slate-800">{delivery.order_number || 'N/A'}</div>
                        <div className="text-slate-500">{delivery.user_email || 'N/A'}</div>
                        {typeof delivery.delivery_fee === 'number' &&
                            <div className="text-green-600 font-medium mt-1">Fee: ৳{delivery.delivery_fee.toFixed(2)}</div>
                        }
                      </td>
                      {/* Pickup Address */}
                      <td className="px-4 sm:px-6 py-4 whitespace-normal text-slate-700 hidden md:table-cell max-w-xs align-top">
                        <div className="flex items-start gap-2">
                          <UtensilsCrossed size={16} className="text-[#EF451C] mt-0.5 flex-shrink-0" />
                          <span>{formatAddress(delivery.pickup_address)}</span>
                        </div>
                      </td>
                      {/* Dropoff Address */}
                      <td className="px-4 sm:px-6 py-4 whitespace-normal text-slate-700 max-w-xs align-top">
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>{formatAddress(delivery.delivery_address)}</span>
                        </div>
                      </td>
                      {/* Status/Action */}
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center align-top">
                        {canUpdate ? (
                          <div className="relative inline-block text-left">
                            <button onClick={() => toggleDropdown(delivery._id)}
                              className={`inline-flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-bold capitalize transition-colors w-28 ${uiConfig.color} hover:brightness-95`}>
                              {delivery.status.replace('_', ' ')}
                              <ChevronDown size={14} className={`${openDropdownId === delivery._id ? 'rotate-180' : ''} transition-transform`} />
                            </button>
                            {openDropdownId === delivery._id && (
                              <div className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                <div className="py-1" role="none">
                                  {riderSettableStatuses
                                    .filter(s =>
                                      (delivery.status === 'assigned' && s === 'picked_up') ||
                                      (delivery.status === 'picked_up' && s === 'delivered')
                                    )
                                    .map((s) => (
                                      <button key={s} onClick={() => handleStatusChange(delivery._id, s as DeliveryStatus)} // Cast status
                                        className="w-full text-left block px-4 py-2 text-xs sm:text-sm capitalize text-slate-700 hover:bg-slate-100 hover:text-slate-900" role="menuitem">
                                        Mark as {s.replace('_', ' ')}
                                      </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-bold capitalize ${uiConfig.color}`}>
                            {uiConfig.icon}
                            {delivery.status.replace('_', ' ')}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                 })
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-10 sm:py-12 px-4 sm:px-6 text-slate-500">
                    <Truck size={28} className="mx-auto mb-2 text-slate-400" />
                    <p className="font-semibold text-sm sm:text-base">No deliveries found.</p>
                    <p className="text-xs sm:text-sm mt-1">Try adjusting filters or check for new assignments.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button>
            <div className='text-xs sm:text-sm text-slate-700 font-medium'>Page {currentPage} of {totalPages}</div>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}