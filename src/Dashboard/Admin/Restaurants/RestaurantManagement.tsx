import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Star,
  MapPin,
  Edit,
  Trash2,
  ServerCrash,
  UtensilsCrossed,
} from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

/* ---------------- Types ---------------- */
type RestaurantStatus = "open" | "closed" | "pending" | "suspended";

interface Location {
  lat?: number;
  lng?: number;
}

interface Restaurant {
  _id: string;
  name: string;
  owner?: string;
  email?: string;
  phone?: string;
  cuisine?: string;
  address?: string;
  photoURL?: string;
  location?: Location;
  status: RestaurantStatus;
  rating?: number;
  reviews_count?: number;
  is_verified?: boolean;
  created_at?: string;
  // UI-only
  isDropdownOpen?: boolean;
}

/* ---------------- Helpers ---------------- */
const getStatusDisplay = (status?: RestaurantStatus) => {
  switch (status) {
    case "open":
      return { text: "Open", className: "bg-green-100 text-green-800" };
    case "closed":
      return { text: "Closed", className: "bg-gray-100 text-gray-800" };
    case "pending":
      return { text: "Pending", className: "bg-yellow-100 text-yellow-800" };
    case "suspended":
      return { text: "Suspended", className: "bg-red-100 text-red-800" };
    default:
      return { text: "Unknown", className: "bg-gray-200 text-gray-800" };
  }
};

const getInitials = (name: string = "") => {
  if (!name) return "?";
  const words = name.trim().split(" ");
  if (words.length > 1) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

/* ---------------- Main Component ---------------- */
export default function RestaurantManagement() {
  const axiosSecure = useAxiosSecure();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [statusFilter, setStatusFilter] = useState<"All" | RestaurantStatus>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modal, setModal] = useState<{ type: string; restaurant: Restaurant | null }>({
    type: "",
    restaurant: null,
  });

  /* Fetch restaurants */
  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // GET /restaurants
        const res = await axiosSecure.get("/restaurants");
        // server might return array or {data: []}
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        // ensure status default
        const normalized: Restaurant[] = data.map((r: any) => ({ status: r.status || "pending", ...r }));
        setRestaurants(normalized);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to load restaurants.");
      } finally {
        setTimeout(() => setIsLoading(false), 300);
      }
    };
    fetch();
  }, [axiosSecure]);

  /* Derived filtered list */
  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter((r) => statusFilter === "All" || r.status === statusFilter)
      .filter(
        (r) =>
          (r.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.cuisine || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [restaurants, statusFilter, searchTerm]);

  /* Utility to update local restaurant immediately */
  const updateRestaurantLocal = (id: string, updates: Partial<Restaurant>) => {
    setRestaurants((prev) => prev.map((p) => (p._id === id ? { ...p, ...updates } : p)));
  };

  /* Change status (optimistic) - PATCH /restaurants/:id with { status } */
  const handleStatusChange = async (id: string, status: RestaurantStatus) => {
    const prev = restaurants.find((r) => r._id === id);
    updateRestaurantLocal(id, { status, isDropdownOpen: false });
    try {
      await axiosSecure.patch(`/restaurants/${id}`, { status });
    } catch (err: any) {
      // rollback
      if (prev) updateRestaurantLocal(id, { status: prev.status });
      setError(err.response?.data?.message || "Failed to update status.");
    }
  };

  /* Open modal */
  const openModal = (type: string, restaurant: Restaurant) => setModal({ type, restaurant });

  const closeModal = () => setModal({ type: "", restaurant: null });

  /* Delete (soft) - DELETE /restaurants/:id */
  const handleDelete = async (id: string) => {
    const prev = restaurants;
    // optimistic: mark as name "[Deleted]" or remove - here we'll remove from list
    setRestaurants((p) => p.filter((r) => r._id !== id));
    try {
      await axiosSecure.delete(`/restaurants/${id}`);
    } catch (err: any) {
      setRestaurants(prev);
      setError(err.response?.data?.message || "Failed to delete restaurant.");
    }
  };

  /* Update rating - PATCH /restaurants/:id/rating */
  const handleRatingUpdate = async (id: string, rating: number) => {
    const prev = restaurants.find((r) => r._id === id);
    updateRestaurantLocal(id, { rating });
    try {
      await axiosSecure.patch(`/restaurants/${id}/rating`, { rating });
    } catch (err: any) {
      if (prev) updateRestaurantLocal(id, { rating: prev.rating });
      setError(err.response?.data?.message || "Failed to update rating.");
    }
  };

  // Replace your existing handleUpdate with this
const handleUpdate = async (id: string, payload: Partial<Restaurant>) => {
  const prevItem = restaurants.find((r) => r._id === id);
  // optimistic local update (keeps UI responsive)
  updateRestaurantLocal(id, payload);

  try {
    // send a clean payload (strip undefined)
    const cleaned: Record<string, any> = {};
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined) cleaned[k] = v;
    });

    const res = await axiosSecure.patch(`/restaurants/${id}`, cleaned);

    // normalize possible shapes: server might return updated entity directly or { data: {...} }
    const serverObj = res?.data?.data ?? res?.data ?? null;

    if (serverObj && typeof serverObj === 'object') {
      // use server-authoritative object
      updateRestaurantLocal(id, serverObj as Partial<Restaurant>);
    } else {
      // if no server object, keep optimistic update (already applied)
    }
  } catch (err: any) {
    // rollback if possible
    if (prevItem) updateRestaurantLocal(id, prevItem);
    console.error('Update failed', err);
    setError(err?.response?.data?.message || err?.message || 'Failed to update restaurant.');
  }
};


  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 text-gray-500">
        <UtensilsCrossed className="animate-spin text-[#EF451C]" size={48} />
        <p className="mt-4 text-lg font-semibold">Loading restaurants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center bg-gray-50 p-4">
        <ServerCrash className="text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold mb-2">Error</h2>
        <p className="text-gray-500 max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Restaurant Management</h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow flex space-x-1 border border-gray-200 p-1 rounded-lg">
              {(["All", "open", "closed", "pending", "suspended"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`w-full py-2 px-3 text-sm font-semibold rounded-md transition-all capitalize ${
                    statusFilter === tab ? "bg-[#EF451C] text-white shadow" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search restaurants, cuisine or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Restaurant</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Cuisine</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredRestaurants.map((r) => {
                const statusDisplay = getStatusDisplay(r.status);
                return (
                  <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {r.photoURL ? (
                          <img className="h-10 w-10 rounded-full object-cover ring-2 ring-offset-2 ring-gray-100" src={r.photoURL} alt={r.name} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-offset-2 ring-gray-100">
                            <span className="text-sm font-bold text-gray-600">{getInitials(r.name)}</span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{r.name}</div>
                          <div className="text-sm text-gray-500">{r.owner ? `${r.owner} • ${r.email || "N/A"}` : r.email}</div>
                          <div className="text-xs text-gray-400">{r.address || "Address not set"}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.cuisine || "—"}</td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusDisplay.className}`}>
                        {statusDisplay.text}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex items-center gap-2 justify-start">
                        <Star size={14} className="text-yellow-400" />
                        <span>{(r.rating ?? 0).toFixed(1)} ({r.reviews_count ?? 0})</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center text-sm font-medium relative">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {/* Status dropdown */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setRestaurants((prev) =>
                                prev.map((item) =>
                                  item._id === r._id ? { ...item, isDropdownOpen: !item.isDropdownOpen } : { ...item, isDropdownOpen: false }
                                )
                              )
                            }
                            className="bg-gray-100 text-gray-800 hover:bg-gray-200 py-1 px-3 rounded-md text-xs inline-flex items-center"
                          >
                            Update Status
                          </button>

                          {r.isDropdownOpen && (
                            <div className="absolute right-0 mt-1 flex flex-col bg-white border border-gray-200 rounded-md shadow-lg w-36 z-10 animate-fade-in">
                              {(["open", "closed", "pending", "suspended"] as const).map((s) => (
                                <button
                                  key={s}
                                  onClick={() => handleStatusChange(r._id, s)}
                                  className="px-3 py-2 text-sm text-left hover:bg-gray-100 capitalize transition"
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Rating */}
                        <button
                          onClick={() => openModal("rating", r)}
                          className="bg-blue-100 text-blue-800 hover:bg-blue-200 py-1 px-3 rounded-md text-xs inline-flex items-center"
                        >
                          <Star size={14} className="mr-1" /> Rating
                        </button>

                        {/* Location */}
                        <button
                          onClick={() => openModal("location", r)}
                          className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 py-1 px-3 rounded-md text-xs inline-flex items-center"
                        >
                          <MapPin size={14} className="mr-1" /> Location
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openModal("edit", r)}
                          className="bg-orange-100 text-orange-800 hover:bg-orange-200 py-1 px-3 rounded-md text-xs inline-flex items-center"
                        >
                          <Edit size={14} className="mr-1" /> Edit
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => openModal("delete", r)}
                          className="bg-red-100 text-red-800 hover:bg-red-200 py-1 px-3 rounded-md text-xs inline-flex items-center"
                        >
                          <Trash2 size={14} className="mr-1" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredRestaurants.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No restaurants found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal.restaurant && (
        <RestaurantActionModal
          modal={modal}
          onClose={closeModal}
          onDelete={(id) => {
            handleDelete(id);
            closeModal();
          }}
          onUpdate={(id, payload) => {
            handleUpdate(id, payload);
            closeModal();
          }}
          onUpdateRating={(id, rating) => {
            handleRatingUpdate(id, rating);
            closeModal();
          }}
        />
      )}
    </div>
  );
}

/* ---------------- Modal Component ---------------- */
function RestaurantActionModal({
  modal,
  onClose,
  onDelete,
  onUpdate,
  onUpdateRating,
}: {
  modal: { type: string; restaurant: Restaurant | null };
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, payload: Partial<Restaurant>) => void;
  onUpdateRating: (id: string, rating: number) => void;
}) {
  const restaurant = modal.restaurant;
  if (!restaurant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const payload: any = Object.fromEntries(formData.entries());

    // normalize numeric fields
    if (payload.rating !== undefined) payload.rating = parseFloat(payload.rating);
    if (payload.lat !== undefined) payload.lat = parseFloat(payload.lat);
    if (payload.lng !== undefined) payload.lng = parseFloat(payload.lng);

    if (modal.type === "rating") {
      onUpdateRating(restaurant._id, payload.rating);
    } else if (modal.type === "location") {
      onUpdate(restaurant._id, { location: { lat: payload.lat, lng: payload.lng } });
    } else if (modal.type === "edit") {
      // send only editable fields
      const updated: Partial<Restaurant> = {
        name: payload.name,
        phone: payload.phone,
        cuisine: payload.cuisine,
        address: payload.address,
        email: payload.email,
      };
      onUpdate(restaurant._id, updated);
    } else if (modal.type === "delete") {
      onDelete(restaurant._id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
        <h2 className="text-lg font-bold mb-4 text-gray-800 capitalize">
          {modal.type === "delete" ? "Confirm Delete" : `Update ${modal.type}`}
        </h2>

        {modal.type === "delete" ? (
          <div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{restaurant.name}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
              <button
                onClick={() => handleSubmit({ preventDefault: () => {} } as any)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {modal.type === "rating" && (
              <input
                name="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                defaultValue={restaurant.rating ?? 0}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Rating (0–5)"
                required
              />
            )}

            {modal.type === "location" && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="lat"
                  type="number"
                  step="any"
                  defaultValue={restaurant.location?.lat}
                  placeholder="Latitude"
                  className="border rounded-lg px-3 py-2"
                  required
                />
                <input
                  name="lng"
                  type="number"
                  step="any"
                  defaultValue={restaurant.location?.lng}
                  placeholder="Longitude"
                  className="border rounded-lg px-3 py-2"
                  required
                />
              </div>
            )}

            {modal.type === "edit" && (
              <>
                <input name="name" defaultValue={restaurant.name} className="w-full border rounded-lg px-3 py-2" placeholder="Name" required />
                <input name="owner" defaultValue={restaurant.owner} className="w-full border rounded-lg px-3 py-2" placeholder="Owner" />
                <input name="email" defaultValue={restaurant.email} className="w-full border rounded-lg px-3 py-2" placeholder="Email" />
                <input name="phone" defaultValue={restaurant.phone} className="w-full border rounded-lg px-3 py-2" placeholder="Phone" />
                <input name="cuisine" defaultValue={restaurant.cuisine} className="w-full border rounded-lg px-3 py-2" placeholder="Cuisine" />
                <input name="address" defaultValue={restaurant.address} className="w-full border rounded-lg px-3 py-2" placeholder="Address" />
              </>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-[#EF451C] text-white rounded-lg hover:bg-[#d63b14]">
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
