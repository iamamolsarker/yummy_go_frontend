/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  PackageCheck,
  ListOrdered,
  History,
  Wallet,
  Map as MapIcon, // Renamed to avoid conflict
  BarChart,
  ChevronRight,
  Loader2,
  ServerCrash,
  Bell,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";

// --- Type Definitions ---
type Delivery = {
  _id: string; // Delivery ID
  status: 'assigned' | 'picked_up' | 'delivered' | 'cancelled' | string;
  delivery_fee?: number | string;
  delivered_at?: string; // ISO String
};

type StatCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string; // Keep the original color prop structure
};

type MenuCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string; // Relative path
};

// --- Helper Components ---
// Reverted StatCard Styling
const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => (
  // Use p-6 padding like the older version
  <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 ${color}`}>
    {/* Use fixed icon size container */}
    <div className="bg-opacity-10 p-3 rounded-full">{icon}</div>
    <div>
      {/* Reverted text sizes */}
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

// Reverted MenuCard Styling
const MenuCard: React.FC<MenuCardProps> = ({ icon, title, description, path }) => {
  const navigate = useNavigate();
  return (
    // Reverted padding and hover effects
    <div onClick={() => navigate(path)} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-[#EF451C] transition-all duration-300 cursor-pointer group">
      {/* Reverted icon size */}
      <div className="text-[#EF451C] mb-3">{React.cloneElement(icon as React.ReactElement, { size: 28 } as any)}</div>
      {/* Reverted text sizes */}
      <h3 className="font-bold text-slate-800 text-lg mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-4">{description}</p>
      {/* Reverted hover text */}
      <div className="flex items-center text-sm font-semibold text-[#EF451C] opacity-0 group-hover:opacity-100 transition-opacity">
        Go to Page <ChevronRight size={16} className="ml-1" />
      </div>
    </div>
  );
};

// --- Main Component ---
const RiderHome: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ todaysEarnings: 0, todaysDeliveries: 0 });
  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching (Logic remains the same) ---
  useEffect(() => {
    if (authLoading || !user?.email) {
      setIsLoading(authLoading);
      if (!authLoading && !user?.email) {
        setError("Please log in to view dashboard.");
        setIsLoading(false);
      }
      return;
    }

    const fetchDashboardData = async () => {
      const riderEmail = user.email;
      setIsLoading(true);
      setError(null);

      try {
        const riderResponse = await axiosSecure.get(`/riders/email/${riderEmail}`);
        const riderId = riderResponse.data?._id || riderResponse.data?.data?._id;

        if (!riderId) {
          throw new Error("Could not find rider profile. Ensure application is approved.");
        }

        const deliveriesRes = await axiosSecure.get(`/deliveries/rider/${riderId}`);
        const deliveries: Delivery[] = (Array.isArray(deliveriesRes.data) ? deliveriesRes.data : deliveriesRes.data?.data || []).map((d: any) => ({
          ...d,
          delivery_fee: parseFloat(d.delivery_fee) || 0
        }));

        const currentActive = deliveries.find(d => !['delivered', 'cancelled'].includes(d.status));
        setActiveDelivery(currentActive || null);

        const today = new Date().toISOString().split('T')[0];
        const todaysCompleted = deliveries.filter(d =>
          d.status === 'delivered' &&
          d.delivered_at &&
          d.delivered_at.startsWith(today)
        );

        const earnings = todaysCompleted.reduce((sum, d) => sum + (Number(d.delivery_fee) || 0), 0);

        setStats({
          todaysEarnings: earnings,
          todaysDeliveries: todaysCompleted.length,
        });

      } catch (err: any) {
        console.error("Dashboard Fetch Error:", err);
        if (err.response?.status === 404 && err.config?.url?.includes('/riders/email/')) {
          setError("Could not find rider profile. Ensure application is approved.");
        } else {
          setError(err?.response?.data?.message || err.message || "Failed to load dashboard data.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [user, authLoading, axiosSecure]);

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-150px)] bg-slate-50 text-slate-500">
        <Loader2 className="animate-spin text-[#EF451C]" size={48} />
        <p className="mt-4 text-lg font-semibold">Loading Your Dashboard...</p>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-150px)] text-center bg-slate-50 p-4">
        <ServerCrash className="text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold mb-2 text-slate-800">Could Not Load Dashboard</h2>
        <p className="text-slate-500">{error}</p>
      </div>
    );
  }

  // --- Main JSX ---
  return (
    // Reverted page padding
    <div className="bg-slate-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Reverted heading size and margin */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Welcome back, {user?.displayName || 'Rider'}!</h1>
          <p className="text-slate-500 mt-1">Here's a quick look at your activity today.</p>
        </div>

        {/* Reverted Active Delivery Notification Styling */}
        {activeDelivery && (
          <div onClick={() => navigate('routes')}
            className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg mb-8 flex items-center justify-between cursor-pointer hover:bg-blue-200 transition">
            <div className="flex items-center">
              <Bell size={24} className="mr-4 flex-shrink-0" />
              <div>
                <p className="font-bold">You have an active delivery!</p>
                <p className="text-sm">Click here to view the live route.</p>
              </div>
            </div>
            <ChevronRight size={20} className="flex-shrink-0" />
          </div>
        )}

        {/* Reverted Stat Cards Grid and Margin */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {/* Reverted StatCard color props */}
          <StatCard icon={<DollarSign size={24} />} title="Today's Earnings" value={`৳${stats.todaysEarnings.toFixed(2)}`} color="text-green-500 bg-green-500" />
          <StatCard icon={<PackageCheck size={24} />} title="Today's Deliveries" value={stats.todaysDeliveries} color="text-blue-500 bg-blue-500" />
        </div>

        {/* Reverted Menu Cards Grid */}
        <div>
          <h2 className="text-xl font-bold text-slate-700 mb-4">Your Dashboard Menu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <MenuCard icon={<ListOrdered />} title="My Deliveries" description="View and manage your current active deliveries." path="orders" />
            <MenuCard icon={<MapIcon />} title="Live Route" description="See the live map and route for your active delivery." path="routes" />
            <MenuCard icon={<History />} title="Delivery History" description="Browse completed and cancelled deliveries." path="history" />
            <MenuCard icon={<Wallet />} title="My Earnings" description="Check detailed earnings summary and history." path="earnings" />
            <MenuCard icon={<BarChart />} title="Performance" description="Analyze your delivery statistics and ratings." path="performance" />
            {/* Add more cards here if needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderHome;