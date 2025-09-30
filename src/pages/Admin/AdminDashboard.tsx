import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/Admin/AdminSidebar';
import Navbar from '@/components/Layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  ShoppingBag, 
  Star, 
  TrendingUp,
  Package,
  ClipboardList
} from 'lucide-react';
import { getUsers, getOrders, getReviews, getMenus } from '@/utils/storage';
import AdminUsers from './AdminUsers';
import AdminSellers from './AdminSellers';
import AdminBuyers from './AdminBuyers';
import AdminAnalytics from './AdminAnalytics';
import AdminPromotions from './AdminPromotions';

const AdminDashboardHome: React.FC = () => {
  const users = getUsers();
  const orders = getOrders();
  const reviews = getReviews();
  const menus = getMenus();

  const stats = {
    totalUsers: users.length,
    buyers: users.filter(u => u.role === 'buyer').length,
    sellers: users.filter(u => u.role === 'seller').length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders
      .filter(o => o.status === 'completed')
      .reduce((sum, order) => sum + order.totalAmount, 0),
    totalMenus: menus.length,
    totalReviews: reviews.length,
    averageRating: reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Welcome to Admin Panel</h2>
        <p className="text-muted-foreground">
          Monitor and manage the SCU Food Order System
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="secondary">{stats.buyers} Buyers</Badge>
              <Badge variant="outline">{stats.sellers} Sellers</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="warning">{stats.pendingOrders} Pending</Badge>
              <Badge variant="default">{stats.completedOrders} Completed</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-2">
              From completed orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-2">
              From {stats.totalReviews} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Menu Management
            </CardTitle>
            <CardDescription>
              Manage menu items and ingredients across all stores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Menu Items</span>
                <Badge variant="outline">{stats.totalMenus}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Active Stores</span>
                <Badge variant="outline">{stats.sellers}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="h-5 w-5 mr-2" />
              Order Management
            </CardTitle>
            <CardDescription>
              Monitor orders and track system performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Orders Today</span>
                <Badge variant="outline">
                  {orders.filter(o => {
                    const today = new Date().toDateString();
                    const orderDate = new Date(o.createdAt).toDateString();
                    return today === orderDate;
                  }).length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Pending Orders</span>
                <Badge variant={stats.pendingOrders > 0 ? "warning" : "outline"}>
                  {stats.pendingOrders}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest orders and reviews from the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <p className="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.storeName} • {formatCurrency(order.totalAmount)}
                  </p>
                </div>
                <Badge variant={
                  order.status === 'completed' ? 'default' :
                  order.status === 'pending' ? 'warning' : 'secondary'
                }>
                  {order.status}
                </Badge>
              </div>
            ))}
            
            {orders.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <div className="border-b">
            <div className="flex h-16 items-center px-6">
              <SidebarTrigger className="mr-4" />
              <div className="flex items-center space-x-4 flex-1">
                <h1 className="text-xl font-semibold">Admin Dashboard</h1>
              </div>
              <Navbar showCart={false} showNotifications={true} showProfile={true} />
            </div>
          </div>

          <main className="flex-1 p-6">
            <Routes>
              <Route index element={<AdminDashboardHome />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="sellers" element={<AdminSellers />} />
              <Route path="buyers" element={<AdminBuyers />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="promotions" element={<AdminPromotions />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;