import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Store,
  Menu,
  X,
  Package,
  Star,
  Home,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getNotifications, getCart } from "@/utils/storage";

interface NavbarProps {
  showCart?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  showCart = false,
  showNotifications = true,
  showProfile = true,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications] = useState(() =>
    getNotifications().filter((n) => n.userId === user?.id && !n.read)
  );
  const [cartItems] = useState(() => getCart());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <nav className="bg-purple-600 dark:bg-purple-900 text-white shadow-lg border-b border-purple-400/50 dark:border-purple-800/50 px-4 py-3 sticky top-0 z-50 backdrop-blur-md transition-all duration-300">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link
          to={`/${user?.role}`}
          className="flex items-center space-x-3 group"
        >
          <img
            src="/logo.png"
            alt="Food Order System Logo"
            className="w-10 h-10 rounded-full shadow-md group-hover:scale-105 group-hover:shadow-purple-400/50 dark:group-hover:shadow-purple-700/50 transition-all duration-300"
          />
          <span className="font-bold text-xl tracking-tight group-hover:text-purple-200 dark:group-hover:text-purple-300 transition-colors duration-300">
            Food Order System
          </span>
        </Link>

        {/* Navigation Links - Desktop (Buyer specific) */}
        <div className="hidden lg:flex items-center space-x-8">
          {user?.role === "buyer" && (
            <>
              <Link
                to={`/${user?.role}`}
                className={`flex items-center text-sm font-medium transition-all duration-300 hover:text-purple-200 dark:hover:text-purple-300 relative group ${
                  location.pathname === `/${user?.role}/home`
                    ? "text-purple-200 dark:text-purple-300"
                    : "text-white/90 dark:text-white/80"
                }`}
              >
                <Home className="mr-2 h-4 w-4" />
                Home
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-purple-200 dark:bg-purple-300 group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </Link>
              <Link
                to="/store-list"
                className={`flex items-center text-sm font-medium transition-all duration-300 hover:text-purple-200 dark:hover:text-purple-300 relative group ${
                  location.pathname === "/store-list"
                    ? "text-purple-200 dark:text-purple-300"
                    : "text-white/90 dark:text-white/80"
                }`}
              >
                <Store className="mr-2 h-4 w-4" />
                Store List
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-purple-200 dark:bg-purple-300 group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </Link>
              <Link
                to="/buyer/orders"
                className={`flex items-center text-sm font-medium transition-all duration-300 hover:text-purple-200 dark:hover:text-purple-300 relative group ${
                  location.pathname === "/buyer/orders"
                    ? "text-purple-200 dark:text-purple-300"
                    : "text-white/90 dark:text-white/80"
                }`}
              >
                <Package className="mr-2 h-4 w-4" />
                My Orders
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-purple-200 dark:bg-purple-300 group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </Link>
              <Link
                to="/buyer/reviews"
                className={`flex items-center text-sm font-medium transition-all duration-300 hover:text-purple-200 dark:hover:text-purple-300 relative group ${
                  location.pathname === "/buyer/reviews"
                    ? "text-purple-200 dark:text-purple-300"
                    : "text-white/90 dark:text-white/80"
                }`}
              >
                <Star className="mr-2 h-4 w-4" />
                My Reviews
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-purple-200 dark:bg-purple-300 group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </Link>
            </>
          )}
        </div>

        {/* Right Side - Cart, Notifications, Profile, Hamburger */}
        <div className="flex items-center space-x-3">
          {/* Cart - Buyer only */}
          {showCart && user?.role === "buyer" && (
            <Button
              variant="ghost"
              size="sm"
              className="relative text-white dark:text-purple-200 hover:bg-purple-500/30 dark:hover:bg-purple-800/30 rounded-full p-2.5 transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link to="/buyer/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs font-bold p-0 bg-red-500 dark:bg-red-600 animate-pulse rounded-full"
                  >
                    {cartItems.length}
                  </Badge>
                )}
              </Link>
            </Button>
          )}

          {/* Notifications */}
          {showNotifications && (
            <Button
              variant="ghost"
              size="sm"
              className="relative text-white dark:text-purple-200 hover:bg-purple-500/30 dark:hover:bg-purple-800/30 rounded-full p-2.5 transition-all duration-300 hover:scale-105"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs font-bold p-0 bg-red-500 dark:bg-red-600 animate-pulse rounded-full"
                >
                  {notifications.length}
                </Badge>
              )}
            </Button>
          )}

          {/* Profile Dropdown */}
          {showProfile && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full ring-2 ring-purple-400/50 dark:ring-purple-700/50 hover:ring-purple-300/80 dark:hover:ring-purple-600/80 transition-all duration-300 hover:scale-105"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="" alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-purple-700 dark:from-purple-700 dark:to-purple-900 text-white text-sm font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-60 bg-white dark:bg-gray-900 shadow-xl rounded-xl border border-purple-200/50 dark:border-purple-800/50 p-2"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-semibold leading-none text-gray-800 dark:text-gray-100">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                    <Badge
                      variant="secondary"
                      className="w-fit bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200 font-medium"
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-purple-200/50 dark:bg-purple-800/50" />

                {/* Seller specific - Shop Profile */}
                {user.role === "seller" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/seller/profile"
                        className="flex items-center text-gray-800 dark:text-gray-200 hover:bg-purple-100/50 dark:hover:bg-purple-800/50 rounded-lg px-3 py-2 transition-colors duration-200"
                      >
                        <Store className="mr-2 h-4 w-4" />
                        Shop Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-purple-200/50 dark:bg-purple-800/50" />
                  </>
                )}

                {/* Buyer Profile */}
                {user.role === "buyer" && (
                  <DropdownMenuItem asChild>
                    <Link
                      to="/buyer/profile"
                      className="flex items-center text-gray-800 dark:text-gray-200 hover:bg-purple-100/50 dark:hover:bg-purple-800/50 rounded-lg px-3 py-2 transition-colors duration-200"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                  <Link
                    to={`/${user.role}/settings`}
                    className="flex items-center text-gray-800 dark:text-gray-200 hover:bg-purple-100/50 dark:hover:bg-purple-800/50 rounded-lg px-3 py-2 transition-colors duration-200"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-purple-200/50 dark:bg-purple-800/50" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center text-red-600 dark:text-red-400 hover:bg-red-100/50 dark:hover:bg-red-900/30 rounded-lg px-3 py-2 transition-colors duration-200"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Hamburger Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white dark:text-purple-200 hover:bg-purple-500/30 dark:hover:bg-purple-800/30 rounded-full p-2.5 transition-all duration-300 hover:scale-105"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 transform transition-transform duration-300 rotate-0 hover:rotate-90" />
            ) : (
              <Menu className="h-6 w-6 transform transition-transform duration-300 rotate-0 hover:rotate-90" />
            )}
          </Button>
        </div>
      </div>

      {/* Hamburger Menu Content - Mobile */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 shadow-xl rounded-xl mt-3 mx-2 border border-purple-200/50 dark:border-purple-800/50 animate-slide-down">
          <div className="flex flex-col p-4 space-y-3">
            <Link
              to={`/${user?.role}/home`}
              className="flex items-center text-gray-800 dark:text-gray-200 hover:bg-purple-100/50 dark:hover:bg-purple-800/50 px-4 py-2.5 rounded-lg transition-colors duration-200 font-medium"
              onClick={toggleMenu}
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
            <Link
              to="/store-list"
              className="flex items-center text-gray-800 dark:text-gray-200 hover:bg-purple-100/50 dark:hover:bg-purple-800/50 px-4 py-2.5 rounded-lg transition-colors duration-200 font-medium"
              onClick={toggleMenu}
            >
              <Store className="mr-2 h-4 w-4" />
              Store List
            </Link>
            {user?.role === "buyer" && (
              <>
                <Link
                  to="/buyer/orders"
                  className="flex items-center text-gray-800 dark:text-gray-200 hover:bg-purple-100/50 dark:hover:bg-purple-800/50 px-4 py-2.5 rounded-lg transition-colors duration-200 font-medium"
                  onClick={toggleMenu}
                >
                  <Package className="mr-2 h-4 w-4" />
                  My Orders
                </Link>
                <Link
                  to="/buyer/reviews"
                  className="flex items-center text-gray-800 dark:text-gray-200 hover:bg-purple-100/50 dark:hover:bg-purple-800/50 px-4 py-2.5 rounded-lg transition-colors duration-200 font-medium"
                  onClick={toggleMenu}
                >
                  <Star className="mr-2 h-4 w-4" />
                  My Reviews
                </Link>
              </>
            )}
            {user?.role === "seller" && (
              <Link
                to="/seller/profile"
                className="flex items-center text-gray-800 dark:text-gray-200 hover:bg-purple-100/50 dark:hover:bg-purple-800/50 px-4 py-2.5 rounded-lg transition-colors duration-200 font-medium"
                onClick={toggleMenu}
              >
                <Store className="mr-2 h-4 w-4" />
                Shop Profile
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
