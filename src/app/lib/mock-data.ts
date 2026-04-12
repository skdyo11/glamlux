
import { Parlour, Deal, Product } from '../types';

export const PARLOURS: Parlour[] = [
  {
    id: 'p1',
    name: 'The Gilded Rose Salon',
    lat: 31.5204,
    lng: 74.3587,
    area_tag: 'Gulberg, Lahore',
    rating: 4.9,
    images: ['https://picsum.photos/seed/parlour1/800/600'],
  },
  {
    id: 'p2',
    name: 'Modern Edge Hair Studio',
    lat: 28.6139,
    lng: 77.2090,
    area_tag: 'South Delhi',
    rating: 4.7,
    images: ['https://picsum.photos/seed/parlour2/800/600'],
  }
];

export const DEALS: Deal[] = [
  {
    id: 'd1',
    parlour_id: 'p1',
    name: 'Royal Bridal Glow Up',
    category: 'Bridal',
    price: 45000,
    discounted_price: 32000,
    expiry_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    upsell_product_id: 'prod1',
  },
  {
    id: 'd2',
    parlour_id: 'p1',
    name: 'Silk Therapy Hair Spa',
    category: 'Hair',
    price: 8000,
    discounted_price: 4500,
    expiry_date: new Date(Date.now() + 3600000 * 4).toISOString(),
    upsell_product_id: 'prod2',
  },
  {
    id: 'd3',
    parlour_id: 'p2',
    name: 'Crystal Clear Skin Facial',
    category: 'Skin',
    price: 12000,
    discounted_price: 8500,
    expiry_date: new Date(Date.now() + 86400000 * 7).toISOString(),
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'prod1',
    name: 'Luxe Foundation SPF 30',
    brand: 'GlamLux Couture',
    price: 4500,
    stock: 25,
    delivery_fee_base: 250,
    image: 'https://picsum.photos/seed/prod1/400/400',
  },
  {
    id: 'prod2',
    name: 'Midnight Velvet Lipstick',
    brand: 'GlamLux Couture',
    price: 2200,
    stock: 50,
    delivery_fee_base: 150,
    image: 'https://picsum.photos/seed/prod2/400/400',
  }
];
