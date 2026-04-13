
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from '../types';

interface StoreContextType {
  cart: CartItem[];
  region: 'PK' | 'IN';
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  toggleRegion: () => void;
  getCurrency: () => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [region, setRegion] = useState<'PK' | 'IN'>('PK');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('glam_cart');
    const savedRegion = localStorage.getItem('glam_region');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    if (savedRegion === 'PK' || savedRegion === 'IN') {
      setRegion(savedRegion);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('glam_cart', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('glam_region', region);
    }
  }, [region, isInitialized]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => setCart([]);

  const toggleRegion = () => setRegion(prev => prev === 'PK' ? 'IN' : 'PK');

  const getCurrency = () => region === 'PK' ? 'PKR' : 'INR';

  return (
    <StoreContext.Provider value={{ cart, region, addToCart, updateQuantity, removeFromCart, clearCart, toggleRegion, getCurrency }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
