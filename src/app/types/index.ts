
export type Parlour = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  area_tag: string;
  rating: number;
  images: string[];
};

export type DealCategory = 'Bridal' | 'Hair' | 'Skin';

export type Deal = {
  id: string;
  parlour_id: string;
  name: string;
  category: DealCategory;
  price: number;
  discounted_price: number;
  deposit_amount: number;
  expiry_date: string;
  upsell_product_id?: string;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  delivery_fee_base: number;
  image: string;
};

export type CartItem = {
  id: string;
  type: 'deal' | 'product';
  name: string;
  price: number; // This is the amount to be paid NOW (deposit for deals, full for products)
  full_price?: number; // Only for deals, to show total value
  quantity: number;
  image?: string;
};

export type DeliveryStatus = 'Pending' | 'Picked Up' | 'Delivered';

export type Booking = {
  id: string;
  localUserId: string;
  referenceCode: string;
  cartItems: CartItem[];
  totalPrice: number;
  currency: string;
  qrVerificationStatus: boolean;
  deliveryStatus: DeliveryStatus;
  createdAt: string;
  paymentStatus: string;
  verifiedAt?: string;
  parlourOwnerIdsInBooking?: string[];
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
