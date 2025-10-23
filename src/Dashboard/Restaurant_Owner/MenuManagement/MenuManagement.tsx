/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useAuth } from "../../../hooks/useAuth";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Star,
  StarOff,
  X,
  Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";

/**
 * MenuManagement
 * - Full CRUD for restaurant menus
 * - Image upload to imgbb -> stored as `image` in backend payload
 * - Form includes extended fields to match your backend schema
 * - Defensive handling of API shapes (data, { data: [...] }, insertOne result)
 */

/* ---------- Types ---------- */
interface Restaurant {
  _id: string;
  name?: string;
  email?: string;
  [k: string]: any;
}

interface MenuItem {
  _id: string;
  restaurant_id?: string;
  name: string;
  description?: string | null;
  price: number;
  category?: string;
  image?: string | null;
  ingredients?: string[];
  allergens?: string[];
  nutrition?: {
    calories?: number | null;
    protein?: string | null;
    carbs?: string | null;
    fat?: string | null;
    [k: string]: any;
  };
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_halal?: boolean;
  is_available?: boolean;
  is_featured?: boolean;
  preparation_time?: string;
  rating?: number;
  total_reviews?: number;
  created_at?: string;
  updated_at?: string;
  // UI
  isActionsOpen?: boolean;
}

type NewMenuItem = {
  name: string;
  description?: string;
  price: number;
  category?: string;
  image?: string | null;
  ingredients?: string[]; // stored as array
  allergens?: string[]; // stored as array
  nutrition?: {
    calories?: number | null;
    protein?: string | null;
    carbs?: string | null;
    fat?: string | null;
  };
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_halal?: boolean;
  is_available?: boolean;
  is_featured?: boolean;
  preparation_time?: string;
};

/* ---------- Component ---------- */
const MenuManagement: React.FC = () => {
  const axiosSecure = useAxiosSecure();
  const { user, loading: authLoading } = useAuth();

  // Data
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);

  // UI
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);

  const [search, setSearch] = useState<string>("");

  // New / Edit form state
  const [form, setForm] = useState<NewMenuItem>({
    name: "",
    description: "",
    price: 0,
    category: "main_course",
    image: null,
    ingredients: [],
    allergens: [],
    nutrition: { calories: null, protein: null, carbs: null, fat: null },
    is_vegetarian: false,
    is_vegan: false,
    is_halal: true,
    is_available: true,
    is_featured: false,
    preparation_time: "15-20 mins",
  });

  /* ---------------- Fetch menus when auth + user ready ---------------- */
  useEffect(() => {
    if (authLoading) return;
    if (!user?.email) {
      setErrorMsg("Please log in to view menus.");
      setLoading(false);
      return;
    }

    let mounted = true;
    const fetchMenus = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        // fetch restaurant by email
        const resRest = await axiosSecure.get(`/restaurants/email/${user.email}`);
        // API may return either { success: true, data: {...} } or { ... } directly
        const restaurantData = resRest?.data?.data ?? resRest?.data ?? null;

        if (!restaurantData?._id) {
          setErrorMsg("No restaurant found for this user.");
          setLoading(false);
          return;
        }
        if (!mounted) return;
        setRestaurant(restaurantData);

        // fetch menus for restaurant
        const resMenus = await axiosSecure.get(`/restaurants/${restaurantData._id}/menus`);
        // resMenus may be an array or { data: [...] } or { success: true, data: [...] }
        const payload = resMenus?.data ?? resMenus;
        const finalMenus = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];

        if (!mounted) return;
        // defensive: ensure numeric price and default flags
        const normalized = finalMenus.map((m: any) => ({
          ...m,
          price: typeof m.price === "string" ? Number(m.price) || 0 : m.price ?? 0,
          image: m.image ?? null,
          ingredients: Array.isArray(m.ingredients) ? m.ingredients : (m.ingredients ? [String(m.ingredients)] : []),
          allergens: Array.isArray(m.allergens) ? m.allergens : (m.allergens ? [String(m.allergens)] : []),
          nutrition: m.nutrition ?? { calories: null, protein: null, carbs: null, fat: null },
          is_vegetarian: !!m.is_vegetarian,
          is_vegan: !!m.is_vegan,
          is_halal: m.is_halal === undefined ? true : !!m.is_halal,
          is_available: m.is_available === undefined ? true : !!m.is_available,
          is_featured: !!m.is_featured,
        })) as MenuItem[];

        setMenus(normalized);
      } catch (err: any) {
        console.error("Fetch menus failed:", err);
        setErrorMsg("Failed to load menus.");
        toast.error("Failed to load menus.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
    return () => {
      mounted = false;
    };
  }, [axiosSecure, authLoading, user?.email]);

  /* ---------------- Image upload to imgbb (stores `image`) ---------------- */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_UPLOAD_API}`,
        { method: "POST", body: fd }
      );
      const json = await res.json();
      if (json?.success && json.data?.url) {
        setForm((f) => ({ ...f, image: json.data.url }));
        toast.success("Image uploaded (imgbb) ✅");
      } else {
        console.error("imgbb response:", json);
        toast.error("Image upload failed");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Image upload error");
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- Helper: normalize outgoing payload to backend shape ---------------- */
  const buildPayloadForBackend = (payload: NewMenuItem) => {
    // backend expects: restaurant_id, name, description, price, category, image, ingredients (array),
    // allergens (array), nutrition (object with calories/protein/carbs/fat), booleans, preparation_time, etc.
    return {
      // note: restaurant_id added by caller
      name: payload.name,
      description: payload.description ?? null,
      price: Number(payload.price ?? 0),
      category: payload.category ?? "main_course",
      image: payload.image ?? null,
      ingredients: Array.isArray(payload.ingredients) ? payload.ingredients : (payload.ingredients ? [String(payload.ingredients)] : []),
      allergens: Array.isArray(payload.allergens) ? payload.allergens : (payload.allergens ? [String(payload.allergens)] : []),
      nutrition: {
        calories: payload.nutrition?.calories ?? null,
        protein: payload.nutrition?.protein ?? null,
        carbs: payload.nutrition?.carbs ?? null,
        fat: payload.nutrition?.fat ?? null,
      },
      is_vegetarian: !!payload.is_vegetarian,
      is_vegan: !!payload.is_vegan,
      is_halal: payload.is_halal === undefined ? true : !!payload.is_halal,
      is_available: payload.is_available === undefined ? true : !!payload.is_available,
      is_featured: !!payload.is_featured,
      preparation_time: payload.preparation_time ?? "15-20 mins",
      rating: payload["rating"] ?? 0,
      total_reviews: payload["total_reviews"] ?? 0,
    };
  };

  /* ---------------- Add or Update menu ---------------- */
  const handleSubmitMenu = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!restaurant?._id) {
      toast.error("Restaurant not ready.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = buildPayloadForBackend(form);

      if (editing) {
        // update
        const res = await axiosSecure.patch(`/restaurants/${restaurant._id}/menus/${editing._id}`, payload);
        // result may be updateOne result; backend may not return updated document
        const resData = res?.data ?? res;
        // best-effort: merge locally
        setMenus((prev) =>
          prev.map((m) =>
            m._id === editing._id
              ? {
                  ...(m as MenuItem),
                  ...payload,
                  image: payload.image ?? m.image,
                  updated_at: new Date().toISOString(),
                }
              : m
          )
        );
        toast.success("Menu updated successfully");
      } else {
        // create
        const res = await axiosSecure.post(`/restaurants/${restaurant._id}/menus`, {
          ...payload,
          restaurant_id: restaurant._id,
        });

        // Backend create returns insertOne result or possibly { success: true, data: {...} }
        const resData = res?.data ?? res;

        // Build new local menu object for immediate UI update
        let newMenu: MenuItem;
        if (resData?.insertedId) {
          newMenu = {
            _id: String(resData.insertedId),
            restaurant_id: restaurant._id,
            ...payload,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as MenuItem;
        } else if (resData?.data && typeof resData.data === "object") {
          // if server returns created doc in data
          newMenu = {
            ...(resData.data as any),
            price: Number(resData.data.price ?? payload.price),
            image: resData.data.image ?? payload.image,
          } as MenuItem;
        } else if (resData?._id) {
          // maybe server returned the doc
          newMenu = {
            ...(resData as any),
            price: Number(resData.price ?? payload.price),
            image: resData.image ?? payload.image,
          } as MenuItem;
        } else {
          // fallback synthetic
          newMenu = {
            _id: String(Date.now()),
            restaurant_id: restaurant._id,
            ...payload,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as MenuItem;
        }

        setMenus((prev) => [newMenu, ...prev]);
        toast.success("Menu added successfully");
      }

      // reset form + close
      setForm({
        name: "",
        description: "",
        price: 0,
        category: "main_course",
        image: null,
        ingredients: [],
        allergens: [],
        nutrition: { calories: null, protein: null, carbs: null, fat: null },
        is_vegetarian: false,
        is_vegan: false,
        is_halal: true,
        is_available: true,
        is_featured: false,
        preparation_time: "15-20 mins",
      });
      setEditing(null);
      setShowModal(false);
    } catch (err: any) {
      console.error("Save menu error:", err);
      toast.error(err?.response?.data?.message ?? "Failed to save menu item");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- Delete (soft delete via backend) ---------------- */
  const handleDelete = async (menuId: string) => {
    if (!restaurant?._id) return;
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      await axiosSecure.delete(`/restaurants/${restaurant._id}/menus/${menuId}`);
      // backend marks is_available=false, remove from list for owner UI
      setMenus((prev) => prev.filter((m) => m._id !== menuId));
      toast.success("Menu deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete menu item");
    }
  };

  /* ---------------- Toggle featured ---------------- */
  const toggleFeatured = async (menuId: string, currentlyFeatured: boolean) => {
    if (!restaurant?._id) return;
    try {
      await axiosSecure.patch(`/restaurants/${restaurant._id}/menus/${menuId}`, { is_featured: !currentlyFeatured });
      setMenus((prev) => prev.map((m) => (m._id === menuId ? { ...m, is_featured: !currentlyFeatured } : m)));
      toast.success(!currentlyFeatured ? "Marked featured" : "Removed featured");
    } catch (err) {
      console.error("Toggle featured error:", err);
      toast.error("Failed to update featured flag");
    }
  };

  /* ---------------- Edit click ---------------- */
  const handleEditClick = (menu: MenuItem) => {
    setEditing(menu);
    setForm({
      name: menu.name ?? "",
      description: menu.description ?? "",
      price: Number(menu.price ?? 0),
      category: menu.category ?? "main_course",
      image: menu.image ?? null,
      ingredients: menu.ingredients ?? [],
      allergens: menu.allergens ?? [],
      nutrition: {
        calories: menu.nutrition?.calories ?? null,
        protein: menu.nutrition?.protein ?? null,
        carbs: menu.nutrition?.carbs ?? null,
        fat: menu.nutrition?.fat ?? null,
      },
      is_vegetarian: !!menu.is_vegetarian,
      is_vegan: !!menu.is_vegan,
      is_halal: menu.is_halal === undefined ? true : !!menu.is_halal,
      is_available: menu.is_available === undefined ? true : !!menu.is_available,
      is_featured: !!menu.is_featured,
      preparation_time: menu.preparation_time ?? "15-20 mins",
    });
    setShowModal(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------------- Filtered menus (search) ---------------- */
  const filteredMenus = menus.filter((m) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      String(m.name ?? "").toLowerCase().includes(q) ||
      String(m.description ?? "").toLowerCase().includes(q) ||
      String(m.category ?? "").toLowerCase().includes(q)
    );
  });

  /* ---------------- UI rendering ---------------- */
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Menu Management</h1>
            <p className="text-sm text-gray-500 mt-1">Create and manage your restaurant's menu items.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search menu..."
                className="border border-gray-200 rounded-lg px-3 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-[#EF451C]/40"
              />
            </div>
            <button
              onClick={() => { setEditing(null); setShowModal(true); }}
              className="inline-flex items-center gap-2 bg-[#EF451C] text-white px-4 py-2 rounded-lg hover:bg-[#d63a13] transition"
            >
              <Plus size={16} /> Add Menu
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">All Menu Items</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#EF451C]" />
            </div>
          ) : errorMsg ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-semibold mb-2">{errorMsg}</p>
              <p className="text-gray-500">Menus could not be loaded. Try again later.</p>
            </div>
          ) : Array.isArray(filteredMenus) && filteredMenus.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Featured</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMenus.map((menu) => (
                    <tr key={menu._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <img src={menu.image ?? "/placeholder.jpg"} alt={menu.name} className="w-14 h-14 object-cover rounded-lg border" />
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">{menu.name}</td>
                      <td className="px-6 py-4 text-gray-600">{menu.category}</td>
                      <td className="px-6 py-4 font-semibold text-[#EF451C]">৳{Number(menu.price ?? 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => toggleFeatured(menu._id, !!menu.is_featured)} className="inline-flex items-center justify-center">
                          {menu.is_featured ? <Star className="w-5 h-5 text-yellow-400" /> : <StarOff className="w-5 h-5 text-gray-300" />}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-3">
                          <button onClick={() => handleEditClick(menu)} className="text-blue-600 hover:text-blue-800" title="Edit">
                            <Pencil />
                          </button>
                          <button onClick={() => handleDelete(menu._id)} className="text-red-600 hover:text-red-800" title="Delete">
                            <Trash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No menu items found.</div>
          )}
        </div>
      </div>

      {/* ---------- Modal: Add / Edit ---------- */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{editing ? "Edit Menu Item" : "Add Menu Item"}</h3>
                  <p className="text-sm text-gray-500 mt-1">Fill the details below and save. Images upload to ImgBB and are saved as <code>image</code>.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setShowModal(false); setEditing(null); }} className="text-gray-500 hover:text-gray-700">
                    <X />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitMenu} className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column - main details */}
                <div className="space-y-3">
                  <label className="block text-sm text-gray-600">Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border p-3 rounded-lg" />

                  <label className="block text-sm text-gray-600">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border p-3 rounded-lg">
                    <option value="appetizer">Appetizer</option>
                    <option value="main_course">Main Course</option>
                    <option value="dessert">Dessert</option>
                    <option value="beverage">Beverage</option>
                    <option value="side">Side</option>
                  </select>

                  <label className="block text-sm text-gray-600">Price (BDT)</label>
                  <input required type="number" step="0.01" value={String(form.price)} onChange={(e) => setForm({ ...form, price: Number(e.target.value || 0) })} className="w-full border p-3 rounded-lg" />

                  <label className="block text-sm text-gray-600">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full border p-3 rounded-lg" />

                  <label className="block text-sm text-gray-600">Preparation time</label>
                  <input value={form.preparation_time} onChange={(e) => setForm({ ...form, preparation_time: e.target.value })} className="w-full border p-3 rounded-lg" />
                </div>

                {/* Right column - advanced & image */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Image (ImgBB)</label>
                    <div className="flex gap-2 items-center">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="border p-2 rounded-lg" />
                      {uploading && <div className="text-sm text-gray-500">Uploading...</div>}
                    </div>
                    {form.image && <img src={form.image} alt="preview" className="mt-3 w-40 h-40 object-cover rounded-lg border" />}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600">Ingredients (comma separated)</label>
                    <input value={(form.ingredients ?? []).join(", ")} onChange={(e) => setForm({ ...form, ingredients: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className="w-full border p-3 rounded-lg" />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600">Allergens (comma separated)</label>
                    <input value={(form.allergens ?? []).join(", ")} onChange={(e) => setForm({ ...form, allergens: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className="w-full border p-3 rounded-lg" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm text-gray-600">Calories</label>
                      <input value={form.nutrition?.calories ?? ""} onChange={(e) => setForm({ ...form, nutrition: { ...(form.nutrition ?? {}), calories: e.target.value ? Number(e.target.value) : null } })} className="w-full border p-2 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Protein</label>
                      <input value={form.nutrition?.protein ?? ""} onChange={(e) => setForm({ ...form, nutrition: { ...(form.nutrition ?? {}), protein: e.target.value ?? null } })} className="w-full border p-2 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Carbs</label>
                      <input value={form.nutrition?.carbs ?? ""} onChange={(e) => setForm({ ...form, nutrition: { ...(form.nutrition ?? {}), carbs: e.target.value ?? null } })} className="w-full border p-2 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Fat</label>
                      <input value={form.nutrition?.fat ?? ""} onChange={(e) => setForm({ ...form, nutrition: { ...(form.nutrition ?? {}), fat: e.target.value ?? null } })} className="w-full border p-2 rounded-lg" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={!!form.is_vegetarian} onChange={(e) => setForm({ ...form, is_vegetarian: e.target.checked })} /> Vegetarian
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={!!form.is_vegan} onChange={(e) => setForm({ ...form, is_vegan: e.target.checked })} /> Vegan
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={!!form.is_halal} onChange={(e) => setForm({ ...form, is_halal: e.target.checked })} /> Halal
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={!!form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Featured
                    </label>
                    <label className="flex items-center gap-2 text-sm col-span-2">
                      <input type="checkbox" checked={!!form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} /> Available
                    </label>
                  </div>
                </div>

                {/* Full width footer controls */}
                <div className="lg:col-span-2 flex items-center justify-end gap-3 mt-3">
                  <button type="button" onClick={() => { setShowModal(false); setEditing(null); }} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-5 py-2 bg-[#EF451C] text-white rounded-lg hover:bg-[#d63a13] flex items-center gap-2">
                    {submitting ? <><Loader2 className="animate-spin w-4 h-4" /> Saving...</> : (editing ? "Update Menu" : "Add Menu")}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuManagement;
