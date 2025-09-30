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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Search,
  Filter,
  ChefHat,
  CheckCircle,
  X,
  Check,
  ArrowLeft,
  Clock,
  Users,
  Package,
  Zap,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getOrders, saveOrders } from "@/utils/storage";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Layout/Navbar";

const AllOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const ordersPerPage = 10;

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const userOrders = getOrders().filter((o) => o.sellerId === user.id);
        const sortedOrders = userOrders.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAllOrders(sortedOrders);
        setFilteredOrders(sortedOrders);

        // Simulate loading for smooth animation
        setTimeout(() => setIsLoading(false), 800);
      }
    };

    loadData();
  }, [user]);

  useEffect(() => {
    let filtered = [...allOrders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items.some((item) =>
            item.menuName.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        const orderDateOnly = new Date(
          orderDate.getFullYear(),
          orderDate.getMonth(),
          orderDate.getDate()
        );

        switch (dateFilter) {
          case "today":
            return orderDateOnly.getTime() === today.getTime();
          case "week":
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return orderDateOnly >= weekAgo;
          case "month":
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return orderDateOnly >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, dateFilter, allOrders]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

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
    const allOrdersData = getOrders();
    const updatedOrders = allOrdersData.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );

    saveOrders(updatedOrders);

    // Update local state
    const userOrders = updatedOrders.filter((o) => o.sellerId === user?.id);
    const sortedOrders = userOrders.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setAllOrders(sortedOrders);

    toast({
      title: "Order Updated",
      description: `Order status changed to ${newStatus}`,
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

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFilter("all");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <div className="animate-pulse">
            <div className="h-4 bg-purple-200 rounded w-48 mx-auto mb-2"></div>
            <div className="h-3 bg-purple-100 rounded w-32 mx-auto"></div>
          </div>
          <p className="text-purple-600 font-medium mt-4">
            Loading all orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-50">
      <Navbar showCart={false} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header with Animation */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              asChild
            >
              <Link to="/seller">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                All Orders
              </h1>
              <p className="text-gray-600 text-lg">
                Manage all your orders with advanced filtering and pagination
              </p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div
            className="transform hover:scale-105 transition-all duration-300 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <Card className="bg-white border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {filteredOrders.length}
                </div>
                <p className="text-sm text-gray-600 flex items-center justify-center">
                  <Package className="h-3 w-3 mr-1" />
                  Total Orders
                </p>
              </CardContent>
            </Card>
          </div>

          <div
            className="transform hover:scale-105 transition-all duration-300 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Card className="bg-white border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {
                    filteredOrders.filter(
                      (o) => o.status === "pending" || o.status === "confirmed"
                    ).length
                  }
                </div>
                <p className="text-sm text-gray-600 flex items-center justify-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </p>
              </CardContent>
            </Card>
          </div>

          <div
            className="transform hover:scale-105 transition-all duration-300 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Card className="bg-white border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {
                    filteredOrders.filter((o) => o.status === "completed")
                      .length
                  }
                </div>
                <p className="text-sm text-gray-600 flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </p>
              </CardContent>
            </Card>
          </div>

          <div
            className="transform hover:scale-105 transition-all duration-300 animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            <Card className="bg-white border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {formatCurrency(
                    filteredOrders
                      .filter((o) => o.status === "completed")
                      .reduce((sum, order) => sum + order.totalAmount, 0)
                  )}
                </div>
                <p className="text-sm text-gray-600 flex items-center justify-center">
                  <Star className="h-3 w-3 mr-1" />
                  Revenue
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters with Enhanced Design */}
        <div className="animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <Card className="bg-white border-2 border-gray-200 shadow-lg mb-8 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50">
              <CardTitle className="text-purple-700 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Advanced Filters
              </CardTitle>
              <CardDescription className="text-gray-600">
                Filter and search through your orders easily
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Search Orders
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                    <Input
                      placeholder="Search by ID, customer, or menu..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-2 border-purple-200 focus:border-purple-400 transition-colors duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Status Filter
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="border-2 border-blue-200 focus:border-blue-400 transition-colors duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Date Range
                  </label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="border-2 border-yellow-200 focus:border-yellow-400 transition-colors duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={clearFilters}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <div className="animate-slide-up" style={{ animationDelay: "0.6s" }}>
          <Card className="bg-white border-2 border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-purple-700 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Orders Management
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, filteredOrders.length)} of{" "}
                    {filteredOrders.length} orders
                  </CardDescription>
                </div>
                {filteredOrders.length > 0 && (
                  <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-purple-200">
                    Page {currentPage} of {totalPages}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {currentOrders.length > 0 ? (
                <div className="space-y-4">
                  {currentOrders.map((order, index) => (
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
                        <p className="text-sm font-medium text-purple-600 mb-2 flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          Customer: {order.buyerName}
                        </p>
                        <p className="text-sm text-gray-600 mb-3 flex items-center">
                          <Package className="h-3 w-3 mr-1" />
                          {order.items
                            .map((item) => `${item.quantity}x ${item.menuName}`)
                            .join(", ")}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(order.createdAt)}
                          </span>
                          <span className="font-bold text-lg text-yellow-600 flex items-center">
                            <Zap className="h-4 w-4 mr-1" />
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
                  <div className="p-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center animate-pulse">
                    <Package className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    No orders found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {filteredOrders.length === 0 && allOrders.length > 0
                      ? "Try adjusting your filters to see more results"
                      : "No orders yet. Start promoting your menu items!"}
                  </p>
                  {filteredOrders.length === 0 && allOrders.length > 0 && (
                    <Button
                      onClick={clearFilters}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between mt-8 animate-fade-in"
            style={{ animationDelay: "0.7s" }}
          >
            <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredOrders.length)} of{" "}
              {filteredOrders.length} results
            </div>

            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      size="sm"
                      className={
                        currentPage === pageNumber
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg transform scale-110 transition-all duration-200"
                          : "bg-white border-2 border-purple-200 text-purple-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:border-transparent transform hover:-translate-y-0.5 transition-all duration-200"
                      }
                      onClick={() => goToPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>

              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Quick Actions Floating Panel */}
        <div
          className="fixed bottom-6 right-6 space-y-3 animate-fade-in"
          style={{ animationDelay: "1s" }}
        >
          <div className="bg-white rounded-full shadow-xl border-2 border-purple-200 p-2">
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full w-12 h-12 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              title="Back to Top"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
          </div>
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

        .group:hover .group-hover\\:opacity-100 {
          opacity: 1;
        }

        /* Loading animation enhancements */
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Hover effects */
        .transform {
          transform: translateZ(0);
        }

        /* Smooth transitions for all interactive elements */
        * {
          transition-property: transform, box-shadow, background-color,
            border-color;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default AllOrdersPage;
