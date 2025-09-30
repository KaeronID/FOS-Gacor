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
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Store,
  CreditCard,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Clock,
  Truck,
} from "lucide-react";
import {
  getCart,
  saveCart,
  getMenus,
  getOrders,
  saveOrders,
} from "@/utils/storage";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Layout/Navbar";
import { useNavigate } from "react-router-dom";

interface CartItem {
  id: string;
  menuId: string;
  menuName: string;
  price: number;
  quantity: number;
  image: string;
  storeName: string;
  sellerId: string;
  notes?: string;
  buyerId: string;
}

const BuyerCart: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "cash" | "qris" | null
  >(null);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>("");

  // Listen for real-time cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      if (user) {
        const cart = getCart().filter((item: any) => item.buyerId === user.id);
        setCartItems(cart);
      }
    };

    // Initial load
    if (user) {
      handleCartUpdate();
      calculateEstimatedDelivery();
    }

    // Add event listener for real-time updates
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [user]);

  const calculateEstimatedDelivery = () => {
    const now = new Date();
    const deliveryTime = new Date(
      now.getTime() + (25 + Math.random() * 15) * 60000
    ); // 25-40 minutes
    setEstimatedDelivery(
      deliveryTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    const updatedItems = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);

    const allCartItems = getCart();
    const otherItems = allCartItems.filter(
      (item: any) => item.buyerId !== user?.id
    );
    const userItems = updatedItems.map((item) => ({
      ...item,
      buyerId: user?.id,
    }));
    saveCart([...otherItems, ...userItems]);

    // Trigger real-time update
    window.dispatchEvent(new CustomEvent("cartUpdated"));

    toast({
      title: "✅ Quantity Updated",
      description: `${
        updatedItems.find((i) => i.id === itemId)?.menuName
      } - ${newQuantity} item(s)`,
    });
  };

  const removeItem = (itemId: string) => {
    const itemToRemove = cartItems.find((item) => item.id === itemId);
    const updatedItems = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedItems);

    const allCartItems = getCart();
    const otherItems = allCartItems.filter(
      (item: any) => item.buyerId !== user?.id
    );
    const userItems = updatedItems.map((item) => ({
      ...item,
      buyerId: user?.id,
    }));
    saveCart([...otherItems, ...userItems]);

    // Trigger real-time update
    window.dispatchEvent(new CustomEvent("cartUpdated"));

    toast({
      title: "🗑️ Item Removed",
      description: `${itemToRemove?.menuName} removed from cart`,
    });
  };

  const clearCart = () => {
    setCartItems([]);
    const allCartItems = getCart();
    const otherItems = allCartItems.filter(
      (item: any) => item.buyerId !== user?.id
    );
    saveCart(otherItems);

    // Trigger real-time update
    window.dispatchEvent(new CustomEvent("cartUpdated"));

    toast({
      title: "🧹 Cart Cleared",
      description: "All items removed from cart",
    });
  };

  const getTotalAmount = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getUniqueStores = () => {
    return [
      ...new Set(
        cartItems.map((item) => ({ name: item.storeName, id: item.sellerId }))
      ),
    ];
  };

  const getDeliveryFee = () => {
    return 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePaymentSelection = (method: "cash" | "qris") => {
    setSelectedPaymentMethod(method);

    toast({
      title: `💳 ${method === "cash" ? "Cash" : "QRIS"} Selected`,
      description: `Payment method set to ${
        method === "cash" ? "cash" : "QRIS"
      }`,
    });
  };

  const handleProceedToCheckout = () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "⚠️ Select Payment Method",
        description: "Please select a payment method first",
        variant: "destructive",
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "🛒 Empty Cart",
        description: "Please add items to cart first",
        variant: "destructive",
      });
      return;
    }

    setShowCheckoutDialog(true);
  };

  const handleConfirmCheckout = async () => {
    if (!selectedPaymentMethod) return;

    setLoading(true);
    setShowCheckoutDialog(false);

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Group items by store
      const storeGroups = cartItems.reduce((groups: any, item) => {
        if (!groups[item.sellerId]) {
          groups[item.sellerId] = [];
        }
        groups[item.sellerId].push(item);
        return groups;
      }, {});

      const orders = getOrders();
      const newOrderIds: string[] = [];

      // Create separate order for each store
      Object.keys(storeGroups).forEach((sellerId) => {
        const storeItems = storeGroups[sellerId];
        const totalAmount = storeItems.reduce(
          (total: number, item: CartItem) => total + item.price * item.quantity,
          0
        );

        const orderId =
          Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const newOrder = {
          id: orderId,
          buyerId: user!.id,
          buyerName: user!.name,
          sellerId: sellerId,
          storeName: storeItems[0].storeName,
          items: storeItems.map((item: CartItem) => ({
            menuId: item.menuId,
            menuName: item.menuName,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes || "",
          })),
          totalAmount,
          deliveryFee: getDeliveryFee() / Object.keys(storeGroups).length,
          status: "pending" as const,
          paymentMethod: selectedPaymentMethod,
          createdAt: new Date().toISOString(),
          estimatedDelivery: estimatedDelivery,
          orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        };

        orders.push(newOrder);
        newOrderIds.push(orderId);
      });

      saveOrders(orders);

      // Clear cart
      clearCart();
      setSelectedPaymentMethod(null);

      if (selectedPaymentMethod === "cash") {
        toast({
          title: "🎉 Order Created!",
          description: `${
            newOrderIds.length
          } order(s) created with number: ${orders
            .slice(-newOrderIds.length)
            .map((o) => o.orderNumber)
            .join(", ")}`,
        });
        navigate("/buyer/orders");
      } else {
        // For QRIS, navigate to payment confirmation
        const firstOrderId = newOrderIds[0];
        const firstStoreId = Object.keys(storeGroups)[0];
        toast({
          title: "📱 Proceed to QRIS Payment",
          description: "You will be redirected to QRIS payment page",
        });
        navigate(`/buyer/payment/${firstOrderId}/${firstStoreId}`);
      }
    } catch (error) {
      toast({
        title: "❌ Checkout Failed",
        description:
          "An error occurred while processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar showCart={false} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white flex items-center">
            <ShoppingCart className="h-8 w-8 mr-3 text-purple-600 dark:text-purple-400" />
            Shopping Cart
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Review your items and proceed to checkout
          </p>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Cart Items ({cartItems.length})
                </h3>
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>

              <div className="max-h-[500px] overflow-y-auto space-y-4 custom-scrollbar">
                {cartItems.map((item) => (
                  <Card
                    key={item.id}
                    className="border-0 shadow-sm bg-white dark:bg-gray-800"
                  >
                    <CardContent className="p-4 flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.menuName}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {item.menuName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.storeName}
                        </p>
                        <p className="font-medium text-purple-600 dark:text-purple-400">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <Card className="sticky top-6 border-0 shadow-sm bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(getTotalAmount())}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Delivery Fee</span>
                  <span>Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>
                    {formatCurrency(getTotalAmount() + getDeliveryFee())}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Payment Method
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={
                        selectedPaymentMethod === "cash" ? "default" : "outline"
                      }
                      onClick={() => handlePaymentSelection("cash")}
                      className={
                        selectedPaymentMethod === "cash"
                          ? "bg-purple-600 text-white"
                          : ""
                      }
                    >
                      Cash
                    </Button>
                    <Button
                      variant={
                        selectedPaymentMethod === "qris" ? "default" : "outline"
                      }
                      onClick={() => handlePaymentSelection("qris")}
                      className={
                        selectedPaymentMethod === "qris"
                          ? "bg-purple-600 text-white"
                          : ""
                      }
                    >
                      QRIS
                    </Button>
                  </div>
                </div>
                <Button
                  className="w-full bg-purple-600 text-white hover:bg-purple-700"
                  onClick={handleProceedToCheckout}
                  disabled={!selectedPaymentMethod || loading}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
            <CardContent className="text-center py-16">
              <ShoppingCart className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Your Cart is Empty
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Browse our menu and add items to start shopping
              </p>
              <Button
                className="bg-purple-600 text-white hover:bg-purple-700"
                onClick={() => navigate("/buyer")}
              >
                Browse Menu
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Confirm Order
            </DialogTitle>
            <DialogDescription>
              Review your order details before proceeding
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(getTotalAmount())}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>Free</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(getTotalAmount() + getDeliveryFee())}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method</span>
              <span className="capitalize">{selectedPaymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Arrival</span>
              <span>{estimatedDelivery}</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCheckoutDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCheckout}
              disabled={loading}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #6b21a8, #4338ca);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #5b21b6, #3730a3);
        }
      `}</style>
    </div>
  );
};

export default BuyerCart;
