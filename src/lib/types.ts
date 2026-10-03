// ---- API response conventions ----

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface CartSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
}

export interface CartValidationError {
  success: false;
  errors: string[];
}

// ---- Entities ----

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt?: string;
}

export interface ProductImage {
  url: string;
  public_id: string;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  images: ProductImage[];
  isPublished: boolean;
  category: Category;
  createdAt?: string;
  updatedAt?: string;
}

// Products list response
export interface ProductsListData {
  count: number;
  products: Product[];
}

// Admin user — explicitly does NOT include password
export interface AdminUser {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  createdAt?: string;
  // password field intentionally omitted — endpoint returns it but we must not retain it
}

// ---- Cart ----

export interface SelectedAttributes {
  [key: string]: string;
}

export interface CartItem {
  _id: string;
  product: {
    _id: string;
    title: string;
    images: ProductImage[];
    price: number;
    stock: number;
  };
  quantity: number;
  price: number;
  selectedAttributes?: SelectedAttributes;
}

export interface Cart {
  _id: string;
  items: CartItem[];
  subtotal: number;
  [key: string]: unknown;
}

// ---- Orders ----

export interface OrderItem {
  product: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  isDefault?: boolean;
  recipientName?: string;
  recipientPhone?: string;
}

export type PaymentStatus = "pending" | "paid" | "failed" | string;
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | string;

export interface Order {
  _id: string;
  items: OrderItem[];
  shippingAddress: Address | null;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Addresses ----

export interface AddressListData {
  userDefaultName: string | null;
  userDefaultPhone: string | null;
  addresses: Address[];
}

// ---- Payments ----

export interface PaystackInitializeData {
  authorizationUrl: string;
  reference: string;
}

// ---- Error type thrown by the API client ----

export class ApiRequestError extends Error {
  status: number;
  errors?: string[];
  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.errors = errors;
  }
}
