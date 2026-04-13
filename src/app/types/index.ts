
export type DeliveryStatus = 'Pending' | 'Picked Up' | 'Delivered';

export type Vendor = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  area_tag: string;
  rating: number;
  images: string[];
  owner_currency: 'PKR' | 'INR';
  commission_rate: number; // e.g. 0.15 for 15%
};

export type DealCategory = 'Bridal' | 'Hair' | 'Skin';

export type Deal = {
  id: string;
  vendor_id: string;
  name: string;
  category: DealCategory;
  base_price: number;
  discount_price: number;
  deposit_percent: number; // e.g. 10 for 10%
  is_offpeak_active: boolean;
  expiry_date: string;
  upsell_product_id?: string;
};

export type Product = {
  id: string;
  vendor_id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  image: string;
};

export type CartItem = {
  id: string;
  type: 'deal' | 'product';
  name: string;
  price: number; // Upfront price (deposit for deals, full for products)
  full_price?: number;
  quantity: number;
  image?: string;
  vendor_id?: string;
};

export type Booking = {
  id: string;
  localUserId: string;
  vendor_id: string;
  user_phone: string;
  referenceCode: string;
  cartItems: CartItem[];
  total_price: number; // Total amount paid at checkout
  platform_commission: number; // 15% of checkout price
  currency: string;
  qr_verified: boolean;
  deliveryStatus: DeliveryStatus;
  createdAt: string;
  paymentStatus: string;
  group_size: number;
  arrival_time?: string;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
};

export type Conversation = {
  id: string;
  participantId: string;
  participantName: string;
  participantImage?: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
};
