/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  PackageCheck,
  ListOrdered,
  History,
  Wallet,
  Map,
  BarChart,
  ChevronRight,
  Loader2,
  ServerCrash,
  Bell,
} from "lucide-react";

// Make sure to import hooks from your project's correct path
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";

// --- Type Definitions ---
type Delivery = {
  _id: string;
  status: 'delivered' | 'cancelled' | 'picked_up' | 'on_the_way';
  delivery_fee: number;
  delivered_at?: string;
};

type StatCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
};

type MenuCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
};

// --- Helper Components ---
const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 ${color}`}>
    <div className="bg-opacity-10 p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const MenuCard: React.FC<MenuCardProps> = ({ icon, title, description, path }) => {
    const navigate = useNavigate();
    return (
        <div onClick={() => navigate(path)} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-[#EF451C] transition-all duration-300 cursor-pointer group">
            <div className="text-[#EF451C] mb-3">{icon}</div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">{title}</h3>
            <p className="text-sm text-slate-500 mb-4">{description}</p>
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

  useEffect(() => {
    if (authLoading || !user) {
      setIsLoading(authLoading);
      return;
    }
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const userRes = await axiosSecure.get(`/users/${user.email}`);
        const riderId = userRes.data?.data?._id;

        if (!riderId) throw new Error("Could not find rider profile.");

        const deliveriesRes = await axiosSecure.get(`/deliveries/rider/${riderId}`);
        const deliveries: Delivery[] = deliveriesRes.data?.data || [];
        
        // Find active delivery
        const currentActive = deliveries.find(d => !['delivered', 'cancelled'].includes(d.status));
        setActiveDelivery(currentActive || null);

        // Calculate today's stats
        const today = new Date().toISOString().split('T')[0];
        const todaysCompleted = deliveries.filter(d => d.status === 'delivered' && d.delivered_at?.startsWith(today));
        
        const earnings = todaysCompleted.reduce((sum, d) => sum + d.delivery_fee, 0);
        
        setStats({
            todaysEarnings: earnings,
            todaysDeliveries: todaysCompleted.length,
        });

      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [user, authLoading, axiosSecure]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-slate-500">
        <Loader2 className="animate-spin text-[#EF451C]" size={48} />
        <p className="mt-4 text-lg font-semibold">Loading Your Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-center p-4">
        <ServerCrash className="text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold mb-2">Could Not Load Dashboard</h2>
        <p className="text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Welcome back, {user?.displayName}!</h1>
          <p className="text-slate-500">Here's a quick look at your activity today.</p>
        </div>

        {/* Active Delivery Notification */}
        {activeDelivery && (
            <div onClick={() => navigate('/dashboard/rider/routes')} className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg mb-8 flex items-center justify-between cursor-pointer hover:bg-blue-200 transition">
                <div className="flex items-center">
                    <Bell size={24} className="mr-4"/>
                    <div>
                        <p className="font-bold">You have an active delivery!</p>
                        <p className="text-sm">Click here to view the live route on the map.</p>
                    </div>
                </div>
                <ChevronRight size={20}/>
            </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            <StatCard icon={<DollarSign size={24}/>} title="Today's Earnings" value={`$${stats.todaysEarnings.toFixed(2)}`} color="text-green-500 bg-green-500"/>
            <StatCard icon={<PackageCheck size={24}/>} title="Today's Deliveries" value={stats.todaysDeliveries.toString()} color="text-blue-500 bg-blue-500"/>
        </div>

        {/* Dashboard Menu */}
        <div>
            <h2 className="text-xl font-bold text-slate-700 mb-4">Your Dashboard Menu</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <MenuCard icon={<ListOrdered size={28}/>} title="My Orders" description="View and manage your current active deliveries." path="rider/orders" />
                <MenuCard icon={<Map size={28}/>} title="Live Route" description="See the live map and route for your active order." path="rider/routes" />
                <MenuCard icon={<History size={28}/>} title="Delivery History" description="Browse your completed and cancelled deliveries." path="rider/history" />
                <MenuCard icon={<Wallet size={28}/>} title="My Earnings" description="Check your detailed earnings summary and history." path="rider/earnings" />
                <MenuCard icon={<BarChart size={28}/>} title="Performance" description="Analyze your delivery statistics and ratings." path="rider/performance" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default RiderHome;