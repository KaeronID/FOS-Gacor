import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  ShoppingCart,
  ArrowLeft,
  Clock,
  Users,
  MapPin,
  Package,
} from "lucide-react";
import {
  getMenuById,
  getCart,
  saveCart,
  getReviewsByMenuId,
  getStores,
} from "@/utils/storage";
import { Menu, Review } from "@/types";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Layout/Navbar";

const MenuDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [storeLocation, setStoreLocation] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate("/buyer");
      return;
    }

    const fetchMenu = () => {
      const menuData = getMenuById(id);
      if (!menuData) {
        toast({
          title: "Menu Not Found",
          description: "The requested menu could not be found",
          variant: "destructive",
        });
        navigate("/buyer");
        return;
      }

      setMenu(menuData);

      const storeData = getStores().find(
        (s) => s.sellerId === menuData.sellerId
      );
      setStoreLocation(storeData?.location || "Location not available");

      setReviews(getReviewsByMenuId(id));
      setCart(getCart());
      setLoading(false);
    };

    fetchMenu();
  }, [id, navigate]);

  const addToCart = (menu: Menu) => {
    const currentUser = JSON.parse(
      localStorage.getItem("scu_fos_current_user") || "null"
    );
    if (!currentUser) return;

    const existingCart = getCart();
    const userCartItems = existingCart.filter(
      (item: any) => item.buyerId === currentUser.id
    );
    const existingItem = userCartItems.find((item) => item.menuId === menu.id);

    let updatedUserItems;
    if (existingItem) {
      updatedUserItems = userCartItems.map((item) =>
        item.menuId === menu.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      const newItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        menuId: menu.id,
        menuName: menu.name,
        price: menu.price,
        quantity: 1,
        image: menu.image || `https://picsum.photos/400/300?random=${menu.id}`,
        storeName: menu.storeName,
        sellerId: menu.sellerId,
        buyerId: currentUser.id,
      };
      updatedUserItems = [...userCartItems, newItem];
    }

    // Combine with other users' cart items
    const otherUsersItems = existingCart.filter(
      (item: any) => item.buyerId !== currentUser.id
    );
    const newCart = [...otherUsersItems, ...updatedUserItems];

    setCart(updatedUserItems);
    saveCart(newCart);

    toast({
      title: "Added to Cart",
      description: `${menu.name} has been added to your cart`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar showCart={true} />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-64 bg-muted rounded-lg mb-6"></div>
            <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/4 mb-6"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!menu) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar showCart={true} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/buyer")}
          className="mb-6 text-purple-800 dark:text-purple-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="order-1 lg:order-2">
            <div className="aspect-[4/3] overflow-hidden rounded-xl shadow-md">
              <img
                src={
                  menu.image ||
                  `https://picsum.photos/600/600?random=${menu.id}`
                }
                alt={menu.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6 order-2 lg:order-1">
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {menu.name}
                </h1>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {menu.category}
                </Badge>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                {menu.storeName}
              </p>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 fill-yellow-300 text-yellow-300" />
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    {menu.rating}
                  </span>
                  <span className="text-muted-foreground">
                    ({menu.reviewCount} reviews)
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Users className="h-5 w-5" />
                  <span>{menu.reviewCount} reviews</span>
                </div>
              </div>

              <div className="text-3xl font-bold text-purple-800 dark:text-purple-300 mb-2">
                {formatPrice(menu.price)}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Prep: {menu.prepTime || "N/A"} min
                </div>
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-1" />
                  Stock: {menu.stock || 0}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {storeLocation}
                </div>
              </div>
            </div>

            <Separator className="dark:bg-gray-700" />

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Description
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {menu.description}
              </p>
            </div>

            {menu.ingredients && menu.ingredients.length > 0 && (
              <>
                <Separator className="dark:bg-gray-700" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Ingredients
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                    {menu.ingredients.map((ingredient, index) => (
                      <li key={index}>
                        {ingredient.ingredientName} ({ingredient.quantity}{" "}
                        units)
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <Button
              className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => addToCart(menu)}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart - {formatPrice(menu.price)}
            </Button>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Customer Reviews
            </h2>
            <div className="space-y-6">
              {reviews.slice(0, 5).map((review) => (
                <Card
                  key={review.id}
                  className="border-0 shadow-sm bg-white dark:bg-gray-800"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-gray-900 dark:text-white">
                          {review.buyerName}
                        </CardTitle>
                        <div className="flex items-center space-x-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-300 text-yellow-300"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          ))}
                          <span className="text-sm text-muted-foreground ml-2">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {review.comment}
                    </p>
                    {review.sellerResponse && (
                      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          Seller Response:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {review.sellerResponse}
                        </p>
                        {review.respondedAt && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(review.respondedAt)}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuDetail;
