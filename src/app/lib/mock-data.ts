
import { Parlour, Deal, Product } from '../types';

export const PARLOURS: Parlour[] = [
  {
    id: 'p1',
    name: 'The Gilded Rose Salon',
    lat: 31.5204,
    lng: 74.3587,
    area_tag: 'Gulberg, Lahore',
    rating: 4.9,
    images: ['https://picsum.photos/seed/luxury-spa-interior/800/600'],
  },
  {
    id: 'p2',
    name: 'Atelier of Elegance',
    lat: 28.6139,
    lng: 77.2090,
    area_tag: 'South Delhi',
    rating: 4.8,
    images: ['https://picsum.photos/seed/modern-hair-studio/800/600'],
  },
  {
    id: 'p3',
    name: 'Velvet Brush Studio',
    lat: 24.8607,
    lng: 67.0011,
    area_tag: 'DHA, Karachi',
    rating: 4.7,
    images: ['https://picsum.photos/seed/bridal-makeup-studio/800/600'],
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
    deposit_amount: 4800, // 15% deposit
    expiry_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    upsell_product_id: 'prod1',
  },
  {
    id: 'd2',
    parlour_id: 'p1',
    name: 'Silk Therapy Hair Spa',
    category: 'Hair',
    price: 8500,
    discounted_price: 4500,
    deposit_amount: 900, // 20% deposit
    expiry_date: new Date(Date.now() + 3600000 * 4).toISOString(),
    upsell_product_id: 'prod3',
  },
  {
    id: 'd3',
    parlour_id: 'p2',
    name: 'Crystal Clear Skin Facial',
    category: 'Skin',
    price: 12500,
    discounted_price: 8500,
    deposit_amount: 850, // 10% deposit
    expiry_date: new Date(Date.now() + 86400000 * 7).toISOString(),
    upsell_product_id: 'prod4',
  },
  {
    id: 'd4',
    parlour_id: 'p3',
    name: 'Signature Evening Glam',
    category: 'Bridal',
    price: 15000,
    discounted_price: 9500,
    deposit_amount: 1425, // 15% deposit
    expiry_date: new Date(Date.now() + 86400000 * 1).toISOString(),
    upsell_product_id: 'prod2',
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'prod1',
    name: 'Silk Radiance Foundation',
    brand: 'GlamLux Couture',
    price: 4800,
    stock: 25,
    delivery_fee_base: 250,
    image: 'https://picsum.photos/seed/luxury-foundation-bottle/400/500',
  },
  {
    id: 'prod2',
    name: 'Velvet Matte Lip Ink',
    brand: 'GlamLux Couture',
    price: 2400,
    stock: 50,
    delivery_fee_base: 150,
    image: 'https://picsum.photos/seed/luxury-lipstick-swatch/400/500',
  },
  {
    id: 'prod3',
    name: 'Gold Infused Face Oil',
    brand: 'GlamLux Couture',
    price: 5500,
    stock: 15,
    delivery_fee_base: 200,
    image: 'https://picsum.photos/seed/luxury-skincare-serum/400/500',
  },
  {
    id: 'prod4',
    name: 'Illuminating Priming Veil',
    brand: 'GlamLux Couture',
    price: 3200,
    stock: 30,
    delivery_fee_base: 150,
    image: 'https://picsum.photos/seed/luxury-makeup-primer/400/500',
  }
];
