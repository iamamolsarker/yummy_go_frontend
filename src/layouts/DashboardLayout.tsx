import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router';
import { 
  Home, 
  Settings, 
  Users, 
  Store, 
  Bike,
  ShoppingCart, 
  DollarSign, 
  BarChart3, 
  FileText, 
  LogOut,
  Menu,
  X,
  User,
  Package,
  MapPin,
  Star,
  Bell,
  HelpCircle
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useUserRole from '../hooks/useUserRole';
import { toast } from 'react-toastify';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logOut } = useAuth();
  const { role, roleLoading, isAdmin, isRider, isRestaurantOwner } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();

  // Show loading while checking user role
  if (roleLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-xl text-primary"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/auth/log-in" replace />;
  }

  const handleLogout = async () => {
    try {
      await logOut();
      toast.success("Logged out successfully");
      navigate('/'); // Redirect to home page after logout
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Logout failed");
    }
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const commonItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Profile', href: `/profile/${user?.email}`, icon: User },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    if (isAdmin) {
      return [
        { name: 'Admin Dashboard', href: '/dashboard', icon: Home },
        { name: 'Users Management', href: '/dashboard/admin/users', icon: Users },
        { name: 'Restaurants', href: '/dashboard/admin/restaurants', icon: Store },
        { name: 'Riders', href: '/dashboard/admin/riders', icon: Bike },
        { name: 'Orders', href: '/dashboard/admin/orders', icon: ShoppingCart },
        { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
        { name: 'Reports', href: '/dashboard/admin/reports', icon: FileText },
        ...commonItems.slice(1), // Exclude default dashboard, add profile and settings
      ];
    }

    if (isRestaurantOwner) {
      return [
        { name: 'Restaurant Dashboard', href: '/dashboard', icon: Home },
        { name: 'Menu Management', href: '/dashboard/restaurant/menu', icon: Package },
        { name: 'Orders', href: '/dashboard/restaurant/orders', icon: ShoppingCart },
        { name: 'Revenue', href: '/dashboard/restaurant/revenue', icon: DollarSign },
        { name: 'Reviews', href: '/dashboard/restaurant/reviews', icon: Star },
        { name: 'Analytics', href: '/dashboard/restaurant/analytics', icon: BarChart3 },
        ...commonItems.slice(1),
      ];
    }

    if (isRider) {
      return [
        { name: 'Rider Dashboard', href: '/dashboard', icon: Home },
        { name: 'Active Orders', href: '/dashboard/rider/orders', icon: ShoppingCart },
        { name: 'Delivery History', href: '/dashboard/rider/history', icon: FileText },
        { name: 'Earnings', href: '/dashboard/rider/earnings', icon: DollarSign },
        { name: 'Routes', href: '/dashboard/rider/routes', icon: MapPin },
        { name: 'Performance', href: '/dashboard/rider/performance', icon: BarChart3 },
        ...commonItems.slice(1),
      ];
    }

    // Default user navigation
    return [
      ...commonItems,
      { name: 'My Orders', href: '/dashboard/orders', icon: ShoppingCart },
      { name: 'Favorites', href: '/dashboard/favorites', icon: Star },
      { name: 'Help', href: '/dashboard/help', icon: HelpCircle },
    ];
  };

  const navigationItems = getNavigationItems();

  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-orange-500 to-red-500">
          <Link to="/" className="flex items-center gap-2">
            <img src="/yummy-go-logo.png" alt="Yummy Go" className="h-8 w-8" />
            <span className="text-white font-bold text-lg">Yummy Go</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img
              src={user?.photoURL || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
              alt="User Avatar"
              className="h-12 w-12 rounded-full object-cover border-2 border-orange-200"
            />
            <div>
              <h3 className="font-semibold text-gray-800">{user?.displayName || 'User'}</h3>
              <p className="text-sm text-gray-500 capitalize">{role}</p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Header */}
        <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-800"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 capitalize">
              {role} Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Welcome back,</span>
              <span className="font-semibold text-gray-800">{user?.displayName || 'User'}</span>
            </div>
          </div>
        </header>

        {/* Main Content Area Outlet */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;