import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';
import Button from '../common/Button';

const CartItem = ({ item }) => {
  const { theme } = useTheme();
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex gap-3 py-3 border-b" style={{ borderColor: theme.border }}>
      <img
        src={item.images?.[0] || 'https://via.placeholder.com/80'}
        alt={item.name}
        className="w-18 h-18 object-cover rounded-2xl bg-gray-100 shrink-0"
        style={{ width: 72, height: 72 }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold leading-snug line-clamp-2" style={{ color: theme.text }}>{item.name}</p>
        <p className="text-xs mt-1 font-bold" style={{ color: theme.primary }}>{formatPrice(item.price)}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border rounded-xl overflow-hidden" style={{ borderColor: theme.border }}>
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="px-2 py-1 hover:bg-gray-50 transition-colors"
              style={{ color: theme.primary }}
            >
              <Minus size={12} />
            </button>
            <span className="px-3 text-sm font-bold" style={{ color: theme.text }}>{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="px-2 py-1 hover:bg-gray-50 transition-colors"
              style={{ color: theme.primary }}
            >
              <Plus size={12} />
            </button>
          </div>
          <button
            onClick={() => removeFromCart(item.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            style={{ color: '#EF4444' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const CartDrawer = ({ isOpen, onClose, onAuthRequired }) => {
  const { theme } = useTheme();
  const { cartItems, cartSummary, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleCheckout = () => {
    onClose();
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    navigate(ROUTES.CHECKOUT);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: theme.border }}>
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} style={{ color: theme.primary }} />
                <h2 className="text-lg font-black" style={{ color: theme.text }}>Your Cart</h2>
                {cartSummary.totalItems > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: theme.gradient }}>
                    {cartSummary.totalItems}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {cartItems.length > 0 && (
                  <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-600 transition-colors font-medium">
                    Clear All
                  </button>
                )}
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <X size={20} style={{ color: theme.textMuted }} />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-2">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
                  <div className="text-7xl">🛒</div>
                  <p className="text-xl font-bold" style={{ color: theme.text }}>Your cart is empty!</p>
                  <p className="text-sm text-center" style={{ color: theme.textMuted }}>Add some amazing toys for your little ones</p>
                  <Button variant="primary" onClick={onClose} icon={ShoppingBag}>Start Shopping</Button>
                </div>
              ) : (
                cartItems.map((item) => <CartItem key={item.id} item={item} />)
              )}
            </div>

            {/* Summary & Checkout */}
            {cartItems.length > 0 && (
              <div className="border-t px-5 py-4" style={{ borderColor: theme.border, background: theme.bg }}>
                {cartSummary.savings > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-emerald-600">🎉 You save</span>
                    <span className="text-sm font-bold text-emerald-600">{formatPrice(cartSummary.savings)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: theme.textMuted }}>Subtotal</span>
                  <span className="text-sm font-semibold" style={{ color: theme.text }}>{formatPrice(cartSummary.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm" style={{ color: theme.textMuted }}>Shipping</span>
                  <span className="text-sm font-semibold" style={{ color: cartSummary.shipping === 0 ? '#10B981' : theme.text }}>
                    {cartSummary.shipping === 0 ? '🎁 FREE' : formatPrice(cartSummary.shipping)}
                  </span>
                </div>
                {cartSummary.shipping > 0 && (
                  <p className="text-xs mb-3 text-center" style={{ color: theme.textMuted }}>
                    Add {formatPrice(499 - cartSummary.subtotal)} more for free shipping!
                  </p>
                )}
                <div className="flex items-center justify-between mb-4 pt-3 border-t" style={{ borderColor: theme.border }}>
                  <span className="font-bold" style={{ color: theme.text }}>Total</span>
                  <span className="text-xl font-black" style={{ color: theme.primary }}>{formatPrice(cartSummary.total)}</span>
                </div>
                <Button variant="primary" size="lg" fullWidth onClick={handleCheckout}>
                  Proceed to Checkout →
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
