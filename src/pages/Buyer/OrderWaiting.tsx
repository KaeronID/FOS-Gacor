import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Store,
  CheckCircle,
  Package,
  ChefHat,
  ArrowLeft,
} from "lucide-react";
import { getOrders, saveOrders } from "@/utils/storage";
import { Order } from "@/types";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Layout/Navbar";

const OrderWaiting: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [estimatedTime, setEstimatedTime] = useState(15); // minutes
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] =
    useState<Order["status"]>("pending");

  useEffect(() => {
    if (!orderId) {
      navigate("/buyer/orders");
      return;
    }

    const orders = getOrders();
    const foundOrder = orders.find((o) => o.id === orderId);

    if (!foundOrder) {
      navigate("/buyer/orders");
      return;
    }

    setOrder(foundOrder);
    setCurrentStatus(foundOrder.status);

    // Simulate order progress
    const statusProgress = {
      pending: 0,
      confirmed: 25,
      preparing: 50,
      ready: 100,
      completed: 100,
      cancelled: 0,
    };

    setProgress(statusProgress[foundOrder.status] || 0);

    // Auto-update order status simulation
    if (foundOrder.status === "pending") {
      setTimeout(() => updateOrderStatus("confirmed"), 30000); // 30 seconds
    } else if (foundOrder.status === "confirmed") {
      setTimeout(() => updateOrderStatus("preparing"), 60000); // 1 minute
    } else if (foundOrder.status === "preparing") {
      setTimeout(() => updateOrderStatus("ready"), 600000); // 10 minutes
    }
  }, [orderId, navigate]);

  const updateOrderStatus = (newStatus: Order["status"]) => {
    if (!order) return;

    const orders = getOrders();
    const updatedOrders = orders.map((o) =>
      o.id === order.id
        ? {
            ...o,
            status: newStatus,
            estimatedTime: newStatus === "ready" ? 0 : estimatedTime,
          }
        : o
    );

    saveOrders(updatedOrders);
    setCurrentStatus(newStatus);

    const statusProgress = {
      pending: 0,
      confirmed: 25,
      preparing: 50,
      ready: 100,
      completed: 100,
      cancelled: 0,
    };

    setProgress(statusProgress[newStatus] || 0);

    // Show notifications
    const notifications = {
      confirmed: "Order confirmed! Preparation will start soon.",
      preparing: "Your order is being prepared.",
      ready: "Order ready for pickup! Please collect your order.",
      completed: "Order completed. Thank you!",
      cancelled: "Order has been cancelled.",
    };

    if (notifications[newStatus]) {
      toast({
        title: "Order Update",
        description: notifications[newStatus],
      });
    }

    if (newStatus === "ready") {
      setEstimatedTime(0);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5" />;
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case "preparing":
        return <ChefHat className="h-5 w-5 text-orange-500" />;
      case "ready":
        return <Package className="h-5 w-5 text-green-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "Order Received";
      case "confirmed":
        return "Order Confirmed";
      case "preparing":
        return "Being Prepared";
      case "ready":
        return "Ready for Pickup";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown Status";
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar showCart={false} />
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-32 bg-muted rounded mb-4"></div>
            <div className="h-12 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar showCart={false} />

      <div className="max-w-md mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/buyer/orders")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                {getStatusIcon(currentStatus)}
                <span>{getStatusText(currentStatus)}</span>
              </CardTitle>
              <p className="text-muted-foreground">
                Order #{order.id.slice(-8)}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Estimated Time */}
              {estimatedTime > 0 && currentStatus !== "ready" && (
                <div className="text-center">
                  <Badge variant="outline" className="text-sm">
                    <Clock className="h-3 w-3 mr-1" />
                    Estimated time: {estimatedTime} minutes
                  </Badge>
                </div>
              )}

              {currentStatus === "ready" && (
                <div className="text-center">
                  <Badge className="bg-green-500 text-white">
                    <Package className="h-3 w-3 mr-1" />
                    Ready for pickup!
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="h-5 w-5 mr-2 text-primary" />
                {order.storeName}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Order Items</h4>
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.menuName}
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Payment Method</span>
                <Badge variant="outline">
                  {order.paymentMethod === "cash" ? "Cash on Delivery" : "QRIS"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          {currentStatus === "ready" && (
            <Button
              className="w-full"
              onClick={() => {
                updateOrderStatus("completed");
                setTimeout(() => navigate("/buyer/orders"), 1000);
              }}
            >
              Mark as Received
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderWaiting;
