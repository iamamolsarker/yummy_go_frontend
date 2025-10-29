/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, type JSX } from "react";
import {
  Search,
  Edit,
  MoreVertical,
  UtensilsCrossed,
  ServerCrash,
} from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAuth from "../../../hooks/useAuth";

type OrderType = {
  _id: string;
  order_number: string;
  user_email: string;
  restaurant_id?: string;
  rider_id?: string | null;
  items: Array<{ name?: string; quantity?: number; price?: number }>;
  subtotal: number;
  delivery_fee: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method?: string;
  delivery_address?: any;
  restaurant_address?: any;
  estimated_delivery_time?: string;
  actual_delivery_time?: string | null;
  preparation_time?: string | null;
  special_instructions?: string;
  placed_at?: string;
  confirmed_at?: string | null;
  prepared_at?: string | null;
  picked_up_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  created_at?: string;
  updated_at?: string;
  // UI toggles
  isDropdownOpen?: boolean;
  isPaymentDropdownOpen?: boolean;
  isAssignDropdownOpen?: boolean;
  isActionsOpen?: boolean;
};

type RiderType = {
  _id: string;
  name: string;
  status?: string;
};

export default function OrdersManagement(): JSX.Element {
  const axiosSecure = useAxiosSecure();
  const {user} = useAuth();

  // Data
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [riders, setRiders] = useState<RiderType[]>([]);

  // UI
  const [statusFilter, setStatusFilter] = useState<"All" | string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);


  const [modal, setModal] = useState<{ type: string; order: OrderType | null }>({
    type: "",
    order: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;
 

  // Step 1: Get restaurant ID by logged-in owner's email
useEffect(() => {
  let mounted = true;

  const fetchRestaurantId = async () => {
    try {
      setIsLoading(true);
      if (!user) throw new Error("User not logged in");

      const email = user.email;
      if (!email) throw new Error("User email not found");

      const res = await axiosSecure.get(`/restaurants/email/${email}`);
      // normalize server response - it may return different shapes:
      // { data: { ... } }, { data: [...] }, or the object directly
      const raw = res?.data;
      // useful debug log (will appear in browser console)
      // console.debug('fetchRestaurantId response', raw);

      let restaurant: any = raw?.data ?? raw;
      // if an array was returned, pick first
      if (Array.isArray(restaurant)) restaurant = restaurant[0];
      // sometimes nested under .data.data
      if (!restaurant && raw?.data?.data) restaurant = raw.data.data;
      if (Array.isArray(restaurant)) restaurant = restaurant[0];
      if (!mounted) return;

      const id = restaurant?._id || restaurant?.id || restaurant?.restaurantId || null;
      setRestaurantId(id);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch restaurant info.");
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  fetchRestaurantId();

  return () => { mounted = false; };
}, [axiosSecure, user]);


  // Fetch orders for restaurant
  useEffect(() => {
    if (!restaurantId) {
      setIsLoading(false); // stop loading
      setError("Restaurant ID is not available.");
      setOrders([]); // clear orders
      return;
    }

    let mounted = true;

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const res = await axiosSecure.get(`/orders/restaurant/${restaurantId}`);
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        if (!mounted) return;
        const normalized = data.map((o: any) => ({
          ...o,
          isDropdownOpen: false,
          isPaymentDropdownOpen: false,
          isAssignDropdownOpen: false,
          isActionsOpen: false,
        }));
        setOrders(normalized);
        setError(null); // clear previous errors
      } catch (err) {
        console.error(err);
        setError("Failed to load orders."); // show error in UI
        setOrders([]); // clear orders so table doesn't crash
      } finally {
        setTimeout(() => setIsLoading(false), 300);
      }
    };

    fetchOrders();
    return () => { mounted = false; };
  }, [axiosSecure, restaurantId]);


  const fetchAvailableRiders = async () => {
    try {
      const res = await axiosSecure.get("/riders/available");
      const data = Array.isArray(res.data) ? res.data : res.data?.data || res.data || [];
      setRiders(data);
    } catch (err) {
      console.error("Failed to load available riders", err);
      toast.error("Failed to load available riders");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => statusFilter === "All" || o.status === statusFilter)
      .filter((o) => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return true;
        return (
          String(o.order_number || "").toLowerCase().includes(q) ||
          String(o.user_email || "").toLowerCase().includes(q)
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

  const closeModal = () => setModal({ type: "", order: null });

  // ----- API Handlers -----
  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await axiosSecure.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status, isDropdownOpen: false } : o)));
      toast.success("Order status updated");
    } catch (err) { console.error(err); toast.error("Failed to update order status"); }
  };

  const handlePaymentChange = async (orderId: string, payment_status: string) => {
    try {
      await axiosSecure.patch(`/orders/${orderId}/payment`, { payment_status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, payment_status, isPaymentDropdownOpen: false } : o)));
      toast.success("Payment status updated");
    } catch (err) { console.error(err); toast.error("Failed to update payment status"); }
  };

  const handleAssignRider = async (orderId: string, riderId: string) => {
    try {
      await axiosSecure.patch(`/orders/${orderId}/rider`, { rider_id: riderId });
      await axiosSecure.patch(`/riders/${riderId}/status`, { status: "busy" });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, rider_id: riderId, isAssignDropdownOpen: false } : o)));
      toast.success("Rider assigned");
    } catch (err) { console.error(err); toast.error("Failed to assign rider"); }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await axiosSecure.patch(`/orders/${orderId}/cancel`);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: "cancelled" } : o)));
      toast.success("Order cancelled");
      closeModal();
    } catch (err) { console.error(err); toast.error("Failed to cancel order"); }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await axiosSecure.delete(`/orders/${orderId}`);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      toast.success("Order deleted");
      closeModal();
    } catch (err) { console.error(err); toast.error("Failed to delete order"); }
  };

  const getPaymentColorClass = (ps: string) => {
    if (!ps) return "bg-gray-100 text-gray-800";
    if (ps.toLowerCase() === "paid") return "bg-green-100 text-green-800";
    if (ps.toLowerCase() === "pending") return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };


  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Orders Management</h1>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow flex space-x-1 border border-gray-200 p-1 rounded-lg">
              {["All", "pending", "confirmed", "prepared", "picked_up", "delivered", "cancelled"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setStatusFilter(tab); setCurrentPage(1); }}
                  className={`w-full py-2 px-3 text-sm font-semibold rounded-md transition-all capitalize ${statusFilter === tab ? "bg-[#EF451C] text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#EF451C]/50"
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-x-auto min-h-[200px]">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center p-12 text-gray-500">
              <UtensilsCrossed className="animate-spin text-[#EF451C]" size={48} />
              <p className="mt-4 text-lg font-semibold">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center p-12 text-gray-500">
              <ServerCrash className="text-red-500 mb-4" size={48} />
              <p className="text-lg font-semibold">Failed to load orders.</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No orders found.</div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">User Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Assign Rider</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{order.order_number}</td>
                    <td className="px-6 py-4">{order.user_email}</td>
                    <td className="px-6 py-4">${Number(order.total_amount || 0).toFixed(2)}</td>

                    {/* Status Dropdown */}
                    <td className="px-6 py-4 relative">
                      <div className="inline-block">
                        <button
                          onClick={() =>
                            setOrders((prev) =>
                              prev.map((o) =>
                                o._id === order._id ? { ...o, isDropdownOpen: !o.isDropdownOpen } : { ...o, isDropdownOpen: false }
                              )
                            )
                          }
                          className="bg-gray-100 text-gray-800 hover:bg-gray-200 py-1 px-3 rounded-md text-xs inline-flex items-center"
                        >
                          {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "Unknown"}
                          <Edit size={14} className="ml-1" />
                        </button>
                        {order.isDropdownOpen && (
                          <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-40 z-10">
                            {["pending", "confirmed", "prepared", "picked_up", "delivered", "cancelled"].map((s) => (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(order._id, s)}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 capitalize ${order.status === s ? "bg-[#EF451C] text-white" : ""}`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Payment Dropdown */}
                    <td className="px-6 py-4 relative">
                      <div className="inline-block">
                        <button
                          onClick={() =>
                            setOrders((prev) =>
                              prev.map((o) => o._id === order._id ? { ...o, isPaymentDropdownOpen: !o.isPaymentDropdownOpen } : { ...o, isPaymentDropdownOpen: false })
                            )
                          }
                          className={`py-1 px-3 rounded-md text-xs inline-flex items-center ${getPaymentColorClass(order.payment_status)}`}
                        >
                          {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : "Unknown"}
                          <Edit size={14} className="ml-1" />
                        </button>
                        {order.isPaymentDropdownOpen && (
                          <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-36 z-10">
                            {["paid", "pending"].map((ps) => (
                              <button
                                key={ps}
                                onClick={() => handlePaymentChange(order._id, ps)}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 capitalize ${order.payment_status === ps ? "bg-[#EF451C] text-white" : ""}`}
                              >
                                {ps}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Assign Rider */}
                    <td className="px-6 py-4 relative">
                      <div className="inline-block">
                        <button
                          onClick={() => {
                            fetchAvailableRiders();
                            setOrders((prev) =>
                              prev.map((o) =>
                                o._id === order._id ? { ...o, isAssignDropdownOpen: !o.isAssignDropdownOpen } : { ...o, isAssignDropdownOpen: false }
                              )
                            );
                          }}
                          className="bg-gray-100 text-gray-800 hover:bg-gray-200 py-1 px-3 rounded-md text-xs inline-flex items-center"
                        >
                          {order.rider_id ? (riders.find((r) => r._id === order.rider_id)?.name || "Assigned") : "Assign"}
                          <Edit size={14} className="ml-1" />
                        </button>
                        {order.isAssignDropdownOpen && (
                          <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-56 z-10 max-h-64 overflow-auto">
                            {riders.length === 0 && <div className="px-3 py-2 text-sm text-gray-500">No available riders</div>}
                            {riders.map((r) => (
                              <button
                                key={r._id}
                                onClick={() => handleAssignRider(order._id, r._id)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                              >
                                {r.name} {r.status ? `(${r.status})` : ""}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center relative">
                      <button
                        onClick={() =>
                          setOrders((prev) =>
                            prev.map((o) => o._id === order._id ? { ...o, isActionsOpen: !o.isActionsOpen } : { ...o, isActionsOpen: false })
                          )
                        }
                        className="p-1 text-gray-500 hover:text-gray-800"
                        aria-label="actions"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {order.isActionsOpen && (
                        <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-40 z-10">
                          <button
                            onClick={() => setModal({ type: "view", order })}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                          >
                            View
                          </button>
                          <button
                            onClick={() => setModal({ type: "cancel", order })}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-red-600"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => setModal({ type: "delete", order })}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredOrders.length > perPage && (
          <div className="mt-4 flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Prev
            </button>
            <span>Page {currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Next
            </button>
          </div>
        )}

        {/* Modals */}
        {modal.type === "view" && modal.order && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg w-96 p-6 relative">
              <h2 className="text-xl font-bold mb-4">Order #{modal.order.order_number}</h2>
              <p><strong>User:</strong> {modal.order.user_email}</p>
              <p><strong>Status:</strong> {modal.order.status}</p>
              <p><strong>Payment:</strong> {modal.order.payment_status}</p>
              <p><strong>Total:</strong> ${modal.order.total_amount.toFixed(2)}</p>
              <p className="mt-2"><strong>Items:</strong></p>
              <ul className="list-disc ml-5">
                {modal.order.items.map((i, idx) => (
                  <li key={idx}>{i.quantity}x {i.name} - ${i.price}</li>
                ))}
              </ul>
              <button onClick={closeModal} className="mt-4 px-4 py-2 bg-[#EF451C] text-white rounded hover:bg-[#d53b17]">Close</button>
            </div>
          </div>
        )}

        {modal.type === "cancel" && modal.order && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg w-96 p-6 relative">
              <h2 className="text-xl font-bold mb-4">Cancel Order #{modal.order.order_number}?</h2>
              <div className="flex justify-end space-x-2">
                <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">No</button>
                <button onClick={() => handleCancelOrder(modal.order!._id)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Yes, Cancel</button>
              </div>
            </div>
          </div>
        )}

        {modal.type === "delete" && modal.order && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg w-96 p-6 relative">
              <h2 className="text-xl font-bold mb-4">Delete Order #{modal.order.order_number}?</h2>
              <div className="flex justify-end space-x-2">
                <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">No</button>
                <button onClick={() => handleDeleteOrder(modal.order!._id)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Yes, Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
