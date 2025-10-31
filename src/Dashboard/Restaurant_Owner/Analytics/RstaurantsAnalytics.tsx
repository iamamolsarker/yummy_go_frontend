import { useState, useEffect, type JSX } from "react";
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
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

const STATUS_COLORS = ["#4CAF50", "#F44336", "#FFC107"]; // Delivered, Canceled, Pending
const STATUS_COLOR_RGB: Record<string, number[]> = {
  delivered: [76, 175, 80],
  canceled: [244, 67, 54],
  pending: [255, 193, 7],
};

export default function AnalyticsPage(): JSX.Element {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const [orders, setOrders] = useState<OrderType[]>([]);
  const [chartData, setChartData] = useState<{ month: string; revenue: number; orders: number }[]>([]);
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        if (!user) throw new Error("User not logged in");
        const email = user.email;
        const res = await axiosSecure.get(`/restaurants/email/${email}`);
        const restaurant = res.data?.data || res.data;
        if (!restaurant?._id) throw new Error("Restaurant not found");

        const ordersRes = await axiosSecure.get(`/orders/restaurant/${restaurant._id}`);
        if (!mounted) return;
        const data = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.data || [];
        setOrders(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load analytics data.");
      } finally {
        setTimeout(() => setIsLoading(false), 300);
      }
    };
    fetchOrders();
    return () => { mounted = false; };
  }, [axiosSecure, user]);

  // Compute charts & metrics
  const paidOrders = orders.filter(o => o.payment_status === "paid");
  const totalRevenue = paidOrders.reduce((acc, o) => acc + o.total_amount, 0);
  const avgOrderValue = paidOrders.length ? totalRevenue / paidOrders.length : 0;

  useEffect(() => {
    const grouped: Record<string, { revenue: number; orders: number }> = {};
    orders.forEach(o => {
      const date = new Date(o.placed_at);
      const month = date.toLocaleString("en-US", { month: "short" });
      if (!grouped[month]) grouped[month] = { revenue: 0, orders: 0 };
      if (o.payment_status === "paid") grouped[month].revenue += o.total_amount;
      grouped[month].orders += 1;
    });

    const formatted = Object.entries(grouped).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      orders: data.orders,
    }));
    setChartData(formatted);

    const delivered = orders.filter(o => o.status === "delivered").length;
    const canceled = orders.filter(o => o.status === "canceled").length;
    const pending = orders.filter(o => o.status === "pending").length;
    setPieData([
      { name: "Delivered", value: delivered },
      { name: "Canceled", value: canceled },
      { name: "Pending", value: pending },
    ]);
  }, [orders]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Yummy Go Analytics Report", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Restaurant: ${user?.email || "Unknown"}`, 105, 28, { align: "center" });
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 36, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(14, 42, 196, 42);

    let y = 50;
    const startX = 14;
    const colWidths = [50, 40, 40, 40];

    // KPIs Section
    doc.setFont("helvetica", "bold");
    doc.text("Key Metrics", startX, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    const kpis = [
      `Total Orders: ${orders.length}`,
      `Paid Orders: ${paidOrders.length}`,
      `Total Revenue: BDT ${totalRevenue.toFixed(2)}`,
      `Avg Order Value: BDT ${avgOrderValue.toFixed(2)}`
    ];
    kpis.forEach((kpi, idx) => {
      doc.text(kpi, startX, y + idx * 6);
    });
    y += kpis.length * 6 + 6;

    // Monthly Revenue Table
    doc.setFont("helvetica", "bold");
    doc.text("Monthly Revenue", startX, y);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFillColor(240, 240, 240);
    doc.rect(startX, y, colWidths.reduce((a,b)=>a+b), 8, "F");
    doc.text("Month", startX + 2, y + 6);
    doc.text("Revenue (BDT)", startX + colWidths[0] + 2, y + 6);
    doc.text("Orders", startX + colWidths[0] + colWidths[1] + 2, y + 6);
    y += 8;

    doc.setFont("helvetica", "normal");
    chartData.forEach((d, idx) => {
      if (y > 280) { doc.addPage(); y = 20; }
      if (idx %2 ===0) doc.setFillColor(245,245,245);
      else doc.setFillColor(255,255,255);
      doc.rect(startX, y, colWidths.reduce((a,b)=>a+b),8,"F");
      doc.text(d.month, startX+2, y+6);
      doc.text(d.revenue.toFixed(2), startX+colWidths[0]+2, y+6);
      doc.text(d.orders.toString(), startX+colWidths[0]+colWidths[1]+2, y+6);
      y+=8;
    });

    y += 6;
    doc.setFont("helvetica","bold");
    doc.text("Order Status Summary", startX, y);
    y+=6;
    pieData.forEach((d)=>{
      const color = STATUS_COLOR_RGB[d.name.toLowerCase()] || [200,200,200];
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(startX,y,10,6,"F");
      doc.text(`${d.name}: ${d.value}`, startX+12, y+5);
      y+=8;
    });

    doc.save("analytics-report.pdf");
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#EF451C] text-white rounded hover:bg-[#d63c0f]"
          >
            <Download size={16} /> Download Report
          </button>
        </div>

        {isLoading && <div className="text-center py-12 text-gray-500">Loading analytics...</div>}
        {error && <div className="text-center py-12 text-red-500">{error}</div>}

        {!isLoading && !error && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                <p className="mt-1 text-2xl font-semibold text-gray-800">{orders.length}</p>
              </div>
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Paid Orders</h3>
                <p className="mt-1 text-2xl font-semibold text-gray-800">{paidOrders.length}</p>
              </div>
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Revenue (BDT)</h3>
                <p className="mt-1 text-2xl font-semibold text-gray-800">{totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Avg Order Value</h3>
                <p className="mt-1 text-2xl font-semibold text-gray-800">{avgOrderValue.toFixed(2)}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-4 h-80">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Monthly Revenue</h3>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={chartData}>
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value:number)=>`BDT ${value.toFixed(2)}`} />
                    <Line type="monotone" dataKey="revenue" stroke="#EF451C" strokeWidth={3}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-4 h-80">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Orders Status Distribution</h3>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {pieData.map((_entry,index)=>(
                        <Cell key={index} fill={STATUS_COLORS[index%STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 h-80 mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Orders Per Month</h3>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="month"/>
                  <YAxis/>
                  <Tooltip/>
                  <Bar dataKey="orders" fill="#4F46E5"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
