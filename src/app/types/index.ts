
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
  price: number;
  quantity: number;
  image?: string;
};

export type Booking = {
  id: string;
  booking_ref_code: string;
  cart_items: CartItem[];
  total_price: number;
  qr_verification_status: boolean;
  is_delivered: boolean;
  region: 'PK' | 'IN';
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
