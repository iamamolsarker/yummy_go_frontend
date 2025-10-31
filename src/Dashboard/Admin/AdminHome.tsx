/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  DollarSign, ShoppingCart, Users, Utensils, Clock, UtensilsCrossed,
  ArrowRight, UserCheck, Store, User, ShoppingBag, Home, Bike, BarChart2, FileText, AlertCircle, ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';

// --- Reusable UI Components ---

// 1. Stat Card
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

// 2. Pending Info Card
const PendingInfoCard = ({ title, count, link, icon, color = 'yellow' }: { title: string, count: number, link: string, icon: React.ReactNode, color?: string }) => {
  const colors: Record<string, string> = {
    yellow: 'bg-yellow-100 text-yellow-600',
    blue: 'bg-blue-100 text-blue-600'
  }
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className={`${colors[color]} p-3 rounded-full`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">{count}</p>
          <p className="text-sm font-medium text-gray-500">{title}</p>
        </div>
      </div>
      <Link to={link} className="text-sm font-medium text-[#EF451C] hover:underline flex items-center space-x-1">
        <span>View All</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  );
};

// 3. Status Badge
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

// 4. Quick Link Card
const QuickLinkCard = ({ title, icon, link }: { title: string, icon: React.ReactNode, link: string }) => (
  <Link to={link} className="p-4 bg-white border rounded-lg shadow-md hover:shadow-lg text-center transition-all duration-300 hover:border-[#EF451C] flex flex-col items-center justify-center space-y-2 group">
    <div className="text-[#EF451C] transition-transform duration-300 group-hover:scale-110">
      {icon}
    </div>
    <p className="text-sm font-medium text-gray-700">{title}</p>
  </Link>
);

// --- FIX 1: Avatar components made safe for null/undefined names ---

// 5. Avatar Placeholder
const getInitials = (name: string) => {
  if (!name) return '?';
  const names = name.split(' ');
  const firstInitial = names[0]?.[0] || '';
  const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] : '';
  const initials = (firstInitial + lastInitial).toUpperCase();
  return initials || '?'; // Return '?' if initials are still empty
};

const AvatarPlaceholder = ({ name, className }: { name: string | null | undefined, className?: string }) => {
  const safeName = name || ''; // Use a default empty string

  const colors = [
    'bg-blue-100 text-blue-800', 'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800', 'bg-indigo-100 text-indigo-800',
    'bg-pink-100 text-pink-800', 'bg-purple-100 text-purple-800',
  ];
  
  // Use safeName for calculations
  const charCodeSum = safeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorClass = colors[charCodeSum % colors.length];

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${colorClass} ${className} flex-shrink-0`}>
      {getInitials(safeName)}
    </div>
  );
};

// 6. Activity Item (For New Users / Restaurants)
const ActivityItem = ({ name, subtitle, date, link }: {
  name: string | null | undefined; // Made prop optional
  subtitle: string;
  date: string;
  link: string;
}) => {
  const formattedDate = safeFormatDate(date);
  const safeName = name || 'Unnamed'; // Provide a fallback name

  return (
    <div className="flex items-center space-x-3 p-3 transition-all duration-200 hover:bg-gray-100/80 rounded-lg border-b border-gray-100 last:border-b-0">
      <AvatarPlaceholder name={safeName} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{safeName}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 truncate">
            {subtitle}
          </p>
        )}
      </div>
      <div className="text-right flex-shrink-0 hidden sm:block">
        {formattedDate && (
          <p className="text-xs text-gray-400">
            {formattedDate}
          </p>
        )}
      </div>
      <Link to={link} className="p-2 text-gray-400 hover:text-[#EF451C] hover:bg-orange-100 rounded-full transition-colors">
        <ChevronRight size={18} />
      </Link>
    </div>
  );
};


// 7. Pagination Component
const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }: {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-3 border-t border-gray-100 mt-4">
      <button
        onClick={() => onPageChange((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Prev
      </button>
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

// 8. Safe Date Formatter
const safeFormatDate = (dateString: string | Date | undefined | null): string => {
  if (!dateString) {
    return ''; // Return empty string
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return ''; // Return empty string
    }
    return format(date, 'dd MMM yyyy');
  } catch (error) {
    console.error("Date formatting error:", error);
    return ''; // Return empty string
  }
};


// --- Demo Chart Data (Should be replaced with API data) ---
const weeklyOrderData = [
  { day: "Mon", orders: 40 }, { day: "Tue", orders: 65 }, { day: "Wed", orders: 58 },
  { day: "Thu", orders: 80 }, { day: "Fri", orders: 72 }, { day: "Sat", orders: 90 },
  { day: "Sun", orders: 60 },
];
const orderStatusData = [
  { name: "Delivered", value: 60 }, { name: "Pending", value: 20 },
  { name: "Cancelled", value: 10 }, { name: "Confirmed", value: 10 },
];
const PIE_COLORS = ['#22c55e', '#facc15', '#ef4444', '#3b82f6'];


// --- Main Admin Home Component ---
const DashboardHome = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [currentTime, setCurrentTime] = useState(new Date());

  const [orderPage, setOrderPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [restPage, setRestPage] = useState(1);
  const itemsPerPage = 8;

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
    queryFn: async () => (await axiosSecure.get('/orders?sort=createdAt_desc&limit=24')).data.data
  });

  const { data: pendingUsers, isLoading: isLoadingPendingUsers } = useQuery({
    queryKey: ['pendingUsers'],
    queryFn: async () => (await axiosSecure.get('/users/status/pending')).data.data
  });

  const { data: pendingRestaurants, isLoading: isLoadingPendingRest } = useQuery({
    queryKey: ['pendingRestaurants'],
    queryFn: async () => (await axiosSecure.get('/restaurants/status/pending')).data.data
  });

  const { data: recentUsers, isLoading: isLoadingRecentUsers } = useQuery({
    queryKey: ['recentUsers'],
    queryFn: async () => (await axiosSecure.get('/users?sort=createdAt_desc&limit=24')).data.data
  });

  const { data: recentRestaurants, isLoading: isLoadingRecentRest } = useQuery({
    queryKey: ['recentRestaurants'],
    queryFn: async () => (await axiosSecure.get('/restaurants?sort=createdAt_desc&limit=24')).data.data
  });

  const { data: totalUsers } = useQuery({ queryKey: ['totalUsersCount'], queryFn: async () => (await axiosSecure.get('/users')).data.data });
  const { data: totalRestaurants } = useQuery({ queryKey: ['totalRestaurantsCount'], queryFn: async () => (await axiosSecure.get('/restaurants')).data.data });

  const isLoading = isLoadingStats || isLoadingOrders || isLoadingPendingUsers ||
    isLoadingPendingRest || isLoadingRecentUsers || isLoadingRecentRest;

  // Sliced data for pagination
  const paginatedOrders = recentOrders?.slice(
    (orderPage - 1) * itemsPerPage,
    orderPage * itemsPerPage
  );
  const paginatedUsers = recentUsers?.slice(
    (userPage - 1) * itemsPerPage,
    userPage * itemsPerPage
  );
  const paginatedRestaurants = recentRestaurants?.slice(
    (restPage - 1) * itemsPerPage,
    restPage * itemsPerPage
  );


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
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen space-y-8">

      {/* --- 1. Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.displayName || 'Admin'}!</h1>
          <p className="text-gray-500 mt-1">Here's a snapshot of your platform's activity.</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-md border mt-4 sm:mt-0 flex items-center space-x-3 w-full sm:w-auto">
          <Clock size={20} className="text-[#EF451C]" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-700">{format(currentTime, 'eeee, dd MMMM yyyy')}</p>
            <p className="text-xs text-gray-500">{format(currentTime, 'hh:mm:ss a')}</p>
          </div>
        </div>
      </div>

      {/* --- 2. Main Stat Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={statsData?.totalRevenue || 0} link="/dashboard/admin/orders" icon={<DollarSign />} format="currency" />
        <StatCard title="Total Orders" value={statsData?.totalOrders || 0} link="/dashboard/admin/orders" icon={<ShoppingCart />} />
        <StatCard title="Total Users" value={totalUsers?.length || 0} link="/dashboard/admin/users" icon={<Users />} />
        <StatCard title="Total Restaurants" value={totalRestaurants?.length || 0} link="/dashboard/admin/restaurants" icon={<Utensils />} />
      </div>

      {/* --- 3. Pending Approval Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PendingInfoCard
          title="Pending User Approvals"
          count={pendingUsers?.length || 0}
          link="/dashboard/admin/users"
          icon={<UserCheck size={22} />}
          color="yellow"
        />
        <PendingInfoCard
          title="Pending Restaurant Approvals"
          count={pendingRestaurants?.length || 0}
          link="/dashboard/admin/restaurants"
          icon={<Store size={22} />}
          color="blue"
        />
      </div>

      {/* --- 4. Analytics Charts --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Orders This Week</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyOrderData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="orders" stroke="#EF451C" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Order Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                dataKey="value"
                data={orderStatusData}
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                fill="#8884d8"
              >
                {/* --- FIX 2: Replaced 'entry' with '_' --- */}
                {orderStatusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- 5. Recent Orders Table (Date Column Removed) --- */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-700">Recent Orders</h3>
          <Link to="/dashboard/admin/orders" className="text-sm font-medium text-[#EF451C] hover:underline flex items-center space-x-1 mt-2 sm:mt-0">
            <span>View All Orders</span>
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="th text-left py-3 px-4">Order ID</th>
                <th className="th text-left py-3 px-4 hidden md:table-cell">Customer</th>
                <th className="th text-left py-3 px-4">Amount</th>
                <th className="th text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders?.length > 0 ? (
                paginatedOrders.map((order: any) => (
                  <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs text-gray-700">
                      {order.order_number || order._id.slice(-6)}
                    </td>
                    <td className="py-3 px-4 text-gray-700 hidden md:table-cell">
                      {order.user_email}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800">
                      ৳{Number(order.total_amount).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">
                    <AlertCircle className="mx-auto h-6 w-6 text-gray-400" />
                    <p className="mt-2">No recent orders found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* --- Orders Pagination --- */}
        <Pagination
          currentPage={orderPage}
          totalItems={recentOrders?.length || 0}
          itemsPerPage={itemsPerPage}
          onPageChange={setOrderPage}
        />
      </div>

      {/* --- 6. Recent Activity (Updated Design) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Users Card */}
        <div className="bg-white rounded-lg border shadow-md">
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700">New Users</h3>
            <Link to="/dashboard/admin/users" className="text-sm font-medium text-[#EF451C] hover:underline">
              View All
            </Link>
          </div>
          <div className="p-4 space-y-1 min-h-[450px]">
            {paginatedUsers?.length > 0 ? paginatedUsers.map((u: any) => (
              <ActivityItem
                key={u._id}
                name={u.name}
                subtitle={u.email}
                date={u.createdAt}
                link={`/dashboard/admin/users/details/${u._id}`} 
              />
            )) : (
              <div className="flex items-center justify-center h-full min-h-[300px] text-gray-500">
                <p>No new users found.</p>
              </div>
            )}
          </div>
          {/* --- Users Pagination --- */}
          <Pagination
            currentPage={userPage}
            totalItems={recentUsers?.length || 0}
            itemsPerPage={itemsPerPage}
            onPageChange={setUserPage}
          />
        </div>

        {/* New Restaurants Card */}
        <div className="bg-white rounded-lg border shadow-md">
           <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700">New Restaurants</h3>
            <Link to="/dashboard/admin/restaurants" className="text-sm font-medium text-[#EF451C] hover:underline">
              View All
            </Link>
          </div>
          <div className="p-4 space-y-1 min-h-[450px]">
            {paginatedRestaurants?.length > 0 ? paginatedRestaurants.map((r: any) => (
              <ActivityItem
                key={r._id}
                name={r.name}
                subtitle={r.city || ''}
                date={r.createdAt}
                link={`/dashboard/admin/restaurants/details/${r._id}`} 
              />
            )) : (
              <div className="flex items-center justify-center h-full min-h-[300px] text-gray-500">
                <p>No new restaurants found.</p>
              </div>
            )}
          </div>
          {/* --- Restaurants Pagination --- */}
          <Pagination
            currentPage={restPage}
            totalItems={recentRestaurants?.length || 0}
            itemsPerPage={itemsPerPage}
            onPageChange={setRestPage}
          />
        </div>
      </div>

      {/* --- 7. Quick Navigation --- */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Navigation</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <QuickLinkCard title="Manage Users" icon={<User size={24} />} link="/dashboard/admin/users" />
          <QuickLinkCard title="Manage Orders" icon={<ShoppingBag size={24} />} link="/dashboard/admin/orders" />
          <QuickLinkCard title="Restaurants" icon={<Home size={24} />} link="/dashboard/admin/restaurants" />
          <QuickLinkCard title="Manage Riders" icon={<Bike size={24} />} link="/dashboard/admin/riders" />
          <QuickLinkCard title="Analytics" icon={<BarChart2 size={24} />} link="/dashboard/admin/analytics" />
          <QuickLinkCard title="Reports" icon={<FileText size={24} />} link="/dashboard/admin/reports" />
        </div>
      </div>

    </div>
  );
};

export default DashboardHome;