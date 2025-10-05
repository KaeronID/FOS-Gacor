import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Layout/Navbar";
import { getMenus, getStores } from "@/utils/storage";
import { Menu } from "@/types";
import { ArrowLeft, Star, MapPin, Package, Clock, Store } from "lucide-react";

const StoreDetail: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<Menu[]>([]);

  useEffect(() => {
    if (!sellerId) return;

    const storeData = getStores().find((s) => s.sellerId === sellerId);
    const menuData = getMenus().filter((m) => m.sellerId === sellerId);

    setStore(storeData || { storeName: "Unknown Store" });
    setProducts(menuData);
  }, [sellerId]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const calculateAverageRating = () => {
    if (products.length === 0) return 0;
    const total = products.reduce((sum, item) => sum + (item.rating || 0), 0);
    return (total / products.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:bg-gray-900">
      <Navbar showCart={true} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Store Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 mb-8 border border-purple-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-start gap-6">
            {/* Store Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center shadow-lg ring-4 ring-purple-100 dark:ring-purple-900">
                {store?.storeImage ? (
                  <img
                    src={store.storeImage}
                    alt={store.storeName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Store className="h-12 w-12 text-white" />
                )}
              </div>
            </div>

            {/* Store Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {store?.storeName}
              </h1>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">
                  {store?.location || "Location not available"}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {calculateAverageRating()}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Average Rating
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {products.length}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Products
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              All Products
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-purple-200 to-transparent"></div>
          </div>

          {products.length === 0 ? (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:bg-gray-800 border-2 border-dashed border-purple-200 dark:border-gray-700 rounded-lg p-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-3 text-purple-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No products available yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/menu/${item.id}`)}
                  className="group text-left"
                >
                  <Card className="overflow-hidden border border-purple-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={
                          item.image ||
                          `https://picsum.photos/400/300?random=${item.id}`
                        }
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Category Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      {/* Rating Badge */}
                      <div className="absolute bottom-3 left-3">
                        <div className="flex items-center gap-1 bg-white/95 dark:bg-gray-800/95 px-2 py-1 rounded-full">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium text-gray-900 dark:text-white">
                            {item.rating || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-5">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
                        {formatPrice(item.price)}
                      </p>

                      {/* Additional Info */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        {item.prepTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.prepTime}m</span>
                          </div>
                        )}
                        {item.stock !== undefined && (
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            <span>{item.stock} left</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreDetail;
