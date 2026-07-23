import { useTheme } from '../../context/ThemeContext';
import appConfig from '../../config/app.config';

const ShippingPolicy = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen pt-36 pb-16" style={{ background: theme.bg }}>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-black mb-2" style={{ color: theme.text }}>Shipping Policy</h1>
        <p className="text-sm mb-8" style={{ color: theme.textMuted }}>
          Last updated: {new Date().toLocaleDateString('en-IN')}
        </p>

        <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-6" style={{ borderColor: theme.border }}>
          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Delivery Locations</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              We currently ship within India. Delivery availability may depend on your PIN code and courier coverage.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Shipping Charges</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              Shipping charges (if any) will be shown at checkout. Free shipping may apply on orders above ₹{appConfig.freeShippingAbove}.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Order Processing</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              Orders are usually processed within 1–3 business days. Processing times may vary during sales, holidays,
              or due to operational constraints.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Estimated Delivery Time</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              Delivery timelines vary by location. The expected delivery date shown in your order is an estimate and may
              change due to courier delays, weather, strikes, or other events beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Tracking</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              Tracking details (where available) may be shared via your order page or communication channels.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Incorrect Address / Non-Delivery</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              Please ensure your address and phone number are accurate. If a delivery attempt fails due to incorrect
              details or unavailability, re-delivery charges may apply.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Contact</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              For shipping questions, contact {appConfig.supportEmail}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
