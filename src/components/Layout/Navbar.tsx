import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, ShoppingCart, User, LogOut, Settings, Store } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getNotifications, getCart } from '@/utils/storage';

interface NavbarProps {
  showCart?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  showCart = false, 
  showNotifications = true,
  showProfile = true 
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications] = useState(() => getNotifications().filter(n => n.userId === user?.id && !n.read));
  const [cartItems] = useState(() => getCart());

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <nav className="bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <Link to={`/${user?.role}`} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SCU</span>
            </div>
            <span className="font-bold text-xl text-foreground">Food Order System</span>
          </Link>
        </div>

        {/* Navigation Links - Buyer specific */}
        {user?.role === 'buyer' && (
          <div className="flex items-center space-x-6">
            <Link 
              to="/buyer/orders" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/buyer/orders' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              My Orders
            </Link>
            <Link 
              to="/buyer/reviews" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/buyer/reviews' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              My Reviews
            </Link>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Cart - Buyer only */}
          {showCart && user?.role === 'buyer' && (
            <Button variant="ghost" size="sm" className="relative" asChild>
              <Link to="/buyer/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
                  >
                    {cartItems.length}
                  </Badge>
                )}
              </Link>
            </Button>
          )}

          {/* Notifications */}
          {showNotifications && (
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
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
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <Badge variant="secondary" className="w-fit">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Seller specific - Shop Profile */}
                {user.role === 'seller' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/seller/profile" className="flex items-center">
                        <Store className="mr-2 h-4 w-4" />
                        Shop Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                {/* Only show profile for buyers, sellers use Shop Profile */}
                {user.role === 'buyer' && (
                  <DropdownMenuItem asChild>
                    <Link to={`/${user.role}/profile`} className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem asChild>
                  <Link to={`/${user.role}/settings`} className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;