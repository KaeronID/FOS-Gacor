import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Package,
  ShoppingBag,
  Star,
  TrendingUp,
  Clock,
  DollarSign,
  Edit3,
  Trash2,
  ChefHat,
  CheckCircle,
  X,
  Check,
  Eye,
  Users,
  Award,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  getOrders,
  getMenus,
  getReviews,
  getStores,
  saveOrders,
  saveMenus,
} from "@/utils/storage";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Layout/Navbar";

const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [store, setStore] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const userOrders = getOrders().filter((o) => o.sellerId === user.id);
        const sortedOrders = userOrders.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
        setMenus(getMenus().filter((m) => m.sellerId === user.id));
        setReviews(getReviews().filter((r) => r.sellerId === user.id));
        setStore(getStores().find((s) => s.sellerId === user.id));

        // Simulate loading for smooth animation
        setTimeout(() => setIsLoading(false), 500);
      }
    };

    loadData();
  }, [user]);

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(
      (o) => o.status === "pending" || o.status === "confirmed"
    ).length,
    completedOrders: orders.filter((o) => o.status === "completed").length,
    totalRevenue: orders
      .filter((o) => o.status === "completed")
      .reduce((sum, order) => sum + order.totalAmount, 0),
    totalMenus: menus.length,
    totalReviews: reviews.length,
    averageRating:
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0,
    todayOrders: orders.filter((o) => {
      const today = new Date().toDateString();
      const orderDate = new Date(o.createdAt).toDateString();
      return today === orderDate;
    }).length,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "preparing":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "ready":
        return "bg-green-100 text-green-800 border-green-300";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const updateOrderStatus = (
    orderId: string,
    newStatus:
      | "pending"
      | "confirmed"
      | "preparing"
      | "ready"
      | "completed"
      | "cancelled"
  ) => {
    const allOrders = getOrders();
    const updatedOrders = allOrders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );

    saveOrders(updatedOrders);
    const userOrders = updatedOrders.filter((o) => o.sellerId === user?.id);
    const sortedOrders = userOrders.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setOrders(sortedOrders);

    toast({
      title: "Order Updated",
      description: `Order status changed to ${newStatus}`,
    });
  };

  const deleteMenu = (menuId: string) => {
    const allMenus = getMenus();
    const updatedMenus = allMenus.filter((menu) => menu.id !== menuId);

    saveMenus(updatedMenus);
    setMenus(updatedMenus.filter((m) => m.sellerId === user?.id));

    toast({
      title: "Menu Deleted",
      description: "Menu item has been removed successfully",
    });
  };

  const getNextStatus = (
    currentStatus: string
  ):
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "completed"
    | "cancelled" => {
    switch (currentStatus) {
      case "pending":
        return "preparing";
      case "preparing":
        return "ready";
      case "ready":
        return "completed";
      default:
        return currentStatus as
          | "pending"
          | "confirmed"
          | "preparing"
          | "ready"
          | "completed"
          | "cancelled";
    }
  };

  const getStatusButtonText = (status: string) => {
    switch (status) {
      case "pending":
        return "Start Preparing";
      case "preparing":
        return "Mark Ready";
      case "ready":
        return "Complete";
      default:
        return "No Action";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <ChefHat className="h-4 w-4" />;
      case "preparing":
        return <CheckCircle className="h-4 w-4" />;
      case "ready":
        return <Check className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const canUpdateStatus = (status: string) => {
    return ["pending", "preparing", "ready"].includes(status);
  };

  const canCancelOrder = (status: string) => {
    return ["pending", "confirmed"].includes(status);
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return "text-red-600 font-bold";
    if (stock <= 10) return "text-yellow-600 font-semibold";
    return "text-green-600 font-semibold";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-50">
      <Navbar showCart={false} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section with Animation */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
              <Award className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Welcome back, {store?.name || user?.name}!
              </h2>
              <p className="text-gray-600 text-lg">
                Manage your store and track your sales performance
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid with Enhanced Animation */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Today's Orders Card */}
          <div
            className="transform hover:scale-105 transition-all duration-300 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <Card className="bg-white border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-bl-full opacity-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Today's Orders
                </CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-700 mb-1">
                  {stats.todayOrders}
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="h-3 w-3 text-yellow-500" />
                  <p className="text-xs text-gray-600">
                    {stats.pendingOrders} pending
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Card */}
          <div
            className="transform hover:scale-105 transition-all duration-300 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Card className="bg-white border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-bl-full opacity-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Total Revenue
                </CardTitle>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {formatCurrency(stats.totalRevenue)}
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <p className="text-xs text-gray-600">
                    From {stats.completedOrders} orders
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Menu Items Card */}
          <div
            className="transform hover:scale-105 transition-all duration-300 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Card className="bg-white border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-bl-full opacity-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Menu Items
                </CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-700 mb-2">
                  {stats.totalMenus}
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  asChild
                >
                  <Link to="/seller/menu/new">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Menu
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Rating Card */}
          <div
            className="transform hover:scale-105 transition-all duration-300 animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            <Card className="bg-white border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-bl-full opacity-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Average Rating
                </CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-5 w-5 text-purple-600 fill-current" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-700 mb-1">
                  {stats.averageRating > 0
                    ? stats.averageRating.toFixed(1)
                    : "N/A"}
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3 text-purple-500" />
                  <p className="text-xs text-gray-600">
                    From {stats.totalReviews} reviews
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white shadow-md border-2 border-gray-200 rounded-xl p-2">
              <TabsTrigger
                value="orders"
                className="text-gray-600 font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Recent Orders
              </TabsTrigger>
              <TabsTrigger
                value="menus"
                className="text-gray-600 font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300"
              >
                <Package className="h-4 w-4 mr-2" />
                My Menus
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="text-gray-600 font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300"
              >
                <Star className="h-4 w-4 mr-2" />
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4">
              <Card className="bg-white border-2 border-gray-200 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
                  <div>
                    <CardTitle className="text-purple-700 flex items-center">
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      Recent Orders
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Latest 10 orders from your customers
                    </CardDescription>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                    onClick={() => navigate("/seller/orders")}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View All Orders
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.slice(0, 10).map((order, index) => (
                        <div
                          key={order.id}
                          className="group flex items-center justify-between p-6 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 hover:border-purple-300 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                          style={{
                            animation: `fadeInUp 0.5s ease-out ${
                              index * 0.1
                            }s both`,
                          }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-bold text-gray-800">
                                Order #{order.id.slice(0, 8)}
                              </h4>
                              <Badge
                                className={`${getStatusColor(
                                  order.status
                                )} border-2 px-3 py-1 rounded-full font-semibold`}
                              >
                                {order.status}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-purple-600 mb-2">
                              Customer: {order.buyerName}
                            </p>
                            <p className="text-sm text-gray-600 mb-3">
                              {order.items
                                .map(
                                  (item) => `${item.quantity}x ${item.menuName}`
                                )
                                .join(", ")}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDate(order.createdAt)}
                              </span>
                              <span className="font-bold text-lg text-yellow-600">
                                {formatCurrency(order.totalAmount)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-6 flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {canUpdateStatus(order.status) && (
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                                onClick={() =>
                                  updateOrderStatus(
                                    order.id,
                                    getNextStatus(order.status)
                                  )
                                }
                              >
                                {getStatusIcon(order.status)}
                                <span className="ml-1">
                                  {getStatusButtonText(order.status)}
                                </span>
                              </Button>
                            )}
                            {canCancelOrder(order.status) && (
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      "Are you sure you want to cancel this order?"
                                    )
                                  ) {
                                    updateOrderStatus(order.id, "cancelled");
                                  }
                                }}
                              >
                                <X className="h-4 w-4" />
                                <span className="ml-1">Cancel</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="p-4 bg-purple-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <ShoppingBag className="h-10 w-10 text-purple-500" />
                      </div>
                      <p className="text-gray-600 text-lg font-medium">
                        No orders yet
                      </p>
                      <p className="text-gray-500">
                        Start promoting your menu items!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="menus" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-purple-700 flex items-center">
                  <Package className="h-6 w-6 mr-2" />
                  My Menu Items
                </h3>
                <Button
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  asChild
                >
                  <Link to="/seller/menu/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Menu
                  </Link>
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {menus.map((menu, index) => (
                  <div
                    key={menu.id}
                    className="group transform hover:scale-105 transition-all duration-300"
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${index * 0.15}s both`,
                    }}
                  >
                    <Card className="bg-white border-2 border-gray-200 hover:border-purple-300 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      <div className="aspect-video overflow-hidden relative">
                        <img
                          src={
                            menu.image ||
                            "https://picsum.photos/400/300?random=" + menu.id
                          }
                          alt={menu.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold text-gray-800">
                          {menu.name}
                        </CardTitle>
                        <div className="flex items-center justify-between">
                          <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-full font-semibold">
                            {menu.category}
                          </Badge>
                          <span className="font-bold text-xl text-yellow-600">
                            {formatCurrency(menu.price)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {menu.description}
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">
                                {menu.rating}
                              </span>
                              <span className="text-gray-500">
                                ({menu.reviewCount})
                              </span>
                            </div>
                          </div>
                          <div className="text-sm flex items-center space-x-1">
                            <Package className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-600">Stock: </span>
                            <span
                              className={`font-bold ${getStockColor(
                                menu.stock || 0
                              )}`}
                            >
                              {menu.stock || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                            asChild
                          >
                            <Link to={`/seller/menu/${menu.id}/edit`}>
                              <Edit3 className="h-3 w-3 mr-1" />
                              Edit
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this menu item?"
                                )
                              ) {
                                deleteMenu(menu.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              {menus.length === 0 && (
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
                  <CardContent className="text-center py-16">
                    <div className="p-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center animate-pulse">
                      <Package className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-purple-700">
                      No menu items yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start by adding your first menu item to attract customers
                    </p>
                    <Button
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                      asChild
                    >
                      <Link to="/seller/menu/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Menu
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <Card className="bg-white border-2 border-gray-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-yellow-50">
                  <CardTitle className="text-purple-700 flex items-center">
                    <Star className="h-5 w-5 mr-2 fill-current" />
                    Customer Reviews
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Feedback from your customers
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.slice(0, 10).map((review, index) => (
                        <div
                          key={review.id}
                          className="p-6 bg-gradient-to-r from-white to-purple-50 border-2 border-purple-200 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                          style={{
                            animation: `fadeInUp 0.5s ease-out ${
                              index * 0.1
                            }s both`,
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-gray-800 flex items-center">
                              <Users className="h-4 w-4 mr-2 text-purple-500" />
                              {review.buyerName}
                            </h4>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 transition-colors duration-200 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm font-medium text-purple-600 mb-2 flex items-center">
                            <Package className="h-3 w-3 mr-1" />
                            {review.menuName}
                          </p>
                          <p className="text-sm text-gray-700 mb-3 bg-white p-3 rounded-lg border border-gray-200">
                            "{review.comment}"
                          </p>
                          {review.sellerResponse && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                              <p className="text-sm font-semibold mb-2 text-blue-700 flex items-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Your Response:
                              </p>
                              <p className="text-sm text-gray-700">
                                "{review.sellerResponse}"
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-3 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="p-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center animate-pulse">
                        <Star className="h-12 w-12 text-white fill-current" />
                      </div>
                      <p className="text-gray-600 text-lg font-medium mb-2">
                        No reviews yet
                      </p>
                      <p className="text-gray-500">
                        Complete some orders to start receiving feedback!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slideUp 0.6s ease-out both;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .group:hover .group-hover\\:opacity-100 {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default SellerDashboard;
