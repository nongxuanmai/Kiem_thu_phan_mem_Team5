import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id_sp === product.id_sp);
      if (existing) {
        return prev.map(i =>
          i.id_sp === product.id_sp
            ? { ...i, soluong: Math.min(i.soluong + quantity, product.soluong_sp) }
            : i
        );
      }
      return [...prev, { ...product, soluong: quantity }];
    });
  };

  const removeFromCart = (id_sp) => {
    setCartItems(prev => prev.filter(i => i.id_sp !== id_sp));
  };

  const updateQuantity = (id_sp, quantity) => {
    if (quantity <= 0) return removeFromCart(id_sp);
    setCartItems(prev =>
      prev.map(i => (i.id_sp === id_sp ? { ...i, soluong: quantity } : i))
    );
  };

  const clearCart = () => setCartItems([]);

  const totalItems = cartItems.reduce((sum, i) => sum + i.soluong, 0);
  const totalPrice = cartItems.reduce((sum, i) => sum + i.gia_sp * i.soluong, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
