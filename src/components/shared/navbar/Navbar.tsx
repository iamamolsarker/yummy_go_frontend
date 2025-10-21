
import React, { useState, useRef, useEffect } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { FaUserCircle, FaCog, FaSignOutAlt, FaUser } from "react-icons/fa";
import logo from "/yummy-go-logo.png";
import { Link } from "react-router";
import useAuth from "../../../hooks/useAuth";
import { toast } from "react-toastify";
import useUserRole from "../../../hooks/useUserRole";
import { useCart } from "../../../hooks/useCart";
import CartModal from "../../Cart/CartModal";

const Navbar: React.FC = () => {
  // Replace with your AuthContext or props
  const { user, logOut } = useAuth();
  console.log(user)
  const { isAdmin, isRider, isRestaurantOwner } = useUserRole();
  const { cartItemsCount, setIsCartOpen } = useCart();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {

    try {
      logOut();

      // success toast
      toast.success("Logged Out Successfully ");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "LogOut failed");

    } finally {
      setOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="shadow-md sticky top-0 z-[1000] bg-[#ffe5df] backdrop-blur-3xl">
      <div className="container mx-auto flex items-center justify-between py-1.5 px-3">
        {/* Logo + Brand */}
        <div >
          <Link to={"/"} className="flex items-center gap-2">
            <img src={logo} alt="Yummy Go" className="h-14" />
            <div className="hidden md:block">
              <h1 className="text-2xl font-bold text-[#EF451C]">Yummy Go</h1>
            </div>
          </Link>

        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative text-2xl text-gray-700 hover:text-[#ef451c] transition-colors"
          >
            <FiShoppingCart />
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#ef451c] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </button>

          {/* If user logged in */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full border border-[#ef451c] hover:bg-[#c23312] transition"
              >
                <img
                  src={user.photoURL ?? "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                  alt="User Avatar"
                  className="h-9 w-9 rounded-full object-cover border border-white"
                />
                <span className="font-medium hidden sm:block">{user.displayName}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {open && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-200 z-50">
                  <Link
                    to={`/profile/${user.email}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#ffe5df] hover:text-[#ef451c]"
                    onClick={() => setOpen(false)}
                  >
                    <FaUser className="mr-2 text-gray-500" /> Profile
                  </Link>
                  {/* dynamic dashboard link */}
                  {(isAdmin || isRider || isRestaurantOwner) && (
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#ffe5df] hover:text-[#ef451c]"
                      onClick={() => setOpen(false)}
                    >
                      <FaUserCircle className="mr-2 text-gray-500" /> Dashboard
                    </Link>
                  )}
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#ffe5df] hover:text-[#ef451c]"
                    onClick={() => setOpen(false)}
                  >
                    <FaCog className="mr-2 text-gray-500" /> Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#ffe5df] hover:text-[#ef451c]"
                  >
                    <FaSignOutAlt className="mr-2 text-gray-500" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // If not logged in 
            <div className="flex items-center gap-2">
              <Link
                to="/auth/log-in"
                className="px-4 py-1 border border-[#ef451c] rounded-md text-[#ef451c] hover:bg-[#ffe5df] transition"
              >
                Sign in
              </Link>
              <Link
                to="/auth/user-reg"
                className="px-4 py-1 bg-[#ef451c] text-white rounded-md hover:bg-[#c23312] transition"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Cart Modal */}
      <CartModal />
    </nav>
  );
};

export default Navbar;
