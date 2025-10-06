import React from "react";
import {
  ShoppingCart,
  DollarSign,
  UtensilsCrossed,
  Clock,
  RefreshCw,
  Bike,
  Building2,
  Star,
  Bell,
  ChartLine,
  Percent,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";

// ---- Helper: Stat Card ----
const StatCard = ({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="bg-white p-6 rounded-custom shadow-sm border border-gray-200 flex items-center space-x-4 transition"
  >
    <div className={`p-3 rounded-full ${color}`}>{icon}</div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const user = { name: "Yousuf" };

  // Dummy data
  const orders = [
    {
      id: "#89574",
      restaurant: "Kacchi Bhai",
      items: 3,
      price: "৳750",
      status: "Delivered",
      time: "2 days ago",
      rider: "Rahim",
      route: "Dhanmondi → Mohammadpur",
      image: "https://i.ibb.co/L5gqYjC/kacchi-bhai.jpg",
    },
    {
      id: "#89573",
      restaurant: "Pizza Hut",
      items: 2,
      price: "৳1250",
      status: "Processing",
      time: "1 hour ago",
      rider: "Shakib",
      route: "Banani → Gulshan 1",
      image: "https://i.ibb.co/qnb0TMp/pizza-hut.jpg",
    },
  ];

  const offers = [
    { title: "Flat 50% Off", restaurant: "Sultan's Dine", code: "SULTAN50" },
    { title: "Buy 1 Get 1 Free", restaurant: "Domino's Pizza", code: "BOGOPIZZA" },
    { title: "Free Delivery", restaurant: "Takeout", code: "FREEDEL" },
  ];

  const restaurants = [
    { name: "Kacchi Bhai", rating: 4.8, orders: 230 },
    { name: "Pizza Hut", rating: 4.6, orders: 180 },
    { name: "Burger King", rating: 4.5, orders: 150 },
  ];

  const riders = [
    { name: "Rahim", activeOrders: 3, rating: 4.7 },
    { name: "Shakib", activeOrders: 2, rating: 4.9 },
  ];

  const statusColors: Record<string, string> = {
    Delivered: "bg-green-100 text-green-700",
    Processing: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans transition">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-gray-500 mt-1">
              Here’s your full delivery control center.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full hover:bg-gray-200 relative transition">
              <Bell size={20} className="text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<ShoppingCart size={24} className="text-orange-600" />}
            title="Total Orders"
            value="142"
            color="bg-orange-100"
          />
          <StatCard
            icon={<DollarSign size={24} className="text-green-600" />}
            title="Total Earnings"
            value="৳48,560"
            color="bg-green-100"
          />
          <StatCard
            icon={<UtensilsCrossed size={24} className="text-blue-600" />}
            title="Top Cuisine"
            value="Biryani"
            color="bg-blue-100"
          />
          <StatCard
            icon={<Star size={24} className="text-yellow-500" />}
            title="Avg Rating"
            value="4.8 ★"
            color="bg-yellow-100"
          />
        </section>

        {/* Main Layout */}
        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Recent Orders */}
          <section className="lg:col-span-3 bg-white p-6 rounded-custom shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition"
              >
                <img
                  src={order.image}
                  alt={order.restaurant}
                  className="w-16 h-16 rounded-md object-cover"
                />
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800">{order.restaurant}</p>
                  <p className="text-sm text-gray-500">
                    {order.items} items · {order.price}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center mt-1">
                    <Clock size={12} className="mr-1" />
                    {order.time}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <Bike size={12} className="mr-1" />
                    Rider: {order.rider} · Route: {order.route}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}
                  >
                    {order.status}
                  </span>
                  <button className="flex items-center text-sm font-semibold text-blue-600 hover:underline">
                    <RefreshCw size={14} className="mr-1" /> Reorder
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* Offers */}
          <section className="lg:col-span-2 bg-white p-6 rounded-custom shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Offers & Coupons</h2>
            {offers.map((offer) => (
              <div
                key={offer.code}
                className="border border-dashed border-gray-300 p-4 rounded-lg flex justify-between items-center mb-3"
              >
                <div>
                  <p className="font-semibold text-blue-600">{offer.title}</p>
                  <p className="text-sm text-gray-500">on {offer.restaurant}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Code:</p>
                  <p className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                    {offer.code}
                  </p>
                </div>
              </div>
            ))}
          </section>
        </main>

        {/* Riders & Restaurants */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Riders */}
          <div className="bg-white p-6 rounded-custom border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Rider Performance</h2>
            {riders.map((r) => (
              <div
                key={r.name}
                className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Bike size={18} className="text-blue-600" />
                  <p className="font-semibold text-gray-700">{r.name}</p>
                </div>
                <p className="text-sm text-gray-500">
                  {r.activeOrders} orders · ⭐ {r.rating}
                </p>
              </div>
            ))}
          </div>

          {/* Restaurants */}
          <div className="bg-white p-6 rounded-custom border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Top Restaurants</h2>
            {restaurants.map((res) => (
              <div
                key={res.name}
                className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Building2 size={18} className="text-blue-600" />
                  <p className="font-semibold text-gray-700">{res.name}</p>
                </div>
                <p className="text-sm text-gray-500">
                  ⭐ {res.rating} · {res.orders} orders
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Charts & Insights */}
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-custom border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
              <ChartLine size={20} className="mr-2 text-blue-600" />
              Sales Overview
            </h2>
            <p className="text-sm text-gray-500">Placeholder for chart visualization</p>
          </div>
          <div className="bg-white p-6 rounded-custom border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
              <Percent size={20} className="mr-2 text-blue-600" />
              Coupon Usage
            </h2>
            <p className="text-sm text-gray-500">Analytics visualization placeholder</p>
          </div>
          <div className="bg-white p-6 rounded-custom border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
              <MapPin size={20} className="mr-2 text-blue-600" />
              Live Delivery Map
            </h2>
            <p className="text-sm text-gray-500">Map/route tracking placeholder</p>
          </div>
        </section>

        {/* AI + Feedback */}
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-custom border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🍱 AI Recommendations</h2>
            <ul className="space-y-3">
              <li className="p-3 bg-gray-50 rounded-lg">
                You might like: <b>Chicken Tikka Combo</b> from Sultan’s Dine 🍗
              </li>
              <li className="p-3 bg-gray-50 rounded-lg">
                Try new: <b>Beef Shawarma</b> from Takeout 🥙
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-custom border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">💬 Customer Feedback</h2>
            <div className="space-y-3">
              <p className="p-3 bg-gray-50 rounded-lg">
                ⭐⭐⭐⭐ “Fast delivery & fresh food!” – Arif
              </p>
              <p className="p-3 bg-gray-50 rounded-lg">
                ⭐⭐⭐⭐⭐ “Pizza was awesome, will reorder!” – Sumi
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
