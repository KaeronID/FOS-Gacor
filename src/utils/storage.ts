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
    return data ? JSON.parse(data) : [];
  } catch {
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
export const getUsers = (): User[] => getFromStorage(STORAGE_KEYS.USERS);
export const saveUsers = (users: User[]): void =>
  saveToStorage(STORAGE_KEYS.USERS, users);

export const getCurrentUser = (): User | null => {
  try {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  } catch {
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
export const getStores = (): Store[] => getFromStorage(STORAGE_KEYS.STORES);
export const saveStores = (stores: Store[]): void =>
  saveToStorage(STORAGE_KEYS.STORES, stores);

// Menu management
export const getMenus = (): Menu[] => getFromStorage(STORAGE_KEYS.MENUS);
export const saveMenus = (menus: Menu[]): void =>
  saveToStorage(STORAGE_KEYS.MENUS, menus);

export const getMenuById = (id: string): Menu | null => {
  const menus = getMenus();
  return menus.find((menu: Menu) => menu.id === id) || null;
};

export const getReviewsByMenuId = (menuId: string): Review[] => {
  const reviews = getReviews();
  return reviews.filter((review: Review) => review.menuId === menuId);
};

// Order management
export const getOrders = (): Order[] => getFromStorage(STORAGE_KEYS.ORDERS);
export const saveOrders = (orders: Order[]): void =>
  saveToStorage(STORAGE_KEYS.ORDERS, orders);

// Review management
export const getReviews = (): Review[] => getFromStorage(STORAGE_KEYS.REVIEWS);
export const saveReviews = (reviews: Review[]): void =>
  saveToStorage(STORAGE_KEYS.REVIEWS, reviews);

// Notification management
export const getNotifications = (): Notification[] =>
  getFromStorage(STORAGE_KEYS.NOTIFICATIONS);
export const saveNotifications = (notifications: Notification[]): void =>
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);

// Banner management
export const getBanners = (): Banner[] => getFromStorage(STORAGE_KEYS.BANNERS);
export const saveBanners = (banners: Banner[]): void =>
  saveToStorage(STORAGE_KEYS.BANNERS, banners);

// Ingredient management
export const getIngredients = (): Ingredient[] =>
  getFromStorage(STORAGE_KEYS.INGREDIENTS);
export const saveIngredients = (ingredients: Ingredient[]): void =>
  saveToStorage(STORAGE_KEYS.INGREDIENTS, ingredients);

// Cart management
export const getCart = (): any[] => getFromStorage(STORAGE_KEYS.CART);
export const saveCart = (cart: any[]): void =>
  saveToStorage(STORAGE_KEYS.CART, cart);

// Initialize demo data
export const initializeDemoData = (): void => {
  if (getUsers().length === 0) {
    const demoUsers: User[] = [
      {
        id: "1",
        email: "admin@scu.edu",
        password: "admin123",
        role: "admin",
        name: "Admin SCU",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        email: "seller@example.com",
        password: "seller123",
        role: "seller",
        name: "Warung Berkah",
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        email: "buyer@student.unika.ac.id",
        password: "buyer123",
        role: "buyer",
        name: "John Student",
        createdAt: new Date().toISOString(),
      },
    ];
    saveUsers(demoUsers);

    const demoBanners: Banner[] = [
      {
        id: "1",
        title: "Special Discount 20%",
        description: "Get 20% off on all food items this week!",
        image: "https://picsum.photos/800/200?random=1",
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        title: "New Menu Available",
        description: "Try our delicious new Indonesian cuisine",
        image: "https://picsum.photos/800/200?random=2",
        active: true,
        createdAt: new Date().toISOString(),
      },
    ];
    saveBanners(demoBanners);

    const demoStores: Store[] = [
      {
        id: "1",
        sellerId: "2",
        name: "Warung Berkah",
        image: "https://picsum.photos/400/300?random=10",
        qrisImage: "https://picsum.photos/300/300?random=20",
        createdAt: new Date().toISOString(),
      },
    ];
    saveStores(demoStores);

    const demoIngredients: Ingredient[] = [
      {
        id: "1",
        sellerId: "2",
        name: "Rice",
        stock: 100,
        unit: "kg",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        sellerId: "2",
        name: "Chicken",
        stock: 50,
        unit: "kg",
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        sellerId: "2",
        name: "Vegetables",
        stock: 30,
        unit: "kg",
        createdAt: new Date().toISOString(),
      },
    ];
    saveIngredients(demoIngredients);

    const demoMenus: Menu[] = [
      {
        id: "1",
        sellerId: "2",
        storeName: "Warung Berkah",
        name: "Nasi Ayam Bakar",
        description: "Grilled chicken with steamed rice and vegetables",
        price: 15000,
        image: "https://picsum.photos/400/300?random=30",
        category: "Main Course",
        ingredients: [
          { ingredientId: "1", ingredientName: "Rice", quantity: 0.2 },
          { ingredientId: "2", ingredientName: "Chicken", quantity: 0.3 },
          { ingredientId: "3", ingredientName: "Vegetables", quantity: 0.1 },
        ],
        rating: 4.5,
        reviewCount: 25,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        sellerId: "2",
        storeName: "Warung Berkah",
        name: "Gado-Gado",
        description: "Indonesian salad with peanut sauce",
        price: 12000,
        image: "https://picsum.photos/400/300?random=31",
        category: "Salad",
        ingredients: [
          { ingredientId: "3", ingredientName: "Vegetables", quantity: 0.3 },
        ],
        rating: 4.2,
        reviewCount: 18,
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        sellerId: "2",
        storeName: "Warung Berkah",
        name: "Nasi Gudeg",
        description: "Traditional Javanese curry with rice",
        price: 18000,
        image: "https://picsum.photos/400/300?random=32",
        category: "Main Course",
        ingredients: [
          { ingredientId: "1", ingredientName: "Rice", quantity: 0.25 },
          { ingredientId: "2", ingredientName: "Chicken", quantity: 0.2 },
          { ingredientId: "3", ingredientName: "Vegetables", quantity: 0.2 },
        ],
        rating: 4.8,
        reviewCount: 42,
        createdAt: new Date().toISOString(),
      },
      {
        id: "4",
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
        createdAt: new Date().toISOString(),
      },
    ];
    saveMenus(demoMenus);

    const demoReviews: Review[] = [
      {
        id: "1",
        orderId: "1",
        buyerId: "3",
        buyerName: "John Student",
        menuId: "1",
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
        id: "2",
        orderId: "2",
        buyerId: "3",
        buyerName: "John Student",
        menuId: "3",
        menuName: "Nasi Gudeg",
        sellerId: "2",
        rating: 4,
        comment:
          "Great traditional taste, very authentic. The portion is generous too.",
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
    ];
    saveReviews(demoReviews);
  }
};
