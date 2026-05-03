
export type DeliveryStatus = 'Pending' | 'Picked Up' | 'Delivered';

export type Vendor = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  area_tag: string;
  address?: string;
  rating: number;
  images: string[];
  owner_currency: 'PKR' | 'INR';
  commission_rate: number;
  description?: string;
  slug?: string;
  myImage?: string;
  myCover?: string;
};

export type DealCategory = 'Bridal' | 'Hair' | 'Skin';

export type Deal = {
  id: string;
  parlourId: string;
  parlourOwnerId: string;
  name: string;
  category: DealCategory;
  basePrice: number;
  discountPrice: number;
  depositPercent: number;
  expiryDate?: string;
  upsellProductId?: string;
  currency: 'PKR' | 'INR';
  isDummy?: boolean;
};

export type Product = {
  id: string;
  vendorId: string;
  name: string;
  brand: string;
  basePrice?: number;
  price: number;
  stockCount: number;
  imageUrl: string;
  currency: 'PKR' | 'INR';
  weightKg?: number;
  discountExpiry?: string;
  isDummy?: boolean;
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
  userName?: string;
  userPhone?: string;
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
  shippingAddress?: string;
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
