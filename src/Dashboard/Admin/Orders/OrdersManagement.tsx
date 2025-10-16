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

/**
 * OrdersManagement - Single-file admin orders page
 *
 * - Client-side pagination (20 orders per page)
 * - Filters (status tabs + search)
 * - Status & payment dropdowns (update API)
 * - Assign rider dropdown (GET /riders/available -> PATCH /orders/:id/rider & PATCH /riders/:id/status)
 * - 3-dot vertical actions menu: View (invoice modal), Cancel, Delete
 * - Invoice modal styled with Yummy Go theme
 * - Toast notifications for actions
 *
 * Replace any relative import paths to suit your project structure (useAxiosSecure).
 */

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

  // Data
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [riders, setRiders] = useState<RiderType[]>([]);

  // UI
  const [statusFilter, setStatusFilter] = useState<"All" | string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal: {type: 'view'|'cancel'|'delete', order }
  const [modal, setModal] = useState<{ type: string; order: OrderType | null }>({
    type: "",
    order: null,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;

  // Fetch orders once (client-side)
  useEffect(() => {
    let mounted = true;
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const res = await axiosSecure.get("/orders");
        // support both array and { data: [...] } shapes
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        if (!mounted) return;
        // ensure booleans for toggles
        const normalized = data.map((o: any) => ({ ...o, isDropdownOpen: false, isPaymentDropdownOpen: false, isAssignDropdownOpen: false, isActionsOpen: false }));
        setOrders(normalized);
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to load orders.");
      } finally {
        setTimeout(() => setIsLoading(false), 300);
      }
    };
    fetchOrders();
    return () => {
      mounted = false;
    };
  }, [axiosSecure]);

  // Helper: fetch available riders
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

  // Filtered orders (before pagination)
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
  // clamp page if needed
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredOrders.slice(start, start + perPage);
  }, [filteredOrders, currentPage]);

  // UI helpers
  const closeModal = () => setModal({ type: "", order: null });

  // API action handlers (update local state on success)
  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await axiosSecure.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status, isDropdownOpen: false } : o)));
      toast.success("Order status updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order status");
    }
  };

  const handlePaymentChange = async (orderId: string, payment_status: string) => {
    try {
      await axiosSecure.patch(`/orders/${orderId}/payment`, { payment_status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, payment_status, isPaymentDropdownOpen: false } : o)));
      toast.success("Payment status updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update payment status");
    }
  };

  const handleAssignRider = async (orderId: string, riderId: string) => {
    try {
      // assign rider to order
      await axiosSecure.patch(`/orders/${orderId}/rider`, { rider_id: riderId });
      // set rider to busy
      await axiosSecure.patch(`/riders/${riderId}/status`, { status: "busy" });

      // reflect locally: assign rider id to order
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, rider_id: riderId, isAssignDropdownOpen: false } : o)));
      toast.success("Rider assigned");
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign rider");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await axiosSecure.patch(`/orders/${orderId}/cancel`);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: "cancelled" } : o)));
      toast.success("Order cancelled");
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel order");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await axiosSecure.delete(`/orders/${orderId}`);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      toast.success("Order deleted");
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete order");
    }
  };

  // Payment color
  const getPaymentColorClass = (ps: string) => {
    if (!ps) return "bg-gray-100 text-gray-800";
    if (ps.toLowerCase() === "paid") return "bg-green-100 text-green-800";
    if (ps.toLowerCase() === "pending") return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  // Safety: format address object -> string
  const formatAddress = (addr: any) => {
    if (!addr) return "N/A";
    if (typeof addr === "string") return addr;
    const parts = [addr.street, addr.area, addr.city, addr.postal_code].filter(Boolean);
    const base = parts.join(", ");
    const phone = addr.phone ? ` | 📞 ${addr.phone}` : "";
    const ins = addr.instructions ? ` | 📝 ${addr.instructions}` : "";
    return base + phone + ins;
  };

  // Loading / Error UI
  if (isLoading)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 text-gray-500">
        <UtensilsCrossed className="animate-spin text-[#EF451C]" size={48} />
        <p className="mt-4 text-lg font-semibold">Loading orders...</p>
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

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Orders Management</h1>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow flex space-x-1 border border-gray-200 p-1 rounded-lg">
              {(
                [
                  "All",
                  "pending",
                  "confirmed",
                  "prepared",
                  "picked_up",
                  "delivered",
                  "cancelled",
                ] as const
              ).map((tab) => (
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#EF451C]/50"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-x-auto">
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

                  {/* Status */}
                  <td className="px-6 py-4 relative">
                    <div className="inline-block">
                      <button
                        onClick={() =>
                          setOrders((prev) =>
                            prev.map((o) => (o._id === order._id ? { ...o, isDropdownOpen: !o.isDropdownOpen } : { ...o, isDropdownOpen: false }))
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

                  {/* Payment */}
                  <td className="px-6 py-4 relative">
                    <div className="inline-block">
                      <button
                        onClick={() =>
                          setOrders((prev) =>
                            prev.map((o) => (o._id === order._id ? { ...o, isPaymentDropdownOpen: !o.isPaymentDropdownOpen } : { ...o, isPaymentDropdownOpen: false }))
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
                            prev.map((o) => (o._id === order._id ? { ...o, isAssignDropdownOpen: !o.isAssignDropdownOpen } : { ...o, isAssignDropdownOpen: false }))
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

                  {/* Actions - 3 dot vertical */}
                  <td className="px-6 py-4 text-center relative">
                    <button
                      onClick={() =>
                        setOrders((prev) =>
                          prev.map((o) => (o._id === order._id ? { ...o, isActionsOpen: !o.isActionsOpen } : { ...o, isActionsOpen: false }))
                        )
                      }
                      className="p-1 text-gray-500 hover:text-gray-800"
                      aria-label="actions"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {order.isActionsOpen && (
                      <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-44 z-10 flex flex-col">
                        <button
                          onClick={() => setModal({ type: "view", order })}
                          className="px-3 py-2 text-sm hover:bg-gray-100 text-left"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => setModal({ type: "cancel", order })}
                          className="px-3 py-2 text-sm hover:bg-gray-100 text-left"
                        >
                          Cancel Order
                        </button>
                        <button
                          onClick={() => setModal({ type: "delete", order })}
                          className="px-3 py-2 text-sm hover:bg-gray-100 text-left"
                        >
                          Delete Order
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* No results */}
          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-gray-500">No orders found.</div>
          )}
        </div>

        {/* Pagination controls */}
        {filteredOrders.length > perPage && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <div>
              Page {currentPage} of {Math.ceil(filteredOrders.length / perPage)}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredOrders.length / perPage), p + 1))}
              disabled={currentPage === Math.ceil(filteredOrders.length / perPage)}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ---------- Modal (View / Cancel / Delete) ---------- */}
      {modal.order && (
        <OrderModal
          modal={modal}
          onClose={() => setModal({ type: "", order: null })}
          onCancelOrder={handleCancelOrder}
          onDeleteOrder={handleDeleteOrder}
          formatAddress={formatAddress}
        />
      )}
    </div>
  );
}

/* ---------------- Order Modal (inline) ---------------- */
function OrderModal({
  modal,
  onClose,
  onCancelOrder,
  onDeleteOrder,
  formatAddress,
}: {
  modal: { type: string; order: OrderType | null };
  onClose: () => void;
  onCancelOrder: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  formatAddress: (addr: any) => string;
}) {
  const order = modal.order;
  const [isProcessing, setIsProcessing] = useState(false);

  if (!order) return null;

  const handleConfirm = async () => {
    if (!order) return;
    setIsProcessing(true);
    try {
      if (modal.type === "delete") {
        await onDeleteOrder(order._id);
      } else if (modal.type === "cancel") {
        await onCancelOrder(order._id);
      }
      setIsProcessing(false);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-2xl font-extrabold text-[#EF451C]">Yummy Go</div>
            <div className="text-sm text-gray-500">Order Invoice</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Order #</div>
            <div className="font-semibold">{order.order_number}</div>
            <div className="text-xs text-gray-400 mt-1">{order.placed_at ? new Date(order.placed_at).toLocaleString() : ""}</div>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
          <div className="border p-3 rounded">
            <div className="font-semibold mb-1">Delivery Address</div>
            <div className="text-gray-700">{formatAddress(order.delivery_address)}</div>
          </div>
          <div className="border p-3 rounded">
            <div className="font-semibold mb-1">Restaurant Address</div>
            <div className="text-gray-700">{formatAddress(order.restaurant_address)}</div>
          </div>
        </div>

        {/* Items (invoice table) */}
        <div className="mb-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#EF451C]/10">
                <th className="text-left px-3 py-2">Item</th>
                <th className="text-center px-3 py-2">Qty</th>
                <th className="text-right px-3 py-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.length > 0 ? (
                order.items.map((it, idx) => {
                  const name = it?.name || "Item";
                  const qty = Number(it?.quantity || 1);
                  const price = Number(it?.price || 0);
                  return (
                    <tr key={idx} className="border-b last:border-b-0">
                      <td className="px-3 py-2">{name}</td>
                      <td className="px-3 py-2 text-center">{qty}</td>
                      <td className="px-3 py-2 text-right">${(price).toFixed(2)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-gray-500">No items</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex flex-col md:flex-row md:justify-end gap-2">
          <div className="w-full md:w-1/2 border rounded p-4 bg-gray-50">
            <div className="flex justify-between text-sm py-1">
              <div>Subtotal</div>
              <div>${Number(order.subtotal || 0).toFixed(2)}</div>
            </div>
            <div className="flex justify-between text-sm py-1">
              <div>Delivery Fee</div>
              <div>${Number(order.delivery_fee || 0).toFixed(2)}</div>
            </div>
            <div className="flex justify-between text-sm py-1">
              <div>Tax</div>
              <div>${Number(order.tax_amount || 0).toFixed(2)}</div>
            </div>
            <div className="flex justify-between text-sm py-1">
              <div>Discount</div>
              <div>-${Number(order.discount_amount || 0).toFixed(2)}</div>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
              <div>Total</div>
              <div>${Number(order.total_amount || 0).toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 mt-6">
          {modal.type === "view" ? (
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Close
            </button>
          ) : (
            <>
              <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" disabled={isProcessing}>
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className={`px-4 py-2 rounded text-white ${modal.type === "delete" ? "bg-red-500 hover:bg-red-600" : "bg-yellow-500 hover:bg-yellow-600"}`}
              >
                {isProcessing ? "Processing..." : modal.type === "delete" ? "Delete" : "Cancel Order"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
