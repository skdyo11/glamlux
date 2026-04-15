'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { CartItem } from '../types';

interface StoreContextType {
  cart: CartItem[];
  region: 'PK' | 'IN';
  favorites: {
    products: string[];
    vendors: string[];
  };
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  toggleRegion: () => void;
  getCurrency: () => string;
  toggleFavoriteProduct: (id: string) => void;
  toggleFavoriteVendor: (id: string) => void;
  isFavoriteProduct: (id: string) => boolean;
  isFavoriteVendor: (id: string) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [region, setRegion] = useState<'PK' | 'IN'>('PK');
  const [favorites, setFavorites] = useState<{ products: string[]; vendors: string[] }>({ products: [], vendors: [] });
  const [isInitialized, setIsInitialized] = useState(false);

  // Optimized hydration
  useEffect(() => {
    const savedCart = localStorage.getItem('glam_cart');
    const savedRegion = localStorage.getItem('glam_region');
    const savedFavs = localStorage.getItem('glam_favs');
    
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {}
    }
    if (savedRegion === 'PK' || savedRegion === 'IN') {
      setRegion(savedRegion);
    }
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {}
    }
    setIsInitialized(true);
  }, []);

  // Optimized persistence (only when initialized)
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('glam_cart', JSON.stringify(cart));
  }, [cart, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('glam_region', region);
  }, [region, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('glam_favs', JSON.stringify(favorites));
  }, [favorites, isInitialized]);

  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleRegion = useCallback(() => setRegion(prev => prev === 'PK' ? 'IN' : 'PK'), []);

  const getCurrency = useCallback(() => region === 'PK' ? 'PKR' : 'INR', [region]);

  const toggleFavoriteProduct = useCallback((id: string) => {
    setFavorites(prev => {
      const isFav = prev.products.includes(id);
      return {
        ...prev,
        products: isFav ? prev.products.filter(pid => pid !== id) : [...prev.products, id]
      };
    });
  }, []);

  const toggleFavoriteVendor = useCallback((id: string) => {
    setFavorites(prev => {
      const isFav = prev.vendors.includes(id);
      return {
        ...prev,
        vendors: isFav ? prev.vendors.filter(vid => vid !== id) : [...prev.vendors, id]
      };
    });
  }, []);

  const isFavoriteProduct = useCallback((id: string) => favorites.products.includes(id), [favorites.products]);
  const isFavoriteVendor = useCallback((id: string) => favorites.vendors.includes(id), [favorites.vendors]);

  const value = useMemo(() => ({
    cart, region, favorites, addToCart, updateQuantity, removeFromCart, clearCart, toggleRegion, getCurrency,
    toggleFavoriteProduct, toggleFavoriteVendor, isFavoriteProduct, isFavoriteVendor
  }), [cart, region, favorites, addToCart, updateQuantity, removeFromCart, clearCart, toggleRegion, getCurrency, toggleFavoriteProduct, toggleFavoriteVendor, isFavoriteProduct, isFavoriteVendor]);

  return (
    <StoreContext.Provider value={value}>
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
