import { createContext, useContext, useCallback, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useLocalStorage('lj_cart', []);
  const [wishlist, setWishlist] = useLocalStorage('lj_wishlist', []);

  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: Math.min(i.quantity + quantity, 10) } : i
        );
      }
      return [...prev, { ...product, quantity }];
    });
  }, [setCartItems]);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((i) => i.id !== productId));
  }, [setCartItems]);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, quantity: Math.min(quantity, 10) } : i))
    );
  }, [setCartItems]);

  const clearCart = useCallback(() => setCartItems([]), [setCartItems]);

  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, [setWishlist]);

  const isInWishlist = useCallback((productId) => wishlist.includes(productId), [wishlist]);

  const cartSummary = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const shipping = subtotal >= 499 ? 0 : 49;
    const total = subtotal + shipping;
    const savings = cartItems.reduce(
      (sum, item) => sum + ((item.originalPrice || item.price) - item.price) * item.quantity, 0
    );
    return { subtotal, totalItems, shipping, total, savings };
  }, [cartItems]);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
      wishlist, toggleWishlist, isInWishlist, cartSummary,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
