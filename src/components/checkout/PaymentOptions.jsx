import { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, CheckCircle, Package, IndianRupee } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { formatPrice } from '../../utils/formatters';
import Button from '../common/Button';

const PaymentOptions = ({ total, onPay, loading }) => {
  const { theme } = useTheme();
  const [agreed, setAgreed] = useState(false);

  const handlePlaceOrder = () => {
    if (!agreed) return;
    onPay({ method: 'cod' });
  };

  return (
    <div className="space-y-5">

      {/* COD Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-5 rounded-2xl border-2"
        style={{ borderColor: theme.primary, background: `${theme.primary}08` }}
      >
        <div className="p-3 rounded-xl" style={{ background: `${theme.primary}20` }}>
          <Truck size={26} style={{ color: theme.primary }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-black text-base" style={{ color: theme.text }}>Cash on Delivery</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: '#F59E0B' }}>
              💰 COD
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>Pay when your order arrives at your doorstep</p>
        </div>
        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: theme.primary }}>
          <CheckCircle size={12} color="white" fill="white" />
        </div>
      </motion.div>

      {/* How it works */}
      <div className="p-4 rounded-2xl space-y-3" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
        <p className="text-sm font-bold" style={{ color: '#92400E' }}>📦 How Cash on Delivery works</p>
        {[
          { icon: Package, text: 'Place your order — no payment needed now' },
          { icon: Truck, text: 'We deliver to your address within 5–7 business days' },
          { icon: IndianRupee, text: `Pay ${formatPrice(total)} in cash when the order arrives` },
        ].map(({ icon: Icon, text }, i) => (
          <div key={i} className="flex items-center gap-3 text-xs" style={{ color: '#92400E' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-white" style={{ background: '#F59E0B' }}>
              {i + 1}
            </div>
            {text}
          </div>
        ))}
      </div>

      {/* Refund Policy */}
      <div className="p-3 rounded-2xl text-xs" style={{ background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' }}>
        🔄 <strong>24-Hour Refund Policy:</strong> Eligible only for damaged or wrong product delivery. Raise a request within 24 hours of delivery.
      </div>

      {/* Agreement */}
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 rounded"
        />
        <span className="text-xs" style={{ color: theme.textMuted }}>
          I agree to the{' '}
          <a href="#" className="underline font-semibold" style={{ color: theme.primary }}>Terms & Conditions</a>,{' '}
          <a href="#" className="underline font-semibold" style={{ color: theme.primary }}>Refund Policy</a> and{' '}
          <a href="#" className="underline font-semibold" style={{ color: theme.primary }}>Privacy Policy</a> of Little Joy.
        </span>
      </label>

      <Button
        variant="primary"
        size="xl"
        fullWidth
        loading={loading}
        onClick={handlePlaceOrder}
        className={!agreed ? 'opacity-50 cursor-not-allowed' : ''}
      >
        Place Order • {formatPrice(total)}
      </Button>

      <p className="text-center text-xs" style={{ color: theme.textMuted }}>
        🔒 Your details are safe. Online payment coming soon.
      </p>
    </div>
  );
};

export default PaymentOptions;
