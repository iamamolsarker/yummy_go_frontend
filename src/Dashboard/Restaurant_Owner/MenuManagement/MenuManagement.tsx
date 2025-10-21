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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ===== Types =====
interface Restaurant {
  _id: string;
  name: string;
  email: string;
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  featured?: boolean;
  rating?: number;
}

interface NewMenuItem {
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
}

const MenuManagement: React.FC = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<NewMenuItem>({
    name: "",
    description: "",
    price: 0,
    category: "",
    image_url: "",
  });

  // Fetch menus
  useEffect(() => {
    const fetchMenus = async () => {
      if (!user?.email) return toast.error("User not found. Please log in again.");
      try {
        const { data: restaurantData } = await axiosSecure.get<Restaurant>(
          `/restaurants/email/${user.email}`
        );
        setRestaurant(restaurantData);

        const { data: menusData } = await axiosSecure.get<MenuItem[]>(
          `/restaurants/${restaurantData._id}/menus`
        );
        setMenus(menusData);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load menu data.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, [axiosSecure, user]);

  // ===== Add Menu Item =====
  const handleAddMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    try {
      setSubmitting(true);
      const { data } = await axiosSecure.post<MenuItem>(
        `/restaurants/${restaurant._id}/menus`,
        newItem
      );

      setMenus((prev) => [...prev, data]);
      toast.success("Menu item added successfully!");
      setNewItem({
        name: "",
        description: "",
        price: 0,
        category: "",
        image_url: "",
      });
      setShowModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add menu item.");
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Delete Menu Item =====
  const handleDelete = async (menuId: string) => {
    if (!restaurant) return;
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      await axiosSecure.delete(
        `/restaurants/${restaurant._id}/menus/${menuId}`
      );
      setMenus((prev) => prev.filter((m) => m._id !== menuId));
      toast.success("Menu item deleted.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete menu item.");
    }
  };

  // ===== Toggle Featured =====
  const toggleFeatured = async (menuId: string, featured: boolean) => {
    if (!restaurant) return;

    try {
      await axiosSecure.patch(
        `/restaurants/${restaurant._id}/menus/${menuId}`,
        { featured: !featured }
      );
      setMenus((prev) =>
        prev.map((m) =>
          m._id === menuId ? { ...m, featured: !featured } : m
        )
      );
      toast.info(!featured ? "Item marked as featured ⭐" : "Item unfeatured");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update featured status.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="w-8 h-8 text-[#EF451C] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Menu Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#EF451C] text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-[#d63a13] transition"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Menu
        </button>
      </div>

      {/* Menu Table */}
      <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">All Menu Items</h2>
        {menus.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No menu items found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Image</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Price</th>
                  <th className="p-3 text-left">Featured</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menus.map((menu) => (
                  <tr
                    key={menu._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3">
                      <img
                        src={menu.image_url || "/placeholder.jpg"}
                        alt={menu.name}
                        className="w-14 h-14 object-cover rounded-lg"
                      />
                    </td>
                    <td className="p-3 font-medium">{menu.name}</td>
                    <td className="p-3 text-gray-600">{menu.category}</td>
                    <td className="p-3 font-semibold text-[#EF451C]">
                      ৳{menu.price.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleFeatured(menu._id, !!menu.featured)}
                        className="text-gray-600 hover:text-[#EF451C]"
                      >
                        {menu.featured ? (
                          <Star className="w-5 h-5 fill-[#EF451C]" />
                        ) : (
                          <StarOff className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toast.info("Edit coming soon")}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(menu._id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Menu Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-lg relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold mb-4">Add Menu Item</h2>
              <form onSubmit={handleAddMenu} className="space-y-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  required
                  className="border p-3 rounded-lg w-full focus:outline-[#EF451C]"
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem({ ...newItem, category: e.target.value })
                  }
                  required
                  className="border p-3 rounded-lg w-full focus:outline-[#EF451C]"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      price: parseFloat(e.target.value),
                    })
                  }
                  required
                  className="border p-3 rounded-lg w-full focus:outline-[#EF451C]"
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  value={newItem.image_url}
                  onChange={(e) =>
                    setNewItem({ ...newItem, image_url: e.target.value })
                  }
                  className="border p-3 rounded-lg w-full focus:outline-[#EF451C]"
                />
                <textarea
                  placeholder="Description"
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  required
                  className="border p-3 rounded-lg w-full focus:outline-[#EF451C]"
                ></textarea>
                <button
                  type="submit"
                  disabled={submitting}
                  
                  className="bg-[#EF451C] text-white py-3 rounded-lg font-medium hover:bg-[#d63a13] transition w-full flex justify-center items-center"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5 mr-2" /> Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" /> Add Menu
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuManagement;
