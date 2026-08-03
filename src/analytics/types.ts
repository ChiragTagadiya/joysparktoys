export interface ProductLike {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category?: string;
  brand?: string;
  images?: string[];
  stock?: number;
}

export interface CartItemLike extends ProductLike {
  quantity: number;
}

export interface OrderLike {
  id?: string;
  order_number?: string;
  orderId?: string;
  items?: CartItemLike[];
  total?: number;
  subtotal?: number;
  shipping?: number;
  paymentMethod?: string;
  payment_method?: string;
  address?: {
    email?: string;
    phone?: string;
  };
}

export type Currency = 'INR';
