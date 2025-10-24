import { useState, useEffect, type JSX } from "react";
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";

type OrderType = {
  _id: string;
  total_amount: number;
  payment_status: string;
  status?: string;
  placed_at: string;
};

const COLORS = ["#4CAF50", "#F44336", "#FFC107"]; // Delivered, Canceled, Pending
const STATUS_COLOR = {
  paid: [198, 239, 206],      // green background
  pending: [255, 235, 156],   // yellow background
  canceled: [255, 199, 206]   // red background
};

export default function RevenuePage(): JSX.Element {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [chartData, setChartData] = useState<{ month: string; revenue: number }[]>([]);
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchRestaurantId = async () => {
      try {
        setIsLoading(true);
        if (!user) throw new Error("User not logged in");

        const email = user.email;
        if (!email) throw new Error("User email not found");

        const res = await axiosSecure.get(`/restaurants/email/${email}`);
        const restaurant = res.data?.data || res.data;
        if (!mounted) return;

        setRestaurantId(restaurant?._id || null);
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

  useEffect(() => {
    if (!restaurantId) return;
    let mounted = true;
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const res = await axiosSecure.get(`/orders/restaurant/${restaurantId}`);
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setOrders(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load orders.");
      } finally {
        setTimeout(() => setIsLoading(false), 300);
      }
    };
    fetchOrders();
    return () => { mounted = false; };
  }, [axiosSecure, restaurantId]);

  // Monthly revenue line chart
  useEffect(() => {
    const grouped: Record<string, number> = {};
    const paidOrders = orders.filter((o) => o.payment_status === "paid");

    paidOrders.forEach((o) => {
      const date = new Date(o.placed_at);
      const month = date.toLocaleString("en-US", { month: "short" });
      grouped[month] = (grouped[month] || 0) + o.total_amount;
    });

    const formatted = Object.entries(grouped).map(([month, revenue]) => ({
      month,
      revenue,
    }));
    setChartData(formatted);
  }, [orders]);

  // Pie chart data for order statuses
  useEffect(() => {
    const delivered = orders.filter(o => o.status === "delivered").length;
    const canceled = orders.filter(o => o.status === "canceled").length;
    const pending = orders.filter(o => o.status === "pending").length;

    setPieData([
      { name: "Delivered", value: delivered },
      { name: "Canceled", value: canceled },
      { name: "Pending", value: pending },
    ]);
  }, [orders]);

  // Paid orders only for table and total revenue
  const paidOrders = orders.filter(o => o.payment_status === "paid");

  const totalRevenue = paidOrders.reduce((acc, o) => acc + o.total_amount, 0);

  // Download PDF
  const handleDownloadReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Yummy Go Revenue Report", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Restaurant: ${user?.email || "Unknown"}`, 105, 28, { align: "center" });
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 36, { align: "center" });
    
    // Bottom border under heading
    doc.setLineWidth(0.5);
    doc.line(14, 42, 196, 42);

    // Table header
    let y = 50;
    const startX = 14;
    const colWidths = [60, 40, 40, 50]; // OrderID, Amount, Status, Placed At

    doc.setFillColor(240, 240, 240);
    doc.rect(startX, y, colWidths.reduce((a, b) => a + b), 8, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Order ID", startX + 2, y + 6);
    doc.text("Amount", startX + colWidths[0] + 2, y + 6);
    doc.text("Payment Status", startX + colWidths[0] + colWidths[1] + 2, y + 6);
    doc.text("Placed At", startX + colWidths[0] + colWidths[1] + colWidths[2] + 2, y + 6);

    y += 8;
    doc.setFont("helvetica", "normal");

    orders.forEach((o, index) => {
      if (y > 280) { doc.addPage(); y = 20; }
      
      // Alternate row background
      if (index % 2 === 0) doc.setFillColor(245, 245, 245);
      else doc.setFillColor(255, 255, 255);
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), 8, "F");

      doc.text(o._id, startX + 2, y + 6);
      doc.text(`BDT ${o.total_amount.toFixed(2)}`, startX + colWidths[0] + 2, y + 6);
      
      // Color-coded Payment Status
            const status = o.payment_status.toLowerCase();
            const color = STATUS_COLOR[status as keyof typeof STATUS_COLOR] || [200,200,200];
            const [r, g, b] = color as [number, number, number];
            doc.setFillColor(r, g, b);
            doc.rect(startX + colWidths[0] + colWidths[1], y, colWidths[2], 8, "F");
            doc.setTextColor(0,0,0);
            doc.text(o.payment_status.charAt(0).toUpperCase() + o.payment_status.slice(1), startX + colWidths[0] + colWidths[1] + 2, y + 6);

      doc.setTextColor(0,0,0);
      doc.text(new Date(o.placed_at).toLocaleDateString(), startX + colWidths[0] + colWidths[1] + colWidths[2] + 2, y + 6);

      y += 8;
    });

    // Total revenue row
    doc.setFont("helvetica", "bold");
    doc.setFillColor(220, 220, 220);
    doc.rect(startX, y, colWidths.reduce((a, b) => a + b), 8, "F");
    doc.text("Total Revenue", startX + 2, y + 6);
    doc.text(`BDT ${totalRevenue.toFixed(2)}`, startX + colWidths[0] + 2, y + 6);

    doc.save("revenue-report.pdf");
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Revenue Overview</h1>

        {isLoading && <div className="text-center py-12 text-gray-500">Loading revenue...</div>}
        {error && <div className="text-center py-12 text-red-500">{error}</div>}

        {!isLoading && !error && (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Monthly Revenue (BDT)</h2>
                <button
                  onClick={handleDownloadReport}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#EF451C] text-white rounded hover:bg-[#d63c0f]"
                >
                  <Download size={16} /> Download Report
                </button>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 h-80">
                  {chartData.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">No paid orders yet.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `BDT ${value.toFixed(2)}`} />
                        <Line type="monotone" dataKey="revenue" stroke="#EF451C" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="w-64 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {pieData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Paid Orders Table with badges */}
              <div className="mt-6 overflow-x-auto">
                <div className="shadow-lg rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Amount (BDT)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Payment Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Placed At</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paidOrders.map((o, idx) => (
                        <tr key={o._id} className={idx % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{o._id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{o.total_amount.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              Paid
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(o.placed_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-200 font-semibold">
                        <td className="px-6 py-4 whitespace-nowrap">Total</td>
                        <td className="px-6 py-4 whitespace-nowrap">{totalRevenue.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap"></td>
                        <td className="px-6 py-4 whitespace-nowrap"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
