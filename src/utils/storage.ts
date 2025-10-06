import {
  User,
  Store,
  Menu,
  Order,
  Review,
  Notification,
  Banner,
  Ingredient,
} from "@/types";

// Storage keys
const STORAGE_KEYS = {
  USERS: "scu_fos_users",
  STORES: "scu_fos_stores",
  MENUS: "scu_fos_menus",
  ORDERS: "scu_fos_orders",
  REVIEWS: "scu_fos_reviews",
  NOTIFICATIONS: "scu_fos_notifications",
  BANNERS: "scu_fos_banners",
  INGREDIENTS: "scu_fos_ingredients",
  CURRENT_USER: "scu_fos_current_user",
  CART: "scu_fos_cart",
} as const;

// Generic storage functions
export const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as T[]) : [];
  } catch (error) {
    console.error(`Failed to parse storage key ${key}:`, error);
    return [];
  }
};

export const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to storage:", error);
  }
};

// User management
export const getUsers = (): User[] => getFromStorage<User>(STORAGE_KEYS.USERS);
export const saveUsers = (users: User[]): void =>
  saveToStorage<User>(STORAGE_KEYS.USERS, users);

export const getCurrentUser = (): User | null => {
  try {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? (JSON.parse(user) as User) : null;
  } catch (error) {
    console.error("Failed to parse current user:", error);
    return null;
  }
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Store management
export const getStores = (): Store[] =>
  getFromStorage<Store>(STORAGE_KEYS.STORES);
export const saveStores = (stores: Store[]): void =>
  saveToStorage<Store>(STORAGE_KEYS.STORES, stores);

// Menu management
export const getMenus = (): Menu[] => getFromStorage<Menu>(STORAGE_KEYS.MENUS);
export const saveMenus = (menus: Menu[]): void =>
  saveToStorage<Menu>(STORAGE_KEYS.MENUS, menus);

export const getMenuById = (id: string): Menu | null => {
  const menus = getMenus();
  return menus.find((menu: Menu) => menu.id === id) || null;
};

export const getReviewsByMenuId = (menuId: string): Review[] => {
  const reviews = getReviews();
  return reviews.filter((review: Review) => review.menuId === menuId);
};

// Order management
export const getOrders = (): Order[] =>
  getFromStorage<Order>(STORAGE_KEYS.ORDERS);
export const saveOrders = (orders: Order[]): void =>
  saveToStorage<Order>(STORAGE_KEYS.ORDERS, orders);

// Review management
export const getReviews = (): Review[] =>
  getFromStorage<Review>(STORAGE_KEYS.REVIEWS);
export const saveReviews = (reviews: Review[]): void =>
  saveToStorage<Review>(STORAGE_KEYS.REVIEWS, reviews);

// Notification management
export const getNotifications = (): Notification[] =>
  getFromStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS);
export const saveNotifications = (notifications: Notification[]): void =>
  saveToStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS, notifications);

// Banner management
export const getBanners = (): Banner[] =>
  getFromStorage<Banner>(STORAGE_KEYS.BANNERS);
export const saveBanners = (banners: Banner[]): void =>
  saveToStorage<Banner>(STORAGE_KEYS.BANNERS, banners);

// Ingredient management
export const getIngredients = (): Ingredient[] =>
  getFromStorage<Ingredient>(STORAGE_KEYS.INGREDIENTS);
export const saveIngredients = (ingredients: Ingredient[]): void =>
  saveToStorage<Ingredient>(STORAGE_KEYS.INGREDIENTS, ingredients);

// Cart management
export const getCart = (): any[] => getFromStorage<any>(STORAGE_KEYS.CART);
export const saveCart = (cart: any[]): void =>
  saveToStorage<any>(STORAGE_KEYS.CART, cart);

// Helper: simple id generator (keeps deterministic sample ids)
const nowIso = () => new Date().toISOString();

// Initialize demo data
export const initializeDemoData = (): void => {
  // Only initialize if no users exist to avoid overwriting existing localStorage
  if (getUsers().length === 0) {
    // Users (admin + several sellers + buyers)
    const demoUsers: User[] = [
      {
        id: "1",
        email: "admin@scu.edu",
        password: "admin123",
        role: "admin",
        name: "Admin SCU",
        createdAt: nowIso(),
      },
      // Sellers
      {
        id: "2",
        email: "seller1@warung.com",
        password: "seller123",
        role: "seller",
        name: "Warung Berkah Owner",
        createdAt: nowIso(),
      },
      {
        id: "3",
        email: "seller2@kantin.com",
        password: "seller123",
        role: "seller",
        name: "Kantin Sehat Owner",
        createdAt: nowIso(),
      },
      {
        id: "4",
        email: "seller3@dapur.com",
        password: "seller123",
        role: "seller",
        name: "Dapur Nusantara Owner",
        createdAt: nowIso(),
      },
      // Buyers
      {
        id: "5",
        email: "buyer1@student.unika.ac.id",
        password: "buyer123",
        role: "buyer",
        name: "John Student",
        createdAt: nowIso(),
      },
      {
        id: "6",
        email: "buyer2@student.unika.ac.id",
        password: "buyer123",
        role: "buyer",
        name: "Siti Mahasiswa",
        createdAt: nowIso(),
      },
    ];
    saveUsers(demoUsers);

    // Banners
    const demoBanners: Banner[] = [
      {
        id: "b1",
        title: "Special Discount 20%",
        description: "Get 20% off on all food items this week!",
        image: "https://picsum.photos/800/200?random=1",
        active: true,
        createdAt: nowIso(),
      },
      {
        id: "b2",
        title: "New Menu Available",
        description: "Try our delicious new Indonesian cuisine",
        image: "https://picsum.photos/800/200?random=2",
        active: true,
        createdAt: nowIso(),
      },
      {
        id: "b3",
        title: "Breakfast Promo",
        description: "Buy 1 get 1 for selected breakfast menu",
        image: "https://picsum.photos/800/200?random=3",
        active: true,
        createdAt: nowIso(),
      },
    ];
    saveBanners(demoBanners);

    // Stores
    const demoStores: Store[] = [
      {
        id: "s1",
        sellerId: "2",
        name: "Warung Berkah",
        image: "https://picsum.photos/400/300?random=10",
        qrisImage: "https://picsum.photos/300/300?random=20",
        createdAt: nowIso(),
      },
      {
        id: "s2",
        sellerId: "3",
        name: "Kantin Sehat",
        image: "https://picsum.photos/400/300?random=11",
        qrisImage: "https://picsum.photos/300/300?random=21",
        createdAt: nowIso(),
      },
      {
        id: "s3",
        sellerId: "4",
        name: "Dapur Nusantara",
        image: "https://picsum.photos/400/300?random=12",
        qrisImage: "https://picsum.photos/300/300?random=22",
        createdAt: nowIso(),
      },
    ];
    saveStores(demoStores);

    // Ingredients
    const demoIngredients: Ingredient[] = [
      { id: "ing1", sellerId: "2", name: "Rice", stock: 200, unit: "kg", createdAt: nowIso() },
      { id: "ing2", sellerId: "2", name: "Chicken", stock: 120, unit: "kg", createdAt: nowIso() },
      { id: "ing3", sellerId: "2", name: "Vegetables", stock: 90, unit: "kg", createdAt: nowIso() },
      { id: "ing4", sellerId: "3", name: "Tofu", stock: 60, unit: "kg", createdAt: nowIso() },
      { id: "ing5", sellerId: "3", name: "Noodles", stock: 80, unit: "pack", createdAt: nowIso() },
      { id: "ing6", sellerId: "4", name: "Beef", stock: 50, unit: "kg", createdAt: nowIso() },
      { id: "ing7", sellerId: "4", name: "Coconut Milk", stock: 40, unit: "liter", createdAt: nowIso() },
    ];
    saveIngredients(demoIngredients);

    // Menus (several per store)
    const demoMenus: Menu[] = [
      // Warung Berkah (s1)
      {
        id: "m1",
        sellerId: "2",
        storeName: "Warung Berkah",
        name: "Nasi Ayam Bakar",
        description: "Grilled chicken with steamed rice and vegetables",
        price: 15000,
        image: "https://picsum.photos/400/300?random=30",
        category: "Main Course",
        ingredients: [
          { ingredientId: "ing1", ingredientName: "Rice", quantity: 0.2 },
          { ingredientId: "ing2", ingredientName: "Chicken", quantity: 0.3 },
          { ingredientId: "ing3", ingredientName: "Vegetables", quantity: 0.1 },
        ],
        rating: 4.5,
        reviewCount: 25,
        createdAt: nowIso(),
      },
      {
        id: "m2",
        sellerId: "2",
        storeName: "Warung Berkah",
        name: "Gado-Gado",
        description: "Indonesian salad with peanut sauce",
        price: 12000,
        image: "https://picsum.photos/400/300?random=31",
        category: "Salad",
        ingredients: [{ ingredientId: "ing3", ingredientName: "Vegetables", quantity: 0.3 }],
        rating: 4.2,
        reviewCount: 18,
        createdAt: nowIso(),
      },
      {
        id: "m3",
        sellerId: "2",
        storeName: "Warung Berkah",
        name: "Nasi Gudeg",
        description: "Traditional Javanese curry with rice",
        price: 18000,
        image: "https://picsum.photos/400/300?random=32",
        category: "Main Course",
        ingredients: [
          { ingredientId: "ing1", ingredientName: "Rice", quantity: 0.25 },
          { ingredientId: "ing7", ingredientName: "Coconut Milk", quantity: 0.1 },
        ],
        rating: 4.8,
        reviewCount: 42,
        createdAt: nowIso(),
      },
      {
        id: "m4",
        sellerId: "2",
        storeName: "Warung Berkah",
        name: "Es Teh Manis",
        description: "Sweet iced tea, perfect refreshment",
        price: 5000,
        image: "https://picsum.photos/400/300?random=33",
        category: "Beverages",
        ingredients: [],
        rating: 4.0,
        reviewCount: 15,
        createdAt: nowIso(),
      },

      // Kantin Sehat (s2)
      {
        id: "m11",
        sellerId: "3",
        storeName: "Kantin Sehat",
        name: "Salad Quinoa",
        description: "Healthy quinoa salad with veggies and nuts",
        price: 22000,
        image: "https://picsum.photos/400/300?random=40",
        category: "Healthy",
        ingredients: [{ ingredientId: "ing3", ingredientName: "Vegetables", quantity: 0.2 }],
        rating: 4.6,
        reviewCount: 10,
        createdAt: nowIso(),
      },
      {
        id: "m12",
        sellerId: "3",
        storeName: "Kantin Sehat",
        name: "Tumis Tahu & Sayur",
        description: "Stir fried tofu with mixed vegetables",
        price: 14000,
        image: "https://picsum.photos/400/300?random=41",
        category: "Main Course",
        ingredients: [
          { ingredientId: "ing4", ingredientName: "Tofu", quantity: 0.2 },
          { ingredientId: "ing3", ingredientName: "Vegetables", quantity: 0.2 },
        ],
        rating: 4.4,
        reviewCount: 8,
        createdAt: nowIso(),
      },
      {
        id: "m13",
        sellerId: "3",
        storeName: "Kantin Sehat",
        name: "Mie Sehat Gandum",
        description: "Whole wheat noodles with light broth",
        price: 13000,
        image: "https://picsum.photos/400/300?random=42",
        category: "Main Course",
        ingredients: [{ ingredientId: "ing5", ingredientName: "Noodles", quantity: 1 }],
        rating: 4.1,
        reviewCount: 7,
        createdAt: nowIso(),
      },

      // Dapur Nusantara (s3)
      {
        id: "m21",
        sellerId: "4",
        storeName: "Dapur Nusantara",
        name: "Rendang Daging",
        description: "Spicy and rich Minang rendang with steamed rice",
        price: 25000,
        image: "https://picsum.photos/400/300?random=50",
        category: "Main Course",
        ingredients: [
          { ingredientId: "ing6", ingredientName: "Beef", quantity: 0.3 },
          { ingredientId: "ing7", ingredientName: "Coconut Milk", quantity: 0.15 },
        ],
        rating: 4.9,
        reviewCount: 60,
        createdAt: nowIso(),
      },
      {
        id: "m22",
        sellerId: "4",
        storeName: "Dapur Nusantara",
        name: "Soto Ayam",
        description: "Classic Indonesian chicken soup with rice",
        price: 17000,
        image: "https://picsum.photos/400/300?random=51",
        category: "Soup",
        ingredients: [
          { ingredientId: "ing2", ingredientName: "Chicken", quantity: 0.25 },
          { ingredientId: "ing1", ingredientName: "Rice", quantity: 0.15 },
        ],
        rating: 4.7,
        reviewCount: 33,
        createdAt: nowIso(),
      },
      {
        id: "m23",
        sellerId: "4",
        storeName: "Dapur Nusantara",
        name: "Pisang Goreng",
        description: "Crispy fried banana, perfect snack",
        price: 8000,
        image: "https://picsum.photos/400/300?random=52",
        category: "Snack",
        ingredients: [],
        rating: 4.3,
        reviewCount: 20,
        createdAt: nowIso(),
      },
    ];
    saveMenus(demoMenus);

    // Reviews
    const demoReviews: Review[] = [
      {
        id: "r1",
        orderId: "o1",
        buyerId: "5",
        buyerName: "John Student",
        menuId: "m1",
        menuName: "Nasi Ayam Bakar",
        sellerId: "2",
        rating: 5,
        comment:
          "Excellent grilled chicken! The seasoning is perfect and the rice is fluffy. Will order again!",
        sellerResponse:
          "Thank you for your kind review! We appreciate your feedback.",
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        respondedAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      },
      {
        id: "r2",
        orderId: "o2",
        buyerId: "6",
        buyerName: "Siti Mahasiswa",
        menuId: "m21",
        menuName: "Rendang Daging",
        sellerId: "4",
        rating: 5,
        comment: "Rendang is flavorful and tender. Highly recommended!",
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
      {
        id: "r3",
        orderId: "o3",
        buyerId: "5",
        buyerName: "John Student",
        menuId: "m12",
        menuName: "Tumis Tahu & Sayur",
        sellerId: "3",
        rating: 4,
        comment: "Light and healthy. Portion could be a bit bigger.",
        createdAt: nowIso(),
      },
    ];
    saveReviews(demoReviews);

    // Orders
    const demoOrders: Order[] = [
      {
        id: "o1",
        buyerId: "5",
        buyerName: "John Student",
        sellerId: "2",
        storeId: "s1",
        items: [
          { menuId: "m1", name: "Nasi Ayam Bakar", price: 15000, qty: 1 },
          { menuId: "m4", name: "Es Teh Manis", price: 5000, qty: 1 },
        ],
        total: 20000,
        status: "delivered",
        createdAt: new Date(Date.now() - 90000000).toISOString(), // ~25 hours ago
        updatedAt: new Date(Date.now() - 80000000).toISOString(),
      },
      {
        id: "o2",
        buyerId: "6",
        buyerName: "Siti Mahasiswa",
        sellerId: "4",
        storeId: "s3",
        items: [
          { menuId: "m21", name: "Rendang Daging", price: 25000, qty: 1 },
        ],
        total: 25000,
        status: "completed",
        createdAt: new Date(Date.now() - 180000000).toISOString(), // ~2 days ago
        updatedAt: new Date(Date.now() - 170000000).toISOString(),
      },
      {
        id: "o3",
        buyerId: "5",
        buyerName: "John Student",
        sellerId: "3",
        storeId: "s2",
        items: [{ menuId: "m12", name: "Tumis Tahu & Sayur", price: 14000, qty: 1 }],
        total: 14000,
        status: "preparing",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ];
    saveOrders(demoOrders);

    // Notifications
    const demoNotifications: Notification[] = [
      {
        id: "n1",
        userId: "5",
        title: "Order #o1 Delivered",
        message: "Your order Nasi Ayam Bakar has been delivered. Enjoy your meal!",
        read: false,
        createdAt: new Date(Date.now() - 86000000).toISOString(),
      },
      {
        id: "n2",
        userId: "2",
        title: "New Order #o3",
        message: "You have a new order pending at Kantin Sehat.",
        read: false,
        createdAt: nowIso(),
      },
    ];
    saveNotifications(demoNotifications);

    // Optionally, save an empty cart
    saveCart([]);

    // All data saved
    console.info("Demo data initialized: users, stores, menus, ingredients, reviews, orders, notifications, banners.");
  } else {
    console.info("Demo data already present; initialization skipped.");
  }
};
