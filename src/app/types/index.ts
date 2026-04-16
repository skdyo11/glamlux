
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
  commission_rate: number;
  description?: string;
};

export type DealCategory = 'Bridal' | 'Hair' | 'Skin';

export type Deal = {
  id: string;
  vendor_id: string;
  name: string;
  category: DealCategory;
  base_price: number;
  discount_price: number;
  deposit_percent: number;
  is_offpeak_active: boolean;
  expiry_date: string;
  upsell_product_id?: string;
  currency: 'PKR' | 'INR';
};

export type Product = {
  id: string;
  vendor_id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  image: string;
  currency: 'PKR' | 'INR';
  weightKg?: number;
};

export type CartItem = {
  id: string;
  type: 'deal' | 'product';
  name: string;
  price: number;
  full_price?: number;
  quantity: number;
  image?: string;
  vendor_id?: string;
};

export type Booking = {
  id: string;
  localUserId: string;
  vendorId?: string;
  userPhone: string;
  referenceCode: string;
  cartItems: CartItem[];
  totalPrice: number;
  shippingCost?: number;
  currency: string;
  qrVerified: boolean;
  deliveryStatus: DeliveryStatus;
  createdAt: string;
  paymentStatus: string;
  groupSize: number;
  inspirationImageUrl?: string | null;
  arrival_time?: string;
};

export type Review = {
  id: string;
  bookingId?: string;
  targetId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: string;
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
