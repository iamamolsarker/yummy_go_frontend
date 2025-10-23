import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useAuth } from "../../hooks/useAuth";
import {
  Loader2,
  ShoppingBag,
  DollarSign,
  CheckCircle,
  Clock,
} from "lucide-react";

// ===== Types =====
interface Restaurant {
  _id: string;
  name: string;
  email: string;
  status: "pending" | "approved" | "rejected" | "suspended" | "active";
  rating?: number;
  createdAt?: string;
}

interface Order {
  _id: string;
  restaurant_id: string;
  user_email: string;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "on_the_way"
    | "delivered"
    | "cancelled";
  payment_status: "paid" | "unpaid" | "refunded";
  total_amount: number;
  createdAt: string;
}

interface ChartData {
  date: string;
  orders: number;
}

interface Summary {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

const Dashboard: React.FC = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth(); // ✅ from your auth context
  const [loading, setLoading] = useState<boolean>(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [summary, setSummary] = useState<Summary>({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.email) {
        toast.error("User not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        // 1️⃣ Fetch restaurant info by email
        const { data: restaurantData } = await axiosSecure.get<Restaurant>(
          `/api/restaurants/email/${user.email}`
        );
        setRestaurant(restaurantData);

        // 2️⃣ Fetch orders for that restaurant
        const { data: ordersData } = await axiosSecure.get<Order[]>(
          `/api/orders/restaurant/${restaurantData._id}`
        );

        // 3️⃣ Calculate summary
        const totalOrders = ordersData.length;
        const completedOrders = ordersData.filter(
          (o) => o.status === "delivered"
        ).length;
        const activeOrders = ordersData.filter(
          (o) => o.status !== "delivered" && o.status !== "cancelled"
        ).length;
        const totalRevenue = ordersData
          .filter((o) => o.payment_status === "paid")
          .reduce((sum, o) => sum + (o.total_amount || 0), 0);

        setSummary({
          totalOrders,
          completedOrders,
          activeOrders,
          totalRevenue,
        });

        // 4️⃣ Generate chart data (orders per day)
        const dateMap: Record<string, number> = {};
        ordersData.forEach((order) => {
          const date = new Date(order.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          dateMap[date] = (dateMap[date] || 0) + 1;
        });

        const chartArr = Object.keys(dateMap).map((key) => ({
          date: key,
          orders: dateMap[key],
        }));
        setChartData(chartArr);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [axiosSecure, user]);

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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Dashboard Overview
      </h1>

      {/* Restaurant Info */}
      {restaurant && (
        <div className="bg-white p-5 rounded-2xl shadow mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {restaurant.name}
          </h2>
          <p className="text-gray-500 text-sm">
            Status:{" "}
            <span
              className={`font-medium ${
                restaurant.status === "approved"
                  ? "text-green-600"
                  : restaurant.status === "pending"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {restaurant.status}
            </span>
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <SummaryCard
          title="Total Orders"
          value={summary.totalOrders}
          icon={<ShoppingBag className="w-8 h-8 text-[#EF451C]" />}
        />
        <SummaryCard
          title="Active Orders"
          value={summary.activeOrders}
          icon={<Clock className="w-8 h-8 text-[#EF451C]" />}
        />
        <SummaryCard
          title="Completed"
          value={summary.completedOrders}
          icon={<CheckCircle className="w-8 h-8 text-[#EF451C]" />}
        />
        <SummaryCard
          title="Total Revenue"
          value={`৳${summary.totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="w-8 h-8 text-[#EF451C]" />}
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Orders Activity
        </h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fill: "#6b7280" }} />
              <YAxis tick={{ fill: "#6b7280" }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#EF451C" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center">
            No order data available yet.
          </p>
        )}
      </div>
    </div>
  );
};

// ====== Subcomponent: SummaryCard ======
interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon }) => (
  <div className="bg-white p-5 rounded-2xl shadow border border-gray-200 flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
    {icon}
  </div>
);

export default Dashboard;
