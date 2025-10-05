import React, { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Search,
  Filter,
  TrendingUp,
  Store,
  Star,
  Users,
  Package,
  Eye, // Added Eye import
} from "lucide-react";
import { getMenus } from "@/utils/storage";
import { Menu } from "@/types";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Layout/Navbar";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 8;

interface Store {
  storeName: string;
  sellerId: string;
  rating: number;
  totalProducts: number;
  categories: string[];
  reviewCount: number;
  storeImage?: string;
}

const StoreList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [loading, setLoading] = useState(true);
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  // Fetch dan proses data toko dari getMenus
  useEffect(() => {
    setLoading(true);
    const menus = getMenus();
    const storeMap = menus.reduce((acc, menu: Menu) => {
      const { storeName, sellerId, rating, category, reviewCount, storeImage } =
        menu;
      if (!acc[storeName]) {
        acc[storeName] = {
          storeName,
          sellerId,
          ratings: [],
          categories: new Set<string>(),
          reviewCount: 0,
          storeImage: storeImage || undefined,
        };
      }
      acc[storeName].ratings.push(rating);
      acc[storeName].categories.add(category);
      acc[storeName].reviewCount += reviewCount || 0;
      if (storeImage && !acc[storeName].storeImage) {
        acc[storeName].storeImage = storeImage;
      }
      return acc;
    }, {} as Record<string, { storeName: string; sellerId: string; ratings: number[]; categories: Set<string>; reviewCount: number; storeImage?: string }>);

    const storeList: Store[] = Object.values(storeMap).map((store) => ({
      storeName: store.storeName,
      sellerId: store.sellerId,
      rating: store.ratings.length
        ? store.ratings.reduce((sum, r) => sum + r, 0) / store.ratings.length
        : 0,
      totalProducts: store.ratings.length,
      categories: Array.from(store.categories),
      reviewCount: store.reviewCount,
      storeImage: store.storeImage,
    }));

    setStores(storeList);
    setLoading(false);
  }, []);

  // Filter dan sort toko
  useEffect(() => {
    let filtered = stores.filter((store) => {
      const matchesSearch = store.storeName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" ||
        store.categories.includes(selectedCategory);
      return matchesSearch && matchesCategory;
    });

    if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "products") {
      filtered.sort((a, b) => b.totalProducts - a.totalProducts);
    } else if (sortBy === "popular") {
      filtered.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    setFilteredStores(filtered);
    setCurrentPage(1);
  }, [stores, searchTerm, selectedCategory, sortBy]);

  const categories = [
    "all",
    ...Array.from(new Set(stores.flatMap((store) => store.categories))),
  ];
  const totalPages = Math.ceil(filteredStores.length / ITEMS_PER_PAGE);
  const currentStores = filteredStores.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleViewStore = (store: Store) => {
    navigate(`/store/${store.sellerId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-all duration-300">
      <Navbar showCart={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-10 border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-600" />
                <Input
                  placeholder="Cari toko..."
                  className="pl-12 h-12 text-lg border-0 bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 rounded-xl transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full lg:w-56 h-12 border-0 bg-gray-100 dark:bg-gray-700 rounded-xl">
                  <Filter className="h-5 w-5 mr-2 text-purple-600" />
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all"
                        ? "🍽️ Semua Kategori"
                        : `🍴 ${category}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-56 h-12 border-0 bg-gray-100 dark:bg-gray-700 rounded-xl">
                  <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">⭐ Rating Tertinggi</SelectItem>
                  <SelectItem value="products">📦 Produk Terbanyak</SelectItem>
                  <SelectItem value="popular">🔥 Terpopuler</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
              Daftar Toko
            </h3>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-sm py-1 px-3 rounded-full">
              {filteredStores.length} toko
            </Badge>
          </div>
          {searchTerm && (
            <p className="text-gray-600 dark:text-gray-300 text-sm italic">
              Hasil pencarian untuk "{searchTerm}"
            </p>
          )}
        </div>

        {/* Store Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
          {loading
            ? Array.from({ length: isDesktop ? 8 : 4 }).map((_, index) => (
                <Card
                  key={`skeleton-${index}`}
                  className="animate-pulse border-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
                >
                  <CardHeader className="pb-3 flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))
            : currentStores.map((store, index) => (
                <Card
                  key={store.sellerId}
                  className="group overflow-hidden border-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-500 animate-[fadeIn_0.5s_ease-out_forwards]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader
                    className="pb-2 px-5 flex items-center space-x-4 cursor-pointer"
                    onClick={() => handleViewStore(store)}
                  >
                    <img
                      src={
                        store.storeImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          store.storeName
                        )}&background=random&color=fff&size=128`
                      }
                      alt={`Logo ${store.storeName}`}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200 dark:ring-purple-700"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          store.storeName
                        )}&background=random&color=fff&size=128`;
                      }}
                    />
                    <div className="flex-1">
                      <CardTitle className="text-xl font-semibold line-clamp-1 group-hover:text-purple-600 transition-colors duration-300">
                        {store.storeName}
                      </CardTitle>
                      <div className="flex items-center flex-wrap gap-2 mt-1">
                        {store.categories.slice(0, 2).map((category) => (
                          <Badge
                            key={category}
                            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs"
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 px-5 pb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold">
                          {store.rating.toFixed(1)}
                        </span>
                        {store.reviewCount > 0 && (
                          <span className="text-xs text-gray-500">
                            ({store.reviewCount})
                          </span>
                        )}
                      </div>
                      {store.reviewCount > 50 && (
                        <Badge className="bg-red-400 text-white font-semibold rounded-full px-3 py-1">
                          <Users className="h-3 w-3 mr-1" />
                          Populer
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                      <Package className="h-4 w-4 text-purple-500" />
                      <span>{store.totalProducts} produk</span>
                    </div>
                  </CardContent>

                  <div className="px-5 pb-5">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewStore(store);
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full py-2 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Lihat Toko
                    </Button>
                  </div>
                </Card>
              ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredStores.length
                  )}{" "}
                  dari {filteredStores.length} toko
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="rounded-full border-purple-200 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900"
                  >
                    Sebelumnya
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
                        className={`w-10 h-10 rounded-full ${
                          currentPage === page
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                            : "border-purple-200 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900"
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
                    className="rounded-full border-purple-200 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900"
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {filteredStores.length === 0 && !loading && (
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl">
            <CardContent className="text-center py-16">
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Store className="h-16 w-16 text-purple-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-white text-xs font-bold">0</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white tracking-tight">
                {searchTerm
                  ? "Toko Tidak Ditemukan"
                  : "Tidak Ada Toko Tersedia"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto text-lg">
                {searchTerm
                  ? `Tidak ada toko yang cocok dengan pencarian "${searchTerm}". Coba kata kunci lain atau ubah filter.`
                  : "Tidak ada toko yang tersedia saat ini. Coba lagi nanti."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {searchTerm && (
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-full shadow-md hover:shadow-lg"
                  >
                    Reset Pencarian
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 border-purple-200 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900 rounded-full"
                >
                  Muat Ulang
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StoreList;
