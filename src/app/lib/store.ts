
'use client';

import { useState, useEffect } from 'react';
import { CartItem } from '../types';

export const useStore = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [region, setRegion] = useState<'PK' | 'IN'>('PK');

  useEffect(() => {
    const savedCart = localStorage.getItem('glam_cart');
    const savedRegion = localStorage.getItem('glam_region');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedRegion) setRegion(savedRegion as 'PK' | 'IN');
  }, []);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      let next;
      if (existing) {
        next = prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      } else {
        next = [...prev, item];
      }
      localStorage.setItem('glam_cart', JSON.stringify(next));
      return next;
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const next = prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
      localStorage.setItem('glam_cart', JSON.stringify(next));
      return next;
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const next = prev.filter(i => i.id !== id);
      localStorage.setItem('glam_cart', JSON.stringify(next));
      return next;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('glam_cart');
  };

  const toggleRegion = () => {
    const nextRegion = region === 'PK' ? 'IN' : 'PK';
    setRegion(nextRegion);
    localStorage.setItem('glam_region', nextRegion);
  };

  const getCurrency = () => region === 'PK' ? 'PKR' : 'INR';

  const toggleFavoriteProduct = (id: string) => {};
  const toggleFavoriteVendor = (id: string) => {};
  const isFavoriteProduct = (id: string) => false;
  const isFavoriteVendor = (id: string) => false;
  const favorites = { products: [], vendors: [] };

  return { 
    cart, region, favorites, addToCart, updateQuantity, removeFromCart, 
    clearCart, toggleRegion, getCurrency, toggleFavoriteProduct, 
    toggleFavoriteVendor, isFavoriteProduct, isFavoriteVendor 
  };
};
