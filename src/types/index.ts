export interface User {
  id: string;
  email: string;
  password: string;
  role: 'buyer' | 'seller' | 'admin';
  name: string;
  profileImage?: string;
  createdAt: string;
  status?: 'active' | 'inactive';
}

export interface Store {
  id: string;
  sellerId: string;
  name: string;
  image?: string;
  qrisImage?: string;
  createdAt: string;
}

export interface Ingredient {
  id: string;
  sellerId: string;
  name: string;
  stock: number;
  unit: string;
  createdAt: string;
}

export interface Menu {
  id: string;
  sellerId: string;
  storeName: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  ingredients: Array<{
    ingredientId: string;
    ingredientName: string;
    quantity: number;
  }>;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface CartItem {
  menuId: string;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  storeName: string;
  items: Array<{
    menuId: string;
    menuName: string;
    price: number;
    quantity: number;
    notes?: string;
  }>;
  totalAmount: number;
  paymentMethod: 'cash' | 'qris';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  estimatedTime?: number;
  createdAt: string;
  completedAt?: string;
}

export interface Review {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  menuId: string;
  menuName: string;
  sellerId: string;
  rating: number;
  comment: string;
  sellerResponse?: string;
  createdAt: string;
  respondedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'review' | 'general';
  read: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  description: string;
  image: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  startDate?: string;
  endDate?: string;
}