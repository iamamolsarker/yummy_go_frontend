// src/layouts/DashboardLayout.tsx
import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
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
  Package,
  MapPin,
  Star,
  Bell,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import useUserRole from "../hooks/useUserRole";
import { toast } from "react-toastify";
import { CartProvider } from "../contextsProvider/CartContext";

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logOut } = useAuth();
  const { role, roleLoading, isAdmin, isRider, isRestaurantOwner } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();

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

  if (!user) {
    navigate("/auth/log-in");
    return null;
  }

  const handleLogout = async () => {
    try {
      await logOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  // Generate nav items
  const getNavigationItems = () => {
    const baseItems = [
      { name: "Dashboard", href: "/dashboard", icon: Home },
    ];

    if (isAdmin) {
      return [
        ...baseItems,
        { name: "Users Management", href: "/dashboard/admin/users", icon: Users },
        { name: "Restaurants", href: "/dashboard/admin/restaurants", icon: Store },
        { name: "Riders", href: "/dashboard/admin/riders", icon: Bike },
        { name: "Orders", href: "/dashboard/admin/orders", icon: ShoppingCart },
        { name: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
        { name: "Reports", href: "/dashboard/admin/reports", icon: FileText },
      ];
    }

    if (isRestaurantOwner) {
      return [
        ...baseItems,
        { name: "Menu Management", href: "/dashboard/restaurant/menu", icon: Package },
        { name: "Orders", href: "/dashboard/restaurant/orders", icon: ShoppingCart },
        { name: "Revenue", href: "/dashboard/restaurant/revenue", icon: DollarSign },
        { name: "Reviews", href: "/dashboard/restaurant/reviews", icon: Star },
        { name: "Analytics", href: "/dashboard/restaurant/analytics", icon: BarChart3 },
      ];
    }

    if (isRider) {
      return [
        ...baseItems,
        { name: "Active Orders", href: "/dashboard/rider/orders", icon: ShoppingCart },
        { name: "Delivery History", href: "/dashboard/rider/history", icon: FileText },
        { name: "Earnings", href: "/dashboard/rider/earnings", icon: DollarSign },
        { name: "Routes", href: "/dashboard/rider/routes", icon: MapPin },
        { name: "Performance", href: "/dashboard/rider/performance", icon: BarChart3 },
      ];
    }

    return [
      ...baseItems,
      { name: "My Orders", href: "/dashboard/orders", icon: ShoppingCart },
      { name: "Favorites", href: "/dashboard/favorites", icon: Star },
      { name: "Help", href: "/dashboard/help", icon: HelpCircle },
    ];
  };

  const navigationItems = getNavigationItems();

  const isActiveRoute = (href: string) => location.pathname === href;

  const sidebarWidth = collapsed ? "w-16" : "w-64";

  return (
    <CartProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-transform duration-300 flex flex-col 
  ${sidebarWidth} 
  ${mobileOpen ? "translate-x-0" : "-translate-x-full"} 
  md:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-orange-500 to-red-500 relative">
          <Link to="/" className="flex items-center gap-2">
            <img src="/yummy-go-logo.png" alt="Yummy Go" className={`${collapsed ? "h-8 w-8" : "h-8 w-8"}`} />
            {!collapsed && <span className="text-white font-bold text-lg">Yummy Go</span>}
          </Link>

          {/* Toggle */}
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className={`hidden md:block text-white font-medium hover:text-gray-200 p-0.5 rounded backdrop-blur-3xl bg-orange-500 hover:bg-orange-600 ${collapsed ? "absolute -right-2" : "absolute right-4"}`}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-white hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className={`p-3 border-b border-gray-100 ${collapsed ? "px-2" : "px-4"}`}>
          <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
            <Search size={18} className="text-gray-400" />
            {!collapsed && (
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent flex-1 px-2 text-sm focus:outline-none"
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto sidebar">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 ${collapsed ? "px-2 py-3" : "px-4 py-3"}  rounded-lg transition-all duration-200 ${active
                  ? "bg-orange-50 text-orange-600 border-r-2 border-orange-500 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
              >
                <Icon size={20} />
                {!collapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer (Profile + Settings + Logout) */}
        <div className={`px-3 py-4 border-t border-gray-200 ${collapsed ? "text-center" : ""}`}>
          <Link to={`/profile/${user?.email}`}>
            <div
              className={`flex items-center gap-4 rounded-md p-1 ${collapsed ? "justify-center" : ""}`}
            >
              <img
                src={
                  user?.photoURL ||
                  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                }
                alt="Avatar"
                className={`rounded-full border-2 border-orange-200 ${collapsed ? "w-8 h-8" : "w-10 h-10"}`}
              />
              {!collapsed && (
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{user?.displayName || "User"}</div>
                  <div className="text-xs text-gray-500 capitalize">{role}</div>
                </div>
              )}


            </div>
          </Link>
          <div className="flex flex-col gap-2 mt-3">

            {/* Settings */}
            <Link
              to="/dashboard/settings"
              className={`flex items-center gap-3 ${collapsed ? "px-2 py-3" : "px-4 py-3"}  rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-800 ${isActiveRoute("/dashboard/settings")
                ? "bg-orange-50 text-orange-600 border-r-2 border-orange-500 font-medium"
                : ""
                }`}
            >
              <Settings size={20} />
              {!collapsed && <span className="font-medium">Settings</span>}
            </Link>

            {!collapsed ? (
              <button
                onClick={handleLogout}
                className={`ml-2 flex items-center gap-2  ${collapsed ? "px-2 py-3" : "px-4 py-3"}  rounded-md bg-red-50 text-red-600 hover:bg-red-100`}
              >
                <LogOut size={20} />
                <span className="text-sm">Logout</span>
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="p-2 rounded-md bg-red-50 text-red-600"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>

      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? "md:ml-16" : "md:ml-64"}`}>
        {/* Header */}
        <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-gray-600 hover:text-gray-800"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 capitalize">{role} Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <span>Welcome back,</span>
              <span className="font-semibold text-gray-800">{user?.displayName || "User"}</span>
            </div>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      </div>
    </CartProvider>
  );
};

export default DashboardLayout;
