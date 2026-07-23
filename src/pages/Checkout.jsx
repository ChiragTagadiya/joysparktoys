import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, CheckCircle, Package, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice, displayOrderNumber } from '../utils/formatters';
import { ROUTES } from '../constants/routes';
import { OrdersService } from '../services/orders.service';
import AddressForm from '../components/checkout/AddressForm';
import PaymentOptions from '../components/checkout/PaymentOptions';
import Button from '../components/common/Button';

const STEPS = [
  { id: 1, label: 'Address', icon: MapPin },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Confirmation', icon: CheckCircle },
];

const Checkout = () => {
  const { theme } = useTheme();
  const { cartItems, cartSummary, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState(null);
  const [payLoading, setPayLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const handleAddressSubmit = (addr) => {
    setAddress(addr);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePayment = async (paymentInfo) => {
    setPayLoading(true);
    const { data, error } = await OrdersService.create({
      userId: user?.id,
      items: cartItems.map(({ id, name, price, images, quantity, category }) => ({ id, name, price, images, quantity, category })),
      address: { ...address, email: user?.email || '' },
      paymentMethod: paymentInfo.method,
      subtotal: cartSummary.subtotal,
      shipping: cartSummary.shipping,
      total: cartSummary.total,
    });
    if (error) {
      addToast('Failed to place order. Please try again.', 'error');
      setPayLoading(false);
      return;
    }
    setPlacedOrder(data);
    clearCart();
    setStep(3);
    setPayLoading(false);
    addToast('Order placed successfully! 🎉', 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (cartItems.length === 0 && step < 3) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-20" style={{ background: theme.bg }}>
        <span className="text-7xl">🛒</span>
        <h2 className="text-2xl font-black" style={{ color: theme.text }}>Your cart is empty!</h2>
        <Button onClick={() => navigate(ROUTES.PRODUCTS)} icon={Package}>Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-36 pb-16" style={{ background: theme.bg }}>
      <div className="max-w-5xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <motion.div
                    animate={{ scale: active ? 1.15 : 1 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                    style={{
                      background: done ? '#10B981' : active ? theme.gradient : theme.border,
                      color: done || active ? 'white' : theme.textMuted,
                      boxShadow: active ? `0 0 0 4px ${theme.primaryLight}40` : 'none',
                    }}
                  >
                    {done ? <CheckCircle size={18} /> : <Icon size={18} />}
                  </motion.div>
                  <span className="text-xs font-semibold" style={{ color: active ? theme.primary : theme.textMuted }}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-16 md:w-24 h-0.5 mx-2 mb-5 transition-all" style={{ background: step > s.id ? '#10B981' : theme.border }} />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: theme.border }}>
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2" style={{ color: theme.text }}>
                      <MapPin style={{ color: theme.primary }} /> Delivery Address
                    </h2>
                    <AddressForm onSubmit={handleAddressSubmit} initial={address || {}} />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="bg-white rounded-3xl p-6 shadow-sm border mb-4" style={{ borderColor: theme.border }}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold flex items-center gap-2" style={{ color: theme.text }}>
                        <MapPin size={16} style={{ color: theme.primary }} /> Delivering to
                      </h3>
                      <button onClick={() => setStep(1)} className="text-xs font-semibold" style={{ color: theme.primary }}>Change</button>
                    </div>
                    <p className="text-sm" style={{ color: theme.text }}>{address?.fullName} • {address?.phone}</p>
                    <p className="text-sm" style={{ color: theme.textMuted }}>{address?.addressLine1}, {address?.city}, {address?.state} – {address?.pincode}</p>
                  </div>
                  <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: theme.border }}>
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2" style={{ color: theme.text }}>
                      <CreditCard style={{ color: theme.primary }} /> Payment
                    </h2>
                    <PaymentOptions total={cartSummary.total} onPay={handlePayment} loading={payLoading} />
                  </div>
                  <button onClick={() => setStep(1)} className="flex items-center gap-1 mt-4 text-sm font-semibold" style={{ color: theme.textMuted }}>
                    <ArrowLeft size={14} /> Back to Address
                  </button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl p-10 shadow-sm border text-center"
                  style={{ borderColor: theme.border }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="text-8xl mb-4"
                  >
                    🎉
                  </motion.div>
                  <h2 className="text-3xl font-black mb-3" style={{ color: theme.text }}>Order Placed!</h2>
                  <p className="text-lg mb-2" style={{ color: theme.textMuted }}>Thank you for shopping with Joy Spark Toys!</p>
                  <p className="font-bold mb-6" style={{ color: theme.primary }}>Order ID: {displayOrderNumber(placedOrder?.order_number, placedOrder?.id)}</p>
                  <div className="p-4 rounded-2xl mb-6 text-sm" style={{ background: theme.heroGradient }}>
                    <p style={{ color: theme.textMuted }}>Delivering to <strong style={{ color: theme.text }}>{address?.fullName}</strong></p>
                    <p style={{ color: theme.textMuted }}>{address?.city}, {address?.state} – {address?.pincode}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="primary" onClick={() => navigate(ROUTES.ORDERS)} icon={Package}>Track Order</Button>
                    <Button variant="secondary" onClick={() => navigate(ROUTES.PRODUCTS)}>Continue Shopping</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          {step < 3 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 shadow-sm border sticky top-24" style={{ borderColor: theme.border }}>
                <h3 className="font-black text-lg mb-4" style={{ color: theme.text }}>Order Summary</h3>
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img src={item.images?.[0]} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold line-clamp-1" style={{ color: theme.text }}>{item.name}</p>
                        <p className="text-xs" style={{ color: theme.textMuted }}>Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold shrink-0" style={{ color: theme.primary }}>{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2" style={{ borderColor: theme.border }}>
                  {cartSummary.savings > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>🎉 Savings</span><span>-{formatPrice(cartSummary.savings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm" style={{ color: theme.textMuted }}>
                    <span>Subtotal</span><span>{formatPrice(cartSummary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ color: cartSummary.shipping === 0 ? '#10B981' : theme.text }}>
                    <span>Shipping</span><span>{cartSummary.shipping === 0 ? 'FREE' : formatPrice(cartSummary.shipping)}</span>
                  </div>
                  <div className="flex justify-between font-black text-lg pt-2 border-t" style={{ borderColor: theme.border, color: theme.primary }}>
                    <span>Total</span><span>{formatPrice(cartSummary.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
