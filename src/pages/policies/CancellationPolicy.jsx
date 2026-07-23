import { useTheme } from '../../context/ThemeContext';
import appConfig from '../../config/app.config';

const CancellationPolicy = () => {
  const { theme } = useTheme();
  const hours = appConfig.refundPolicyHours || 24;

  return (
    <div className="min-h-screen pt-36 pb-16" style={{ background: theme.bg }}>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-black mb-2" style={{ color: theme.text }}>Cancellation Policy</h1>
        <p className="text-sm mb-8" style={{ color: theme.textMuted }}>
          Last updated: {new Date().toLocaleDateString('en-IN')}
        </p>

        <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-6" style={{ borderColor: theme.border }}>
          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Order Cancellation</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              You may request cancellation before the order is shipped/processed for dispatch. Once an order is shipped,
              cancellation may not be possible.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>How to Request Cancellation</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              Please contact our support team as soon as possible with your order details.
            </p>
            <div className="mt-3 text-sm" style={{ color: theme.textMuted }}>
              Email: <span className="font-bold" style={{ color: theme.primary }}>{appConfig.supportEmail}</span>
              <br />
              Phone: <span className="font-bold" style={{ color: theme.primary }}>{appConfig.supportPhone}</span>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Refusal / Return After Delivery</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              If an order is delivered and you wish to return it, the return request must be raised within {hours} hours
              of delivery and must follow the Refund & Return Policy. Prior communication is mandatory.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Return Conditions (Important)</h2>
            <div className="space-y-2 text-sm" style={{ color: theme.textMuted }}>
              <p>- Return will be accepted/processed only in the exact same box/packaging as delivered.</p>
              <p>- The product must be the exact same item with all parts/accessories and original condition.</p>
              <p>- If the order is not returned within {hours} hours, no return will be processed and we are not responsible for anything.</p>
              <p>- Any order/product delivery, return and other required delivery charges will be strongly applied in such cases.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Contact</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              For cancellations, contact {appConfig.supportEmail}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CancellationPolicy;
