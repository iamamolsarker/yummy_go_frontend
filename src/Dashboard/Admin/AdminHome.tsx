/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { DollarSign, ShoppingCart, Users, Utensils, Clock, AlertCircle, CheckCircle, UtensilsCrossed } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';


// --- Reusable UI Components ---

const StatCard = ({ title, value, link, icon, format = 'number' }: { title: string, value: string | number, link: string, icon: React.ReactNode, format?: 'number' | 'currency' }) => {
  const formattedValue = format === 'currency' ? `৳${Number(value).toLocaleString('en-IN')}` : Number(value).toLocaleString('en-IN');
  return (
    <Link to={link} className="bg-white p-6 rounded-lg shadow-md border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{formattedValue}</p>
        </div>
        <div className="bg-orange-100 text-[#EF451C] p-3 rounded-full">
          {icon}
        </div>
      </div>
    </Link>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

// --- Main Admin Home Component ---
const DashboardHome = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- API Queries ---
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => (await axiosSecure.get('/orders/stats')).data.data
  });

  const { data: recentOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: async () => (await axiosSecure.get('/orders?limit=5')).data.data
  });

  const { data: pendingUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['pendingUsers'],
    queryFn: async () => (await axiosSecure.get('/users/status/pending')).data.data
  });

  const { data: pendingRestaurants, isLoading: isLoadingRestaurants } = useQuery({
    queryKey: ['pendingRestaurants'],
    queryFn: async () => (await axiosSecure.get('/restaurants/status/pending')).data.data
  });

  const { data: allUsers } = useQuery({ queryKey: ['allUsersCount'], queryFn: async () => (await axiosSecure.get('/users')).data.data });
  const { data: allRestaurants } = useQuery({ queryKey: ['allRestaurantsCount'], queryFn: async () => (await axiosSecure.get('/restaurants')).data.data });


  const isLoading = isLoadingStats || isLoadingOrders || isLoadingUsers || isLoadingRestaurants;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[calc(100vh-100px)]">
        <div className="text-center">
          <UtensilsCrossed className="animate-spin text-[#EF451C] mx-auto" size={48} />
          <p className="mt-4 text-lg font-semibold text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.displayName || 'Admin'}!</h1>
          <p className="text-gray-500 mt-1">Here's a snapshot of your platform's activity.</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border mt-4 sm:mt-0 flex items-center space-x-3">
          <Clock size={20} className="text-[#EF451C]" />
          <div>
            <p className="text-sm font-semibold text-gray-700">{format(currentTime, 'eeee, dd MMMM yyyy')}</p>
            <p className="text-xs text-gray-500">{format(currentTime, 'hh:mm:ss a')}</p>
          </div>
        </div>
      </div>

      {/* --- Stat Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Revenue" value={statsData?.totalRevenue || 0} link="/dashboard/admin/orders" icon={<DollarSign />} format="currency" />
        <StatCard title="Total Orders" value={statsData?.totalOrders || 0} link="/dashboard/admin/orders" icon={<ShoppingCart />} />
        <StatCard title="Total Users" value={allUsers?.length || 0} link="/dashboard/admin/users" icon={<Users />} />
        <StatCard title="Total Restaurants" value={allRestaurants?.length || 0} link="/dashboard/admin/restaurants" icon={<Utensils />} />
      </div>

      {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="th">Order ID</th>
                  <th className="th">Customer</th>
                  <th className="th">Amount</th>
                  <th className="th">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders?.length > 0 ? recentOrders.map((order: any) => (
                  <tr key={order._id} className="tr">
                    <td className="td font-mono text-xs">{order.order_number || order._id.slice(-6)}</td>
                    <td className="td">{order.user_email}</td>
                    <td className="td">৳{Number(order.total_amount).toLocaleString('en-IN')}</td>
                    <td className="td"><StatusBadge status={order.status} /></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-500">No recent orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Pending Approvals</h3>
          <div className="space-y-4 flex-grow">
            <Link to="/dashboard/admin/users" className="block p-4 rounded-lg bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="text-yellow-600 mr-3" />
                  <span className="font-semibold text-yellow-800">New Users</span>
                </div>
                <span className="text-2xl font-bold text-yellow-800">{pendingUsers?.length || 0}</span>
              </div>
            </Link>
            <Link to="/dashboard/admin/restaurants" className="block p-4 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="text-green-600 mr-3" />
                  <span className="font-semibold text-green-800">New Restaurants</span>
                </div>
                <span className="text-2xl font-bold text-green-800">{pendingRestaurants?.length || 0}</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
