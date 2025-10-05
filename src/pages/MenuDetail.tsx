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
  Store,
  MessageSquare,
} from "lucide-react";
import {
  getMenuById,
  getCart,
  saveCart,
  getReviewsByMenuId,
  getStores,
  getMenus,
} from "@/utils/storage";
import { Menu, Review } from "@/types";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Layout/Navbar";

const MenuDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [storeLocation, setStoreLocation] = useState("");
  const [storeMenus, setStoreMenus] = useState<Menu[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStoreProducts, setShowStoreProducts] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/buyer");
      return;
    }

    const fetchMenu = async () => {
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

      const allMenus = getMenus();
      const sameStoreMenus = allMenus.filter(
        (m) => m.sellerId === menuData.sellerId && m.id !== menuData.id
      );
      setStoreMenus(sameStoreMenus.slice(0, 6));
      setShowStoreProducts(sameStoreMenus.length > 0);

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

    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "You must log in to add items to your cart.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

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

    const otherUsersItems = existingCart.filter(
      (item: any) => item.buyerId !== currentUser.id
    );
    const newCart = [...otherUsersItems, ...updatedUserItems];

    setCart(newCart);
    saveCart(newCart);

    toast({
      title: "Added to Cart",
      description: `${menu.name} has been added to your cart`,
    });
  };

  const handleStoreClick = () => {
    if (menu && menu.sellerId) {
      navigate(`/store/${menu.sellerId}`);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:bg-gray-900">
        <Navbar showCart={true} />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-purple-100 dark:bg-gray-800 rounded w-24"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-purple-100 dark:bg-gray-800 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-purple-100 dark:bg-gray-800 rounded w-3/4"></div>
                <div className="h-4 bg-purple-100 dark:bg-gray-800 rounded w-1/2"></div>
                <div className="h-4 bg-purple-100 dark:bg-gray-800 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!menu) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:bg-gray-900">
      <Navbar showCart={true} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/buyer")}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="order-1 lg:order-1">
            <div className="aspect-square overflow-hidden rounded-xl bg-white shadow-sm border border-purple-100">
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

          {/* Details */}
          <div className="space-y-4 order-2 lg:order-2">
            {/* Title */}
            <h1 className="text-3xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {menu.name}
            </h1>
            {/* Category Badge */}
            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
              {menu.category}
            </Badge>

            {/* Price + Estimasi + Stock */}
            <div className="flex items-center gap-6">
              {/* Harga */}
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {formatPrice(menu.price)}
              </div>

              {/* Estimasi */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {menu.prepTime || "N/A"} min
                </span>
              </div>

              {/* Stok */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {menu.stock || 0} left
                </span>
              </div>
            </div>

            {/* Store */}
            <button
              onClick={handleStoreClick}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-800 transition-colors"
            >
              {/* Foto Toko */}
              <img
                src={
                  menu.storeImage ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    menu.storeName
                  )}&background=random`
                }
                alt={menu.storeName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200"
              />

              {/* Info Toko */}
              <div className="text-left">
                {/* Nama Toko */}
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {menu.storeName}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-2">
                  {renderStars(menu.rating)}
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {menu.rating}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({menu.reviewCount})
                  </span>
                </div>

                {/* Lokasi */}
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-2">
                  <MapPin className="h-3 w-3" />
                  {storeLocation}
                </div>
              </div>
            </button>

            <Separator />

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-purple-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Description
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {menu.description}
              </p>
            </div>

            {/* Add to Cart */}
            <Button
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
              onClick={() => addToCart(menu)}
              disabled={menu.stock === 0}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {menu.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Reviews
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-purple-200 to-transparent"></div>
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white dark:bg-gray-800 border border-purple-100 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-medium">
                        {review.buyerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {review.buyerName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:bg-gray-800 border-2 border-dashed border-purple-200 dark:border-gray-700 rounded-lg p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-purple-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No reviews yet. Be the first to review!
              </p>
            </div>
          )}
        </div>

        {/* More from Store */}
        {showStoreProducts && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                More from {menu.storeName}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-blue-200 to-transparent"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {storeMenus.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/menu/${item.id}`)}
                  className="group text-left"
                >
                  <div className="aspect-square overflow-hidden rounded-lg bg-white border border-purple-100 mb-3 shadow-sm hover:shadow-md transition-shadow">
                    <img
                      src={
                        item.image ||
                        `https://picsum.photos/300/300?random=${item.id}`
                      }
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {formatPrice(item.price)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuDetail;
