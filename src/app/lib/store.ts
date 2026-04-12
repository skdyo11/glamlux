
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
        next = prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        next = [...prev, item];
      }
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

  return { cart, region, addToCart, removeFromCart, clearCart, toggleRegion, getCurrency };
};
