/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  ServerCrash,
  Activity,
  DollarSign,
  PackageCheck,
  Star,
  TrendingUp,
  Filter,
} from "lucide-react";

// Make sure to import hooks from your project's correct path
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";

// --- Type Definitions ---
type Delivery = {
  [x: string]: any;
  _id: string;
  status: 'delivered' | 'cancelled';
  delivery_fee: number;
  rating?: number; // Assuming rating is part of the delivery object
  service_type?: 'Food' | 'Parcel'; // Assuming a service type field exists
};

// --- Helper Components ---
const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; subtitle?: string }> = ({ icon, title, value, subtitle }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="text-slate-400">{icon}</div>
    </div>
    <p className="text-3xl font-bold text-slate-800">{value}</p>
    {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
  </div>
);

const COLORS = ["#16a34a", "#dc2626", "#f97316", "#3b82f6", "#facc15"];

// --- Main Component ---
const RiderPerformance: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [allDeliveries, setAllDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d'>('all');

  // --- Data Fetching Effect ---
  useEffect(() => {
    if (authLoading || !user) {
      setIsLoading(authLoading);
      return;
    }
    const fetchPerformanceData = async () => {
      try {
        setIsLoading(true);
        const userRes = await axiosSecure.get(`/users/${user.email}`);
        const riderId = userRes.data?.data?._id;

        if (!riderId) throw new Error("Could not find rider profile.");
        
        const deliveriesRes = await axiosSecure.get(`/deliveries/rider/${riderId}`);
        // Adding mock data for rating and service_type for demonstration
        const mockData = (deliveriesRes.data?.data || []).map((d: any) => ({
            ...d,
            rating: d.status === 'delivered' ? Math.floor(Math.random() * 3) + 3 : undefined, // Random rating 3-5
            service_type: Math.random() > 0.3 ? 'Food' : 'Parcel'
        }));
        setAllDeliveries(mockData);

      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load performance data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPerformanceData();
  }, [user, authLoading, axiosSecure]);

  // --- Memoized Data Processing ---
  const filteredDeliveries = useMemo(() => {
    if (dateFilter === 'all') return allDeliveries;
    const days = dateFilter === '7d' ? 7 : 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return allDeliveries.filter(d => new Date(d.delivered_at || d.cancelled_at) >= cutoffDate);
  }, [allDeliveries, dateFilter]);

  const performanceStats = useMemo(() => {
    const total = filteredDeliveries.length;
    const delivered = filteredDeliveries.filter(d => d.status === 'delivered');
    const cancelled = total - delivered.length;
    const totalEarnings = delivered.reduce((sum, d) => sum + (d.delivery_fee || 0), 0);
    const ratedDeliveries = delivered.filter(d => d.rating && d.rating > 0);
    const averageRating = ratedDeliveries.length > 0
      ? ratedDeliveries.reduce((sum, d) => sum + d.rating!, 0) / ratedDeliveries.length
      : 0;

    return {
      totalDeliveries: total,
      completionRate: total > 0 ? ((delivered.length / total) * 100).toFixed(1) + '%' : 'N/A',
      totalEarnings: `$${totalEarnings.toFixed(2)}`,
      averageRating: averageRating.toFixed(2),
      statusData: [
        { name: 'Delivered', value: delivered.length },
        { name: 'Cancelled', value: cancelled },
      ],
      ratingData: [
        { name: '5 Stars', value: ratedDeliveries.filter(d => d.rating === 5).length },
        { name: '4 Stars', value: ratedDeliveries.filter(d => d.rating === 4).length },
        { name: '3 Stars', value: ratedDeliveries.filter(d => d.rating === 3).length },
      ].filter(d => d.value > 0),
      serviceData: [
        { name: 'Food Delivery', value: delivered.filter(d => d.service_type === 'Food').length },
        { name: 'Parcel Delivery', value: delivered.filter(d => d.service_type === 'Parcel').length },
      ].filter(d => d.value > 0),
    };
  }, [filteredDeliveries]);

  // --- Conditional Rendering ---
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-slate-500">
        <Activity className="animate-pulse text-[#EF451C]" size={48} />
        <p className="mt-4 text-lg font-semibold">Analyzing Performance Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-center p-4">
        <ServerCrash className="text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold mb-2">Error Analyzing Data</h2>
        <p className="text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header and Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Performance</h1>
            <p className="text-slate-500">An overview of your delivery activities.</p>
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-0 p-1 rounded-lg bg-white border">
            <Filter size={16} className="text-slate-500 ml-2"/>
            <select onChange={(e) => setDateFilter(e.target.value as any)} value={dateFilter} className="bg-transparent text-sm font-semibold focus:outline-none">
                <option value="all">All Time</option>
                <option value="30d">Last 30 Days</option>
                <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={<PackageCheck size={20} />} title="Total Deliveries" value={performanceStats.totalDeliveries.toString()} />
            <StatCard icon={<TrendingUp size={20} />} title="Completion Rate" value={performanceStats.completionRate} />
            <StatCard icon={<DollarSign size={20} />} title="Total Earnings" value={performanceStats.totalEarnings} subtitle="From completed deliveries" />
            <StatCard icon={<Star size={20} />} title="Average Rating" value={performanceStats.averageRating} subtitle="Out of 5 Stars" />
        </div>
        
        {/* Pie Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Delivery Status */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">Delivery Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={performanceStats.statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {performanceStats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2: Customer Ratings */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-800 mb-4">Customer Ratings</h3>
             <ResponsiveContainer width="100%" height={250}>
                {performanceStats.ratingData.length > 0 ? (
                    <PieChart>
                        <Pie data={performanceStats.ratingData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                           {performanceStats.ratingData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                           ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                ) : <div className="flex items-center justify-center h-full text-slate-500">No rating data available.</div>}
             </ResponsiveContainer>
          </div>

           {/* Chart 3: Deliveries by Service Type */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-800 mb-4">Deliveries by Service</h3>
             <ResponsiveContainer width="100%" height={250}>
                {performanceStats.serviceData.length > 0 ? (
                    <PieChart>
                        <Pie data={performanceStats.serviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                           {performanceStats.serviceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                           ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                ) : <div className="flex items-center justify-center h-full text-slate-500">No service data available.</div>}
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderPerformance;