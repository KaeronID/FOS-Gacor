import React, { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardFooter,
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
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Star,
  ShoppingCart,
  Search,
  Filter,
  Plus,
  Minus,
  Heart,
  Clock,
  Flame,
  Store,
  TrendingUp,
  MapPin,
  Users,
  Eye,
} from "lucide-react";
import { getBanners, getMenus, getCart, saveCart } from "@/utils/storage";
import { Menu, Banner } from "@/types";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Layout/Navbar";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 8;

const BuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating-store");
  const [cart, setCart] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loadingItems, setLoadingItems] = useState<string[]>([]);
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  // Real-time cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      if (user) {
        const updatedCart = getCart().filter(
          (item: any) => item.buyerId === user.id
        );
        setCart(updatedCart);
      }
    };

    // Initial load
    setBanners(getBanners().filter((b) => b.active));
    setMenus(getMenus());
    if (user) {
      handleCartUpdate();
    }

    // Listen for cart updates
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [user]);

  // Fungsi helper untuk filter max 4 produk per toko
  const filterTopProductsPerStore = (products: Menu[], maxPerStore: number) => {
    // Group per storeName
    const groupedByStore = products.reduce((acc, product) => {
      if (!acc[product.storeName]) {
        acc[product.storeName] = [];
      }
      acc[product.storeName].push(product);
      return acc;
    }, {} as Record<string, Menu[]>);

    // Sort per toko berdasarkan likes, lalu rating, ambil maxPerStore
    const filteredProducts: Menu[] = [];
    Object.values(groupedByStore).forEach((storeProducts) => {
      storeProducts.sort((a, b) => {
        const likesA = a.likes || a.reviewCount || 0; // Fallback ke reviewCount jika likes tidak ada
        const likesB = b.likes || b.reviewCount || 0;
        if (likesA !== likesB) return likesB - likesA; // Prioritas likes
        return b.rating - a.rating; // Jika likes sama, sort by rating
      });
      filteredProducts.push(...storeProducts.slice(0, maxPerStore));
    });

    // Sort global berdasarkan likes, lalu rating
    filteredProducts.sort((a, b) => {
      const likesA = a.likes || a.reviewCount || 0;
      const likesB = b.likes || b.reviewCount || 0;
      if (likesA !== likesB) return likesB - likesA;
      return b.rating - a.rating;
    });

    return filteredProducts;
  };

  useEffect(() => {
    // Apply filters dan sorting
    let filtered = menus.filter((menu) => {
      const matchesSearch =
        menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        menu.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        menu.storeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || menu.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sorting dan limit per toko
    if (sortBy === "rating-store") {
      // Di desktop, batasi 4 per toko; di mobile, batasi 2
      filtered = filterTopProductsPerStore(filtered, isDesktop ? 4 : 2);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "popular") {
      filtered.sort((a, b) => {
        const likesA = a.likes || a.reviewCount || 0;
        const likesB = b.likes || b.reviewCount || 0;
        if (likesA !== likesB) return likesB - likesA;
        return b.rating - a.rating;
      });
    }

    setFilteredMenus(filtered);
    setCurrentPage(1);
  }, [menus, searchTerm, selectedCategory, sortBy, isDesktop]);

  const categories = [
    "all",
    ...Array.from(new Set(menus.map((menu) => menu.category))),
  ];
  const totalPages = Math.ceil(filteredMenus.length / ITEMS_PER_PAGE);
  const currentMenus = filteredMenus.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getCartQuantity = (menuId: string) => {
    const cartItem = cart.find((item) => item.menuId === menuId);
    return cartItem ? cartItem.quantity : 0;
  };

  const updateCartQuantity = (menu: Menu, newQuantity: number) => {
    if (!user) {
      toast({
        title: "🔐 Login Required",
        description: "Please login first to add items to cart",
        variant: "destructive",
      });
      return;
    }

    if (newQuantity > (menu.stock || 0)) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${menu.stock} items available`,
        variant: "destructive",
      });
      return;
    }

    setLoadingItems((prev) => [...prev, menu.id]);

    setTimeout(() => {
      const existingCart = getCart();
      const userCartItems = existingCart.filter(
        (item: any) => item.buyerId === user.id
      );
      const otherUsersItems = existingCart.filter(
        (item: any) => item.buyerId !== user.id
      );

      if (newQuantity <= 0) {
        // Remove item
        const updatedUserItems = userCartItems.filter(
          (item) => item.menuId !== menu.id
        );
        const newCart = [...otherUsersItems, ...updatedUserItems];
        setCart(updatedUserItems);
        saveCart(newCart);

        toast({
          title: "🗑️ Item Removed",
          description: `${menu.name} removed from cart`,
        });
      } else {
        // Add or update item
        const existingItemIndex = userCartItems.findIndex(
          (item) => item.menuId === menu.id
        );

        let updatedUserItems;
        if (existingItemIndex >= 0) {
          updatedUserItems = userCartItems.map((item) =>
            item.menuId === menu.id ? { ...item, quantity: newQuantity } : item
          );
        } else {
          const newItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            menuId: menu.id,
            menuName: menu.name,
            price: menu.price,
            quantity: newQuantity,
            image:
              menu.image || `https://picsum.photos/400/300?random=${menu.id}`,
            storeName: menu.storeName,
            sellerId: menu.sellerId,
            buyerId: user.id,
          };
          updatedUserItems = [...userCartItems, newItem];
        }

        const newCart = [...otherUsersItems, ...updatedUserItems];
        setCart(updatedUserItems);
        saveCart(newCart);

        toast({
          title: "🛒 Added to Cart",
          description: `${menu.name} - ${newQuantity} item(s)`,
        });
      }

      // Trigger cart update event
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      setLoadingItems((prev) => prev.filter((id) => id !== menu.id));
    }, 300);
  };

  const toggleFavorite = (menuId: string) => {
    setFavorites((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );

    toast({
      title: favorites.includes(menuId)
        ? "💔 Removed from Favorites"
        : "❤️ Added to Favorites",
      description: "Menu updated successfully",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleViewDetail = (menu: Menu) => {
    navigate(`/menu/${menu.id}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-all duration-300">
      <Navbar showCart={true} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Enhanced Banner Carousel */}
        {banners.length > 0 && (
          <div className="mb-10">
            <Carousel className="w-full">
              <CarouselContent>
                {banners.map((banner) => (
                  <CarouselItem key={banner.id}>
                    <Card className="border-0 overflow-hidden shadow-2xl">
                      <div
                        className="h-64 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white relative overflow-hidden"
                        style={{
                          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${banner.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        <div className="text-center z-10 max-w-4xl px-6">
                          <h2 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                            {banner.title}
                          </h2>
                          <p className="text-xl md:text-2xl opacity-95 drop-shadow-md">
                            {banner.description}
                          </p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
                      </div>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4 bg-white/80 hover:bg-white" />
              <CarouselNext className="right-4 bg-white/80 hover:bg-white" />
            </Carousel>
          </div>
        )}

        {/* Enhanced Search and Filters */}
        <Card className="mb-8 border-0 shadow-lg bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-600" />
                <Input
                  placeholder="Search menus, stores, or categories..."
                  className="pl-12 h-12 text-lg border-0 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full lg:w-56 h-12 border-0 bg-gray-50 dark:bg-gray-700">
                  <Filter className="h-5 w-5 mr-2 text-purple-600" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all"
                        ? "🍽️ All Categories"
                        : `🍴 ${category}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-56 h-12 border-0 bg-gray-50 dark:bg-gray-700">
                  <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating-store">
                    ⭐ Best Rating & Variety
                  </SelectItem>
                  <SelectItem value="rating">⭐ Highest Rating</SelectItem>
                  <SelectItem value="popular">🔥 Most Popular</SelectItem>
                  <SelectItem value="price-low">
                    💰 Price: Low - High
                  </SelectItem>
                  <SelectItem value="price-high">
                    💰 Price: High - Low
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              Available Menus
            </h3>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {filteredMenus.length} items
            </Badge>
          </div>
          {searchTerm && (
            <p className="text-gray-600 dark:text-gray-300">
              Search results for "{searchTerm}"
            </p>
          )}
        </div>

        {/* Enhanced Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {currentMenus.map((menu) => {
            const cartQuantity = getCartQuantity(menu.id);
            const isLoading = loadingItems.includes(menu.id);
            const isFavorite = favorites.includes(menu.id);
            const stock = menu.stock || 0;

            return (
              <Card
                key={menu.id}
                className="group overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 bg-white dark:bg-gray-800 transform hover:-translate-y-2"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={
                      menu.image ||
                      "https://picsum.photos/400/300?random=" + menu.id
                    }
                    alt={menu.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Overlay with badges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="absolute bottom-4 left-4">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(menu);
                        }}
                        className="bg-white/90 text-gray-800 hover:bg-white"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        More Details
                      </Button>
                    </div>
                  </div>

                  {/* Top badges */}
                  <div className="absolute top-3 left-3 flex flex-col space-y-2">
                    {menu.rating >= 4.5 && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1" />
                        Best
                      </Badge>
                    )}
                    {(menu.reviewCount || 0) > 50 && (
                      <Badge className="bg-red-100 text-red-800">
                        <Flame className="h-3 w-3 mr-1" />
                        Hot
                      </Badge>
                    )}
                  </div>

                  {/* Favorite button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-3 right-3 w-8 h-8 p-0 bg-white/80 hover:bg-white rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(menu.id);
                    }}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        isFavorite
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600"
                      }`}
                    />
                  </Button>
                </div>

                <CardHeader
                  className="pb-3"
                  onClick={() => handleViewDetail(menu)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-1 group-hover:text-purple-600 transition-colors">
                        {menu.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Store className="h-3 w-3 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {menu.storeName}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="ml-2 shrink-0 bg-blue-100 text-blue-800"
                    >
                      {menu.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent
                  className="pt-0 pb-3 cursor-pointer"
                  onClick={() => handleViewDetail(menu)}
                >
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                    {menu.description}
                  </p>

                  {/* Rating and review */}
                  <div className="flex items-center space-x-3 mb-1">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold">{menu.rating}</span>
                      <span className="text-xs text-gray-500">
                        ({menu.reviewCount || 0})
                      </span>
                    </div>
                    {menu.reviewCount && menu.reviewCount > 20 && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <span className="block text-lg font-bold text-purple-600 mb-2">
                    {formatPrice(menu.price)}
                  </span>

                  {/* Stock */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Stock: {stock}
                  </p>

                  {/* Estimated time */}
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{menu.prepTime || "N/A"} minutes</span>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  {cartQuantity > 0 ? (
                    <div className="w-full">
                      {/* Quantity controls */}
                      <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 rounded-xl p-2 mb-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCartQuantity(menu, cartQuantity - 1);
                          }}
                          disabled={isLoading}
                          className="h-8 w-8 p-0 hover:bg-red-100 text-red-600 rounded-full"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center space-x-2">
                          <ShoppingCart className="h-4 w-4 text-purple-600" />
                          <span className="font-bold text-lg">
                            {cartQuantity}
                          </span>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCartQuantity(menu, cartQuantity + 1);
                          }}
                          disabled={isLoading}
                          className="h-8 w-8 p-0 hover:bg-green-100 text-green-600 rounded-full"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Total price */}
                      <div className="text-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Total:{" "}
                        </span>
                        <span className="font-bold text-purple-600">
                          {formatPrice(menu.price * cartQuantity)}
                        </span>
                      </div>
                    </div>
                  ) : stock > 0 ? (
                    <Button
                      className="w-full bg-gradient-to-r from-purple-800 to-purple-900 hover:from-purple-900 hover:to-purple-950 text-white font-semibold h-12 shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCartQuantity(menu, 1);
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Adding...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Plus className="h-4 w-4" />
                          <span>Add to Cart</span>
                        </div>
                      )}
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-gray-300 text-gray-600 cursor-not-allowed h-12"
                      disabled
                    >
                      Out of Stock
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredMenus.length)}{" "}
                  of {filteredMenus.length} menus
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="hover:bg-purple-50 dark:hover:bg-purple-950"
                  >
                    Previous
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 ${
                          currentPage === page
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "hover:bg-purple-50 dark:hover:bg-purple-950"
                        }`}
                      >
                        {page}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="hover:bg-purple-50 dark:hover:bg-purple-950"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Empty State */}
        {filteredMenus.length === 0 && (
          <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800">
            <CardContent className="text-center py-16">
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-100 to-yellow-100 dark:from-blue-900 dark:to-yellow-900 rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-16 w-16 text-purple-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white text-xs font-bold">0</span>
                </div>
              </div>

              <h3 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
                {searchTerm ? "No Menus Found" : "No Menus Available"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto text-lg">
                {searchTerm
                  ? `No menus match your search for "${searchTerm}". Try different keywords or change filters.`
                  : "No menus available right now. Please try again later."}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {searchTerm && (
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3"
                  >
                    Reset Search
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Custom Scrollbar and Loading Styles */}
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

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default BuyerDashboard;
