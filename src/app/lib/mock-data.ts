
import { Vendor, Deal, Product } from '../types';

export const VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'The Gilded Rose Salon',
    lat: 31.5204,
    lng: 74.3587,
    area_tag: 'Gulberg, Lahore',
    rating: 4.9,
    images: ['https://picsum.photos/seed/luxury-spa-interior/800/600'],
    owner_currency: 'PKR',
    commission_rate: 0.15,
  },
  {
    id: 'v2',
    name: 'Atelier of Elegance',
    lat: 28.6139,
    lng: 77.2090,
    area_tag: 'South Delhi',
    rating: 4.8,
    images: ['https://picsum.photos/seed/modern-hair-studio/800/600'],
    owner_currency: 'INR',
    commission_rate: 0.15,
  },
  {
    id: 'v3',
    name: 'Velvet Brush Studio',
    lat: 24.8607,
    lng: 67.0011,
    area_tag: 'DHA, Karachi',
    rating: 4.7,
    images: ['https://picsum.photos/seed/bridal-makeup-studio/800/600'],
    owner_currency: 'PKR',
    commission_rate: 0.15,
  }
];

export const DEALS: Deal[] = [
  {
    id: 'd1',
    vendor_id: 'v1',
    name: 'Royal Bridal Glow Up',
    category: 'Bridal',
    base_price: 45000,
    discount_price: 32000,
    deposit_percent: 10,
    is_offpeak_active: true,
    expiry_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    upsell_product_id: 'prod1',
  },
  {
    id: 'd2',
    vendor_id: 'v1',
    name: 'Silk Therapy Hair Spa',
    category: 'Hair',
    base_price: 8500,
    discount_price: 4500,
    deposit_percent: 10,
    is_offpeak_active: false,
    expiry_date: new Date(Date.now() + 3600000 * 4).toISOString(),
    upsell_product_id: 'prod3',
  },
  {
    id: 'd3',
    vendor_id: 'v2',
    name: 'Crystal Clear Skin Facial',
    category: 'Skin',
    base_price: 12500,
    discount_price: 8500,
    deposit_percent: 10,
    is_offpeak_active: true,
    expiry_date: new Date(Date.now() + 86400000 * 7).toISOString(),
    upsell_product_id: 'prod4',
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'prod1',
    vendor_id: 'v1',
    name: 'Silk Radiance Foundation',
    brand: 'GlamLux Couture',
    price: 4800,
    stock: 25,
    image: 'https://picsum.photos/seed/luxury-foundation-bottle/400/500',
  },
  {
    id: 'prod2',
    vendor_id: 'v3',
    name: 'Velvet Matte Lip Ink',
    brand: 'GlamLux Couture',
    price: 2400,
    stock: 50,
    image: 'https://picsum.photos/seed/luxury-lipstick-swatch/400/500',
  }
];
