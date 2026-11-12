import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, CartItem, Product, Currency } from '../types';
import { api } from '../services/api';

interface CartContextType {
  cart: Cart | null;
  budgetStatus: {
    withinBudget: boolean;
    totalAmount: number;
    userBudget: number;
    remainingBudget: number;
    utilizationPct: number;
    excess: number;
  } | null;
  loading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  selectedProductForDetail: Product | null;
  setSelectedProductForDetail: (prod: Product | null) => void;
  comparisonList: Product[];
  addToComparison: (prod: Product) => void;
  removeFromComparison: (prodId: string) => void;
  clearComparison: () => void;
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [budgetStatus, setBudgetStatus] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [comparisonList, setComparisonList] = useState<Product[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');

  const refreshCart = async () => {
    try {
      setLoading(true);
      const res = await api.getCart();
      setCart(res.cart);
      setBudgetStatus(res.budget);
    } catch (err) {
      console.warn('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const addToCart = async (productId: string, quantity = 1) => {
    await api.addToCart(productId, quantity);
    await refreshCart();
    setIsCartOpen(true);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    await api.updateCartItem(productId, quantity);
    await refreshCart();
  };

  const removeItem = async (productId: string) => {
    await api.removeCartItem(productId);
    await refreshCart();
  };

  const clearCart = async () => {
    await api.clearCart();
    await refreshCart();
  };

  const addToComparison = (prod: Product) => {
    setComparisonList((prev) => {
      if (prev.some((p) => p.id === prod.id)) return prev;
      if (prev.length >= 3) {
        return [...prev.slice(1), prod];
      }
      return [...prev, prod];
    });
  };

  const removeFromComparison = (prodId: string) => {
    setComparisonList((prev) => prev.filter((p) => p.id !== prodId));
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        budgetStatus,
        loading,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        selectedProductForDetail,
        setSelectedProductForDetail,
        comparisonList,
        addToComparison,
        removeFromComparison,
        clearComparison,
        selectedCurrency,
        setSelectedCurrency,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
