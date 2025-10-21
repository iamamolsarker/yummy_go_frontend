import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Users, Utensils, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// --- Mock Data (Replace with real API calls) ---
const mockStats = {
  totalRevenue: 85350.75,
  totalOrders: 1240,
  totalUsers: 480,
  totalRestaurants: 75,
  revenueChange: 12.5, // Percentage change
  ordersChange: -2.1,
};

const mockSalesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 4500 },
  { name: 'May', sales: 6000 },
  { name: 'Jun', sales: 5500 },
  { name: 'Jul', sales: 7000 },
];

const mockTopRestaurants = [
  { name: 'Kacchi Bhai', orders: 450 },
  { name: 'Sultan\'s Dine', orders: 380 },
  { name: 'Star Kabab', orders: 320 },
  { name: 'Pizza Hut', orders: 280 },
  { name: 'Chillox', orders: 250 },
];

const mockOrderStatusData = [
  { name: 'Delivered', value: 980 },
  { name: 'Pending', value: 150 },
  { name: 'Cancelled', value: 110 },
];

const COLORS = ['#4CAF50', '#FFC107', '#F44336'];

// --- Reusable Components ---

const StatCard = ({ title, value, change, icon, format = 'number' }: { title: string, value: number, change?: number, icon: React.ReactNode, format?: 'number' | 'currency' }) => {
  const isPositive = change !== undefined && change >= 0;
  const formattedValue = format === 'currency' ? `৳${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value.toLocaleString('en-IN');
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{formattedValue}</p>
        </div>
        <div className="bg-orange-100 text-[#EF451C] p-3 rounded-full">
          {icon}
        </div>
      </div>
      {change !== undefined && (
        <div className={`mt-4 flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
          <span>{Math.abs(change)}% {isPositive ? 'up' : 'down'} vs last month</span>
        </div>
      )}
    </div>
  );
};

const ChartContainer = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-[400px]">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
    {children}
  </div>
);

// --- Main Analytics Component ---
const Analytics = () => {
    const [loading, setLoading] = useState(true);

    // Simulate data fetching
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[calc(100vh-100px)]">
                <div className="text-center">
                    <Utensils className="animate-spin text-[#EF451C] mx-auto" size={48} />
                    <p className="mt-4 text-lg font-semibold text-gray-600">Loading Analytics...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Analytics Dashboard</h1>

            {/* --- Stat Cards Grid --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Revenue" value={mockStats.totalRevenue} change={mockStats.revenueChange} icon={<DollarSign />} format="currency" />
                <StatCard title="Total Orders" value={mockStats.totalOrders} change={mockStats.ordersChange} icon={<ShoppingCart />} />
                <StatCard title="Total Users" value={mockStats.totalUsers} icon={<Users />} />
                <StatCard title="Total Restaurants" value={mockStats.totalRestaurants} icon={<Utensils />} />
            </div>

            {/* --- Charts Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Sales Chart (Wider) */}
                <div className="lg:col-span-3">
                    <ChartContainer title="Monthly Sales Overview (2025)">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockSalesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
                                <YAxis tickFormatter={(value) => `৳${Number(value) / 1000}k`} tick={{ fill: '#6B7280' }} />
                                <Tooltip formatter={(value: number) => [`৳${value.toLocaleString('en-IN')}`, 'Sales']} />
                                <Legend />
                                <Line type="monotone" dataKey="sales" stroke="#EF451C" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

                {/* Order Status Chart (Narrower) */}
                <div className="lg:col-span-2">
                    <ChartContainer title="Order Status Distribution">
                        <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                <Pie
                                    data={mockOrderStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${( percent * 100).toFixed(0)}%`}
                                >
                                    {mockOrderStatusData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => [`${value.toLocaleString('en-IN')} orders`, '']} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
                
                {/* Top Restaurants Chart (Full Width on New Row) */}
                <div className="lg:col-span-5">
                     <ChartContainer title="Top 5 Performing Restaurants">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockTopRestaurants} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis type="number" tick={{ fill: '#6B7280' }} />
                                <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#6B7280' }}/>
                                <Tooltip formatter={(value: number) => [value.toLocaleString('en-IN'), 'Orders']} />
                                <Legend />
                                <Bar dataKey="orders" fill="#F97316" barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
