/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, type JSX } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  
  
  
} from "recharts";
import { Edit2, Save, XCircle, Image, Star } from "lucide-react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";

/**
 * DashboardOverview.tsx
 *
 * - Shows totals: menu items, reviews, orders, revenue
 * - 7-day revenue sparkline
 * - Recent reviews preview
 * - Top menu items preview
 * - Profile card with Edit modal (PUT /restaurants/:id)
 *
 * Assumes:
 * - GET /restaurants/email/:email
 * - GET /restaurants/:restaurantId/menus
 * - GET /orders/restaurant/:restaurantId
 * - GET /reviews/restaurant/:restaurantId   (you said you have reviews API earlier)
 * - PUT /restaurants/:id
 */

type Restaurant = {
  _id: string;
  name?: string;
  owner_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  rating?: number;
  status?: string;
  description?: string;
};

type MenuItem = {
  _id: string;
  name: string;
  price: number;
  orders_count?: number;
  rating?: number;
};

type OrderType = {
  _id: string;
  order_number?: string;
  total_amount: number;
  payment_status?: string;
  status?: string;
  placed_at: string;
};

type ReviewType = {
  _id: string;
  customer_name?: string;
  rating: number;
  comment?: string;
  created_at: string;
  menu_item?: string;
};

export default function DashboardOverview(): JSX.Element {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [reviews, setReviews] = useState<ReviewType[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Restaurant>>({});

  // Fetch restaurant -> menus, orders, reviews
  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!user?.email) throw new Error("User not logged in");

        // 1) restaurant by email
        const resR = await axiosSecure.get(`/restaurants/email/${user.email}`);
        const rest = resR.data?.data || resR.data;
        if (!rest?._id) throw new Error("Restaurant not found");
        if (!mounted) return;
        setRestaurant(rest);

        const id = rest._id;

        // parallel fetch menus, orders, reviews
        const [resMenus, resOrders, resReviews] = await Promise.all([
          axiosSecure.get(`/restaurants/${id}/menus`),
          axiosSecure.get(`/orders/restaurant/${id}`),
          axiosSecure.get(`/reviews/restaurant/${id}`).catch(() => ({ data: [] })), // graceful if reviews route missing
        ]);

        if (!mounted) return;

        const menuData: MenuItem[] = Array.isArray(resMenus.data) ? resMenus.data : resMenus.data?.data || [];
        const ordersData: OrderType[] = Array.isArray(resOrders.data) ? resOrders.data : resOrders.data?.data || [];
        const reviewsData: ReviewType[] = Array.isArray(resReviews.data) ? resReviews.data : resReviews.data?.data || [];

        setMenus(menuData);
        setOrders(ordersData);
        setReviews(reviewsData);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err?.message || "Failed to load dashboard data.");
      } finally {
        if (mounted) setTimeout(() => setIsLoading(false), 300);
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, [axiosSecure, user]);

  // Derived metrics
  const totalMenuItems = menus.length;
  const totalReviews = reviews.length;
  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.payment_status === "paid");
  const totalRevenue = paidOrders.reduce((s, o) => s + (o.total_amount || 0), 0);

  // prepare 7-day revenue sparkline (last 7 days)
  const revenueByDay = useMemo(() => {
    const map: Record<string, number> = {};
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      days.push(key);
      map[key] = 0;
    }
    paidOrders.forEach((o) => {
      const key = new Date(o.placed_at).toLocaleDateString(undefined, { month: "short", day: "numeric" });
      if (map[key] !== undefined) map[key] += o.total_amount || 0;
    });
    return days.map((d) => ({ date: d, revenue: Number(map[d].toFixed(2)) }));
  }, [paidOrders]);

  // Top menu items by orders_count (or by rating fallback)
  const topMenus = useMemo(() => {
    const copy = [...menus];
    copy.sort((a, b) => (b.orders_count || 0) - (a.orders_count || 0) || (b.rating || 0) - (a.rating || 0));
    return copy.slice(0, 3);
  }, [menus]);

  // Recent reviews (latest 3)
  const recentReviews = useMemo(() => {
    return [...reviews].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 3);
  }, [reviews]);

  // Recent orders (latest 5)
  const recentOrders = useMemo(() => {
    return [...orders].sort((a, b) => +new Date(b.placed_at) - +new Date(a.placed_at)).slice(0, 5);
  }, [orders]);

  // Edit modal handlers
  const openEdit = () => {
    if (!restaurant) return;
    setEditForm({
      name: restaurant.name,
      owner_name: restaurant.owner_name,
      phone: restaurant.phone,
      address: restaurant.address,
      description: restaurant.description,
      logo_url: restaurant.logo_url,
    });
    setEditOpen(true);
  };

  const handleEditChange = (k: keyof Restaurant, v: any) => {
    setEditForm((prev) => ({ ...prev, [k]: v }));
  };
  const saveProfile = async () => {
    if (!restaurant) return;
    setIsSaving(true);
    setError(null);
    try {
      const payload = { ...editForm };
      console.log(restaurant._id)
      const res = await axiosSecure.put(`/restaurants/${restaurant._id}`, payload);
      const updated = res.data?.data || res.data;
      setRestaurant(updated);
      setEditOpen(false);
    } catch (err: any) {
      console.error("Error updating restaurant:", err);
      setError(err?.message || "Failed to update restaurant.");
    } finally {
      setIsSaving(false);
    }
  };

  // small helper: time ago
  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.floor(hr / 24);
    return `${d}d ago`;
  };

  // UI: skeleton
  if (isLoading)
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-lg bg-gray-200"></div>
              ))}
            </div>
            <div className="h-64 rounded-lg bg-gray-200" />
            <div className="h-40 rounded-lg bg-gray-200" />
          </div>
          <div className="space-y-4">
            <div className="h-48 rounded-lg bg-gray-200" />
            <div className="h-40 rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-sm text-gray-500 mt-1">Quick snapshot & controls for your restaurant</p>
          </div>
          
        </header>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: main area (span 2) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4 flex items-start gap-4">
                <div className="p-3 rounded bg-gradient-to-br from-orange-50 to-orange-100">
                  <Image className="text-orange-500" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Menu Items</p>
                  <p className="text-xl font-semibold text-gray-800">{totalMenuItems}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 flex items-start gap-4">
                <div className="p-3 rounded bg-gradient-to-br from-amber-50 to-amber-100">
                  <Star className="text-amber-500" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Reviews</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {totalReviews}{" "}
                    <span className="text-sm text-gray-400">({(restaurant?.rating || 0).toFixed(1)})</span>
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 flex items-start gap-4">
                <div className="p-3 rounded bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="w-4 h-4 rounded-full bg-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Orders</p>
                  <p className="text-xl font-semibold text-gray-800">{totalOrders}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 flex items-start gap-4">
                <div className="p-3 rounded bg-gradient-to-br from-green-50 to-green-100">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Revenue (BDT)</p>
                  <p className="text-xl font-semibold text-gray-800">{totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Sparkline + top menus */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">7-Day Revenue</h3>
                  <p className="text-xs text-gray-400">Past week</p>
                </div>
                <div className="h-36">
                  {revenueByDay.every((d) => d.revenue === 0) ? (
                    <div className="h-full flex items-center justify-center text-gray-400">No revenue in past 7 days</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueByDay}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tickFormatter={(v) => `${v}`} />
                        <Tooltip formatter={(v: number) => `BDT ${v.toFixed(2)}`} />
                        <Line type="monotone" dataKey="revenue" stroke="#EF451C" strokeWidth={3} dot />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Top Menu Items</h3>
                <div className="space-y-3">
                  {topMenus.length === 0 ? (
                    <div className="text-sm text-gray-400">No menu items yet</div>
                  ) : (
                    topMenus.map((m) => (
                      <div key={m._id} className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-800">{m.name}</div>
                          <div className="text-xs text-gray-400">{m.orders_count ?? 0} orders • BDT {m.price.toFixed(2)}</div>
                        </div>
                        <div className="text-sm text-gray-600">{(m.rating || 0).toFixed(1)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Recent Reviews</h3>
                <a className="text-sm text-[#EF451C] hover:underline" href="/dashboard/restaurant/reviews">View all</a>
              </div>
              <div className="space-y-3">
                {recentReviews.length === 0 ? (
                  <div className="text-sm text-gray-400">No reviews yet</div>
                ) : (
                  recentReviews.map((r) => (
                    <div key={r._id} className="flex gap-3 items-start">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                        {r.customer_name?.slice(0,1) ?? "U"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-800">{r.customer_name ?? "Anonymous"}</div>
                          <div className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={14} className={i < r.rating ? "text-amber-400" : "text-gray-200"} />
                            ))}
                          </div>
                          <div className="text-sm text-gray-600">{r.menu_item ? ` • ${r.menu_item}` : ""}</div>
                        </div>
                        <div className="text-sm text-gray-700 mt-2">{r.comment ?? "No comment"}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: profile + quick stats */}
          <aside className="space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                  {restaurant?.logo_url ? (

                    <img src={restaurant.logo_url} alt={restaurant.name} className="object-cover w-full h-full" />
                  ) : (
                    <div className="text-gray-400">No Logo</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold text-gray-800">{restaurant?.name ?? "Your Restaurant"}</div>
                      <div className="text-sm text-gray-500">{restaurant?.owner_name ?? "Owner"}</div>
                    </div>
                    <div className="text-sm text-gray-500">{restaurant?.status ?? "—"}</div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <div>{restaurant?.email}</div>
                    <div>{restaurant?.phone}</div>
                    <div className="mt-2 text-xs text-gray-400 line-clamp-3">{restaurant?.address}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={openEdit} className="flex-1 inline-flex items-center gap-2 justify-center px-3 py-2 bg-[#EF451C] text-white rounded">
                  <Edit2 size={14} /> Edit Info
                </button>
                <a href="/dashboard/restaurant/menu" className="flex-1 inline-flex items-center gap-2 justify-center px-3 py-2 border rounded">
                  Manage Menu
                </a>
              </div>
            </div>

            {/* Quick stats */}
            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Active Riders</div>
                  <div className="font-semibold text-gray-800">—</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Avg Delivery Time</div>
                  <div className="font-semibold text-gray-800">—</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Cancelled (7d)</div>
                  <div className="font-semibold text-gray-800">{orders.filter(o => o.status === "canceled").length}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Paid Orders</div>
                  <div className="font-semibold text-gray-800">{paidOrders.length}</div>
                </div>
              </div>
            </div>

            {/* Recent Orders mini */}
            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Orders</h4>
              <div className="space-y-2">
                {recentOrders.length === 0 ? (
                  <div className="text-sm text-gray-400">No orders yet</div>
                ) : (
                  recentOrders.map((o) => (
                    <div key={o._id} className="flex items-center justify-between text-sm">
                      <div>
                        <div className="font-medium text-gray-800">{o.order_number ?? o._id.slice(0, 6)}</div>
                        <div className="text-xs text-gray-500">{timeAgo(o.placed_at)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">BDT {o.total_amount.toFixed(2)}</div>
                        <div className="text-xs mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            o.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {o.payment_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-3 text-right">
                <a href="/dashboard/orders" className="text-sm text-[#EF451C] hover:underline">View all orders</a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && restaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Edit Restaurant Info</h3>
              <button onClick={() => setEditOpen(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Restaurant Name</label>
                  <input
                    className="mt-1 w-full border rounded px-3 py-2"
                    value={editForm.name ?? ""}
                    onChange={(e) => handleEditChange("name", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Owner Name</label>
                  <input
                    className="mt-1 w-full border rounded px-3 py-2"
                    value={editForm.owner_name ?? ""}
                    onChange={(e) => handleEditChange("owner_name", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Phone</label>
                  <input
                    className="mt-1 w-full border rounded px-3 py-2"
                    value={editForm.phone ?? ""}
                    onChange={(e) => handleEditChange("phone", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Logo URL</label>
                  <input
                    className="mt-1 w-full border rounded px-3 py-2"
                    value={editForm.logo_url ?? ""}
                    onChange={(e) => handleEditChange("logo_url", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Address</label>
                <textarea
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={editForm.address ?? ""}
                  onChange={(e) => handleEditChange("address", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Description</label>
                <textarea
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={editForm.description ?? ""}
                  onChange={(e) => handleEditChange("description", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => setEditOpen(false)} className="px-4 py-2 rounded border">
                  Cancel
                </button>
                <button
                  onClick={saveProfile}
                  className="px-4 py-2 rounded bg-[#EF451C] text-white inline-flex items-center gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? <Save size={14} className="animate-spin" /> : <Save size={14} />}
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
