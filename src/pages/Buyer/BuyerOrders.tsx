import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Clock,
  Package,
  CheckCircle,
  Star,
  X,
  AlertTriangle,
  ShoppingBag,
  MessageCircle,
  Shield,
  Moon,
  Sun,
  Timer,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  getOrders,
  saveOrders,
  getReviews,
  saveReviews,
  getMenus,
  saveMenus,
} from "@/utils/storage";
import { Order, Review, Menu } from "@/types";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Layout/Navbar";

const BuyerOrders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const [reviewModal, setReviewModal] = useState<{
    open: boolean;
    order: Order | null;
  }>({
    open: false,
    order: null,
  });
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
    isAnonymous: false,
  });
  const [cancelModal, setCancelModal] = useState<{
    open: boolean;
    order: Order | null;
  }>({
    open: false,
    order: null,
  });
  const [waitTimeAlerts, setWaitTimeAlerts] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    if (user) {
      const userOrders = getOrders().filter((o) => o.buyerId === user.id);
      setOrders(userOrders);
      setReviews(getReviews());
      setMenus(getMenus());
    }
  }, [user]);

  // Dark mode effect
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Wait time monitoring
  useEffect(() => {
    const activeOrdersToMonitor = orders.filter((order) =>
      ["confirmed", "preparing"].includes(order.status)
    );

    const timers = activeOrdersToMonitor.map((order) => {
      const estimatedTime = calculateEstimatedTime(order);
      const orderTime = new Date(order.createdAt).getTime();
      const currentTime = Date.now();
      const elapsedMinutes = (currentTime - orderTime) / (1000 * 60);

      // Show alert if order is 50% over estimated time
      const alertThreshold = estimatedTime * 1.5;

      if (elapsedMinutes > alertThreshold && !waitTimeAlerts[order.id]) {
        return setTimeout(() => {
          setWaitTimeAlerts((prev) => ({ ...prev, [order.id]: true }));
          toast({
            title: "Order Taking Longer Than Expected",
            description: `Your order from ${order.storeName} is taking longer than estimated. You may want to check with the seller.`,
            variant: "destructive",
          });
        }, 1000);
      }
      return null;
    });

    return () => {
      timers.forEach((timer) => timer && clearTimeout(timer));
    };
  }, [orders, waitTimeAlerts]);

  // Stock management functions - Simplified version
  const updateMenuStock = (
    menuId: string,
    quantityChange: number,
    operation: "add" | "subtract"
  ) => {
    const allMenus = getMenus();
    const menuIndex = allMenus.findIndex((menu) => menu.id === menuId);

    if (menuIndex !== -1) {
      // Initialize stock if it doesn't exist
      if (!("stock" in allMenus[menuIndex])) {
        (allMenus[menuIndex] as any).stock = 50; // Default stock
      }

      const currentStock = (allMenus[menuIndex] as any).stock || 0;

      if (operation === "subtract") {
        (allMenus[menuIndex] as any).stock = Math.max(
          0,
          currentStock - quantityChange
        );
      } else {
        (allMenus[menuIndex] as any).stock = currentStock + quantityChange;
      }

      saveMenus(allMenus);
      setMenus(allMenus);
    }
  };

  const restoreStockForOrder = (order: Order) => {
    order.items.forEach((item) => {
      updateMenuStock(item.menuId, item.quantity, "add");
    });

    toast({
      title: "Stock Restored",
      description: `Stock has been restored for ${order.items.length} item(s)`,
    });
  };

  const reduceStockForOrder = (order: Order) => {
    order.items.forEach((item) => {
      updateMenuStock(item.menuId, item.quantity, "subtract");
    });
  };

  // Security validation
  const validateInput = (input: string): boolean => {
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /onload=/i,
      /onerror=/i,
      /eval\(/i,
      /document\.cookie/i,
      /localStorage/i,
      /sessionStorage/i,
    ];
    return !dangerousPatterns.some((pattern) => pattern.test(input));
  };

  const sanitizeInput = (input: string): string => {
    return input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
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
    const colors = {
      pending: isDarkMode
        ? "bg-yellow-900/20 text-yellow-300 border-yellow-700"
        : "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmed: isDarkMode
        ? "bg-blue-900/20 text-blue-300 border-blue-700"
        : "bg-blue-100 text-blue-800 border-blue-300",
      preparing: isDarkMode
        ? "bg-purple-900/20 text-purple-300 border-purple-700"
        : "bg-purple-100 text-purple-800 border-purple-300",
      ready: isDarkMode
        ? "bg-green-900/20 text-green-300 border-green-700"
        : "bg-green-100 text-green-800 border-green-300",
      completed: isDarkMode
        ? "bg-gray-800/20 text-gray-300 border-gray-600"
        : "bg-gray-100 text-gray-800 border-gray-300",
      cancelled: isDarkMode
        ? "bg-red-900/20 text-red-300 border-red-700"
        : "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
      case "confirmed":
        return Clock;
      case "preparing":
        return Package;
      case "ready":
      case "completed":
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const canCancel = (order: Order) => {
    return ["pending", "confirmed"].includes(order.status);
  };

  const canPickup = (order: Order) => {
    return order.status === "ready";
  };

  const canReview = (order: Order) => {
    return (
      order.status === "completed" &&
      !reviews.some((r) => r.orderId === order.id)
    );
  };

  const calculateEstimatedTime = (order: Order) => {
    const baseTime = 10;
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const timePerItem = 3;
    return baseTime + itemCount * timePerItem;
  };

  const getWaitTimeStatus = (order: Order) => {
    const estimatedTime = calculateEstimatedTime(order);
    const orderTime = new Date(order.createdAt).getTime();
    const currentTime = Date.now();
    const elapsedMinutes = (currentTime - orderTime) / (1000 * 60);

    const percentage = (elapsedMinutes / estimatedTime) * 100;

    if (percentage <= 100) {
      return {
        status: "on-time",
        color: "text-green-600 dark:text-green-400",
        percentage,
      };
    } else if (percentage <= 150) {
      return {
        status: "slightly-delayed",
        color: "text-yellow-600 dark:text-yellow-400",
        percentage,
      };
    } else {
      return {
        status: "delayed",
        color: "text-red-600 dark:text-red-400",
        percentage,
      };
    }
  };

  const handleCancelOrder = async (order: Order) => {
    if (!user) return;

    try {
      const allOrders = getOrders();
      const orderIndex = allOrders.findIndex((o) => o.id === order.id);

      if (orderIndex === -1) {
        toast({
          title: "Error",
          description: "Order not found",
          variant: "destructive",
        });
        return;
      }

      if (allOrders[orderIndex].buyerId !== user.id) {
        toast({
          title: "Security Error",
          description: "Unauthorized action detected",
          variant: "destructive",
        });
        return;
      }

      // Restore stock when order is cancelled
      restoreStockForOrder(order);

      allOrders[orderIndex].status = "cancelled";
      allOrders[orderIndex].cancelledAt = new Date().toISOString();

      saveOrders(allOrders);
      setOrders(allOrders.filter((o) => o.buyerId === user.id));
      setCancelModal({ open: false, order: null });

      toast({
        title: "Order Cancelled",
        description:
          "Your order has been cancelled and stock has been restored",
        action: <TrendingUp className="h-4 w-4" />,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePickupOrder = async (order: Order) => {
    if (!user) return;

    try {
      const allOrders = getOrders();
      const orderIndex = allOrders.findIndex((o) => o.id === order.id);

      if (orderIndex === -1) {
        toast({
          title: "Error",
          description: "Order not found",
          variant: "destructive",
        });
        return;
      }

      if (allOrders[orderIndex].buyerId !== user.id) {
        toast({
          title: "Security Error",
          description: "Unauthorized action detected",
          variant: "destructive",
        });
        return;
      }

      // Stock is already reduced when order was placed, no need to reduce again
      allOrders[orderIndex].status = "completed";
      allOrders[orderIndex].completedAt = new Date().toISOString();

      saveOrders(allOrders);
      setOrders(allOrders.filter((o) => o.buyerId === user.id));

      toast({
        title: "Order Completed",
        description: "Thank you for your pickup! You can now leave a review.",
        action: <TrendingDown className="h-4 w-4" />,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !reviewModal.order) return;

    if (!validateInput(reviewForm.comment)) {
      toast({
        title: "Security Error",
        description: "Invalid characters detected in review",
        variant: "destructive",
      });
      return;
    }

    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      toast({
        title: "Validation Error",
        description: "Rating must be between 1 and 5 stars",
        variant: "destructive",
      });
      return;
    }

    if (reviewForm.comment.length < 5) {
      toast({
        title: "Validation Error",
        description: "Review comment must be at least 5 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      const newReview: Review = {
        id: Date.now().toString(),
        orderId: reviewModal.order.id,
        buyerId: user.id,
        buyerName: reviewForm.isAnonymous ? "Anonymous" : user.name,
        menuId: reviewModal.order.items[0].menuId,
        menuName: reviewModal.order.items[0].menuName,
        sellerId: reviewModal.order.sellerId,
        rating: reviewForm.rating,
        comment: sanitizeInput(reviewForm.comment),
        isAnonymous: reviewForm.isAnonymous,
        createdAt: new Date().toISOString(),
      };

      const allReviews = getReviews();

      if (
        allReviews.some(
          (r) => r.orderId === reviewModal.order!.id && r.buyerId === user.id
        )
      ) {
        toast({
          title: "Error",
          description: "You have already reviewed this order",
          variant: "destructive",
        });
        return;
      }

      allReviews.push(newReview);
      saveReviews(allReviews);
      setReviews(allReviews);
      setReviewModal({ open: false, order: null });
      setReviewForm({ rating: 5, comment: "", isAnonymous: false });

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStarRating = (
    rating: number,
    onChange?: (rating: number) => void
  ) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 cursor-pointer ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : isDarkMode
                ? "text-gray-600"
                : "text-gray-300"
            }`}
            onClick={() => onChange && onChange(star)}
          />
        ))}
      </div>
    );
  };

  const activeOrders = orders.filter((o) =>
    ["pending", "confirmed", "preparing", "ready"].includes(o.status)
  );
  const completedOrders = orders.filter((o) => o.status === "completed");
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  const themeClasses = isDarkMode
    ? "min-h-screen bg-gray-900 text-white"
    : "min-h-screen bg-gray-50 text-gray-900";

  const cardClasses = isDarkMode
    ? "border-gray-700 bg-gray-800 shadow-lg"
    : "border-purple-200 bg-white shadow-md";

  return (
    <TooltipProvider>
      <div className={themeClasses}>
        <Navbar showCart={true} />

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header with Dark Mode Toggle */}
          <div className="mb-8 relative">
            <div className="flex items-start justify-between">
              <div>
                <h2
                  className={`text-3xl font-bold mb-2 ${
                    isDarkMode ? "text-purple-300" : "text-purple-900"
                  }`}
                >
                  My Orders
                </h2>
                <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  Track your food orders and order history
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {/* Security Warning Icon */}
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full border-2 border-red-500 dark:border-red-700">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    className={`max-w-xs p-4 ${
                      isDarkMode
                        ? "bg-red-900/20 border-red-700"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <Shield className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-red-800 dark:text-red-300">
                          Anti-Fraud Warning
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                          Jangan melakukan victim order atau pesanan palsu.
                          Semua aktivitas dipantau oleh sistem keamanan
                          universitas dan pelanggar akan dikenai sanksi akademik
                          yang berat.
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <Tabs defaultValue="active" className="space-y-6">
            <TabsList
              className={`grid w-full grid-cols-3 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600"
                  : "bg-white border-purple-200"
              }`}
            >
              <TabsTrigger
                value="active"
                className={`flex items-center space-x-2 ${
                  isDarkMode
                    ? "data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    : "data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>Active Orders</span>
                {activeOrders.length > 0 && (
                  <Badge className="ml-2 bg-yellow-500 text-white">
                    {activeOrders.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className={
                  isDarkMode
                    ? "data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    : "data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                }
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed
              </TabsTrigger>
              <TabsTrigger
                value="cancelled"
                className={
                  isDarkMode
                    ? "data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    : "data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                }
              >
                Cancelled
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeOrders.length > 0 ? (
                activeOrders.map((order) => {
                  const StatusIcon = getStatusIcon(order.status);
                  const estimatedTime = calculateEstimatedTime(order);
                  const waitTime = getWaitTimeStatus(order);

                  return (
                    <Card key={order.id} className={cardClasses}>
                      <CardHeader
                        className={
                          isDarkMode ? "bg-gray-700/50" : "bg-purple-50"
                        }
                      >
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center space-x-3">
                            <StatusIcon
                              className={`h-5 w-5 ${
                                isDarkMode
                                  ? "text-purple-400"
                                  : "text-purple-600"
                              }`}
                            />
                            <span
                              className={
                                isDarkMode
                                  ? "text-purple-300"
                                  : "text-purple-900"
                              }
                            >
                              {order.storeName}
                            </span>
                          </CardTitle>
                          <Badge
                            className={`${getStatusColor(order.status)} border`}
                          >
                            {order.status.toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4
                              className={`font-medium mb-2 ${
                                isDarkMode
                                  ? "text-purple-300"
                                  : "text-purple-900"
                              }`}
                            >
                              Order Items:
                            </h4>
                            <ul className="space-y-1">
                              {order.items.map((item, index) => (
                                <li
                                  key={index}
                                  className="flex justify-between text-sm"
                                >
                                  <span>
                                    {item.quantity}x {item.menuName}
                                  </span>
                                  <span className="font-medium">
                                    {formatCurrency(item.price * item.quantity)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex justify-between items-center border-t pt-4 border-gray-200 dark:border-gray-600">
                            <div
                              className={`text-sm ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              Ordered: {formatDate(order.createdAt)}
                            </div>
                            <div className="text-right">
                              <div
                                className={`font-bold text-lg ${
                                  isDarkMode
                                    ? "text-purple-300"
                                    : "text-purple-900"
                                }`}
                              >
                                {formatCurrency(order.totalAmount)}
                              </div>
                              <div
                                className={`text-sm ${
                                  isDarkMode ? "text-gray-400" : "text-gray-600"
                                }`}
                              >
                                {order.paymentMethod.toUpperCase()}
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Wait Time Display */}
                          <div
                            className={`p-3 rounded-lg border ${
                              waitTime.status === "delayed"
                                ? isDarkMode
                                  ? "bg-red-900/20 border-red-700"
                                  : "bg-red-50 border-red-200"
                                : waitTime.status === "slightly-delayed"
                                ? isDarkMode
                                  ? "bg-yellow-900/20 border-yellow-700"
                                  : "bg-yellow-50 border-yellow-200"
                                : isDarkMode
                                ? "bg-blue-900/20 border-blue-700"
                                : "bg-blue-50 border-blue-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className={`text-sm ${waitTime.color}`}>
                                <Timer className="h-4 w-4 inline mr-2" />
                                Estimated time: {estimatedTime} minutes
                                {order.status === "preparing" && (
                                  <span className="ml-2 font-medium">
                                    (Currently being prepared)
                                  </span>
                                )}
                              </p>
                              <div
                                className={`text-xs font-medium ${waitTime.color}`}
                              >
                                {waitTime.percentage.toFixed(0)}% of estimated
                                time
                              </div>
                            </div>

                            {waitTime.status === "delayed" && (
                              <Alert className="mt-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Order Taking Longer</AlertTitle>
                                <AlertDescription>
                                  This order is taking longer than expected.
                                  Consider contacting the seller.
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2 pt-4">
                            {canCancel(order) && (
                              <Dialog
                                open={
                                  cancelModal.open &&
                                  cancelModal.order?.id === order.id
                                }
                                onOpenChange={(open) =>
                                  setCancelModal({
                                    open,
                                    order: open ? order : null,
                                  })
                                }
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={`${
                                      isDarkMode
                                        ? "border-red-700 text-red-400 hover:bg-red-900/20"
                                        : "border-red-300 text-red-700 hover:bg-red-50"
                                    }`}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel Order
                                  </Button>
                                </DialogTrigger>
                                <DialogContent
                                  className={
                                    isDarkMode
                                      ? "bg-gray-800 border-gray-600"
                                      : ""
                                  }
                                >
                                  <DialogHeader>
                                    <DialogTitle
                                      className={isDarkMode ? "text-white" : ""}
                                    >
                                      Cancel Order
                                    </DialogTitle>
                                    <DialogDescription
                                      className={
                                        isDarkMode ? "text-gray-400" : ""
                                      }
                                    >
                                      Are you sure you want to cancel this
                                      order? Stock will be restored and this
                                      action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        setCancelModal({
                                          open: false,
                                          order: null,
                                        })
                                      }
                                    >
                                      Keep Order
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleCancelOrder(order)}
                                    >
                                      Yes, Cancel Order
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}

                            {canPickup(order) && (
                              <Button
                                onClick={() => handlePickupOrder(order)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                Confirm Pickup
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className={cardClasses}>
                  <CardContent className="text-center py-12">
                    <Clock
                      className={`h-12 w-12 mx-auto mb-4 ${
                        isDarkMode ? "text-purple-600" : "text-purple-300"
                      }`}
                    />
                    <h3
                      className={`text-lg font-semibold mb-2 ${
                        isDarkMode ? "text-purple-300" : "text-purple-900"
                      }`}
                    >
                      No active orders
                    </h3>
                    <p
                      className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Your active orders will appear here when you place them
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedOrders.length > 0 ? (
                completedOrders.map((order) => (
                  <Card
                    key={order.id}
                    className={`${cardClasses} ${
                      isDarkMode ? "border-green-700" : "border-green-200"
                    }`}
                  >
                    <CardHeader
                      className={isDarkMode ? "bg-green-900/20" : "bg-green-50"}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-3">
                          <CheckCircle
                            className={`h-5 w-5 ${
                              isDarkMode ? "text-green-400" : "text-green-600"
                            }`}
                          />
                          <span
                            className={
                              isDarkMode ? "text-green-300" : "text-green-900"
                            }
                          >
                            {order.storeName}
                          </span>
                        </CardTitle>
                        <Badge
                          className={`${
                            isDarkMode
                              ? "bg-green-900/20 text-green-300 border-green-700"
                              : "bg-green-100 text-green-800 border-green-300"
                          }`}
                        >
                          COMPLETED
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4
                            className={`font-medium mb-2 ${
                              isDarkMode ? "text-green-300" : "text-green-900"
                            }`}
                          >
                            Order Items:
                          </h4>
                          <ul className="space-y-1">
                            {order.items.map((item, index) => (
                              <li
                                key={index}
                                className="flex justify-between text-sm"
                              >
                                <span>
                                  {item.quantity}x {item.menuName}
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex justify-between items-center border-t pt-4 border-gray-200 dark:border-gray-600">
                          <div
                            className={`text-sm ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            <div>Ordered: {formatDate(order.createdAt)}</div>
                            {order.completedAt && (
                              <div>
                                Completed: {formatDate(order.completedAt)}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-bold text-lg ${
                                isDarkMode ? "text-green-300" : "text-green-900"
                              }`}
                            >
                              {formatCurrency(order.totalAmount)}
                            </div>
                            <div
                              className={`text-sm ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              {order.paymentMethod.toUpperCase()}
                            </div>
                          </div>
                        </div>

                        {canReview(order) && (
                          <div className="border-t pt-4 border-gray-200 dark:border-gray-600">
                            <Dialog
                              open={
                                reviewModal.open &&
                                reviewModal.order?.id === order.id
                              }
                              onOpenChange={(open) =>
                                setReviewModal({
                                  open,
                                  order: open ? order : null,
                                })
                              }
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={`w-full ${
                                    isDarkMode
                                      ? "border-yellow-700 text-yellow-400 hover:bg-yellow-900/20"
                                      : "border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                                  }`}
                                >
                                  <Star className="h-4 w-4 mr-2" />
                                  Write a Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent
                                className={`max-w-md ${
                                  isDarkMode
                                    ? "bg-gray-800 border-gray-600"
                                    : ""
                                }`}
                              >
                                <DialogHeader>
                                  <DialogTitle
                                    className={`flex items-center ${
                                      isDarkMode
                                        ? "text-purple-300"
                                        : "text-purple-900"
                                    }`}
                                  >
                                    <MessageCircle className="h-5 w-5 mr-2" />
                                    Review Your Order
                                  </DialogTitle>
                                  <DialogDescription
                                    className={
                                      isDarkMode ? "text-gray-400" : ""
                                    }
                                  >
                                    Share your experience with {order.storeName}
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                  <div>
                                    <Label
                                      htmlFor="rating"
                                      className={
                                        isDarkMode
                                          ? "text-purple-300"
                                          : "text-purple-900"
                                      }
                                    >
                                      Rating
                                    </Label>
                                    {renderStarRating(
                                      reviewForm.rating,
                                      (rating) =>
                                        setReviewForm((prev) => ({
                                          ...prev,
                                          rating,
                                        }))
                                    )}
                                  </div>

                                  <div>
                                    <Label
                                      htmlFor="comment"
                                      className={
                                        isDarkMode
                                          ? "text-purple-300"
                                          : "text-purple-900"
                                      }
                                    >
                                      Comment
                                    </Label>
                                    <Textarea
                                      id="comment"
                                      placeholder="Tell us about your experience..."
                                      value={reviewForm.comment}
                                      onChange={(e) =>
                                        setReviewForm((prev) => ({
                                          ...prev,
                                          comment: e.target.value,
                                        }))
                                      }
                                      className={`mt-1 min-h-20 ${
                                        isDarkMode
                                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                          : ""
                                      }`}
                                      maxLength={500}
                                    />
                                    <p
                                      className={`text-xs mt-1 ${
                                        isDarkMode
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {reviewForm.comment.length}/500 characters
                                    </p>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id="anonymous"
                                      checked={reviewForm.isAnonymous}
                                      onChange={(e) =>
                                        setReviewForm((prev) => ({
                                          ...prev,
                                          isAnonymous: e.target.checked,
                                        }))
                                      }
                                      className="rounded"
                                    />
                                    <Label
                                      htmlFor="anonymous"
                                      className="text-sm"
                                    >
                                      Post as anonymous
                                    </Label>
                                  </div>
                                </div>

                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setReviewModal({
                                        open: false,
                                        order: null,
                                      });
                                      setReviewForm({
                                        rating: 5,
                                        comment: "",
                                        isAnonymous: false,
                                      });
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleSubmitReview}
                                    disabled={reviewForm.comment.length < 5}
                                    className="bg-purple-600 hover:bg-purple-700"
                                  >
                                    Submit Review
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className={cardClasses}>
                  <CardContent className="text-center py-12">
                    <CheckCircle
                      className={`h-12 w-12 mx-auto mb-4 ${
                        isDarkMode ? "text-green-600" : "text-green-300"
                      }`}
                    />
                    <h3
                      className={`text-lg font-semibold mb-2 ${
                        isDarkMode ? "text-green-300" : "text-green-900"
                      }`}
                    >
                      No completed orders
                    </h3>
                    <p
                      className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Your completed orders will appear here
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              {cancelledOrders.length > 0 ? (
                cancelledOrders.map((order) => (
                  <Card
                    key={order.id}
                    className={`${cardClasses} ${
                      isDarkMode
                        ? "border-red-700 opacity-75"
                        : "border-red-200 opacity-75"
                    }`}
                  >
                    <CardHeader
                      className={isDarkMode ? "bg-red-900/20" : "bg-red-50"}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-3">
                          <X
                            className={`h-5 w-5 ${
                              isDarkMode ? "text-red-400" : "text-red-600"
                            }`}
                          />
                          <span
                            className={
                              isDarkMode ? "text-red-300" : "text-red-900"
                            }
                          >
                            {order.storeName}
                          </span>
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={`${
                              isDarkMode
                                ? "bg-red-900/20 text-red-300 border-red-700"
                                : "bg-red-100 text-red-800 border-red-300"
                            }`}
                          >
                            CANCELLED
                          </Badge>
                          <Tooltip>
                            <TooltipTrigger>
                              <TrendingUp
                                className={`h-4 w-4 ${
                                  isDarkMode
                                    ? "text-green-400"
                                    : "text-green-600"
                                }`}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Stock was restored when this order was cancelled
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4
                            className={`font-medium mb-2 ${
                              isDarkMode ? "text-red-300" : "text-red-900"
                            }`}
                          >
                            Order Items:
                          </h4>
                          <ul className="space-y-1">
                            {order.items.map((item, index) => (
                              <li
                                key={index}
                                className="flex justify-between text-sm"
                              >
                                <span>
                                  {item.quantity}x {item.menuName}
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex justify-between items-center border-t pt-4 border-gray-200 dark:border-gray-600">
                          <div
                            className={`text-sm ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            <div>Ordered: {formatDate(order.createdAt)}</div>
                            {order.cancelledAt && (
                              <div>
                                Cancelled: {formatDate(order.cancelledAt)}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-bold text-lg ${
                                isDarkMode ? "text-red-300" : "text-red-900"
                              }`}
                            >
                              {formatCurrency(order.totalAmount)}
                            </div>
                            <div
                              className={`text-sm ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              {order.paymentMethod.toUpperCase()}
                            </div>
                          </div>
                        </div>

                        {/* Stock restoration notice */}
                        <div
                          className={`p-3 rounded-lg border ${
                            isDarkMode
                              ? "bg-green-900/20 border-green-700"
                              : "bg-green-50 border-green-200"
                          }`}
                        >
                          <p
                            className={`text-sm ${
                              isDarkMode ? "text-green-300" : "text-green-800"
                            }`}
                          >
                            <TrendingUp className="h-4 w-4 inline mr-2" />
                            Stock has been automatically restored for all items
                            in this cancelled order
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className={cardClasses}>
                  <CardContent className="text-center py-12">
                    <X
                      className={`h-12 w-12 mx-auto mb-4 ${
                        isDarkMode ? "text-red-600" : "text-red-300"
                      }`}
                    />
                    <h3
                      className={`text-lg font-semibold mb-2 ${
                        isDarkMode ? "text-red-300" : "text-red-900"
                      }`}
                    >
                      No cancelled orders
                    </h3>
                    <p
                      className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Your cancelled orders would appear here
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BuyerOrders;
