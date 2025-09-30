import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, Store as StoreIcon, ArrowLeft } from 'lucide-react';
import { getOrders, getStores } from '@/utils/storage';
import { Order, Store } from '@/types';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Layout/Navbar';

const PaymentPage: React.FC = () => {
  const { orderId, storeId } = useParams<{ orderId: string; storeId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId || !storeId) {
      navigate('/buyer/orders');
      return;
    }

    const orders = getOrders();
    const stores = getStores();
    
    const foundOrder = orders.find(o => o.id === orderId);
    const foundStore = stores.find(s => s.sellerId === storeId);

    if (!foundOrder || !foundStore) {
      navigate('/buyer/orders');
      return;
    }

    setOrder(foundOrder);
    setStore(foundStore);
    setLoading(false);
  }, [orderId, storeId, navigate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePaymentConfirmation = () => {
    setPaymentConfirmed(true);
    
    toast({
      title: 'Payment Successful',
      description: 'Your payment has been confirmed. Order is being processed.',
    });

    setTimeout(() => {
      navigate('/buyer/orders');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar showCart={false} />
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-64 bg-muted rounded mb-4"></div>
            <div className="h-12 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order || !store) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar showCart={false} />
      
      <div className="max-w-md mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/buyer/cart')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Button>

        {!paymentConfirmed ? (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center">
                <StoreIcon className="h-5 w-5 mr-2 text-primary" />
                Payment - {store.name}
              </CardTitle>
              <p className="text-muted-foreground">
                Scan the QRIS code below to complete payment
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Order Details */}
              <div className="space-y-3">
                <h4 className="font-medium">Order Summary</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.menuName}</span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>

              {/* QRIS Code */}
              <div className="text-center space-y-4">
                <div className="w-64 h-64 mx-auto bg-white p-4 rounded-lg border-2 border-muted">
                  <img
                    src={store.qrisImage || `https://picsum.photos/240/240?random=qris${store.id}`}
                    alt="QRIS Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <Badge variant="outline" className="text-xs">
                  QRIS Payment Code
                </Badge>
              </div>

              {/* Payment Instructions */}
              <div className="space-y-2 text-sm text-muted-foreground">
                <h5 className="font-medium text-foreground">Payment Instructions:</h5>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open your mobile banking or e-wallet app</li>
                  <li>Scan the QRIS code above</li>
                  <li>Verify the amount: {formatCurrency(order.totalAmount)}</li>
                  <li>Complete the payment</li>
                  <li>Click "Payment Complete" below</li>
                </ol>
              </div>

              <Button 
                className="w-full" 
                onClick={handlePaymentConfirmation}
              >
                Payment Complete
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
              <p className="text-muted-foreground mb-6">
                Your order has been confirmed and is being processed.
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Redirecting to orders...</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;