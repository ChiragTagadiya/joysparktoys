import { useTheme } from '../../context/ThemeContext';
import appConfig from '../../config/app.config';

const PrivacyPolicy = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen pt-36 pb-16" style={{ background: theme.bg }}>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-black mb-2" style={{ color: theme.text }}>Privacy Policy</h1>
        <p className="text-sm mb-8" style={{ color: theme.textMuted }}>
          Last updated: {new Date().toLocaleDateString('en-IN')}
        </p>

        <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-6" style={{ borderColor: theme.border }}>
          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Introduction</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              This Privacy Policy describes how {appConfig.appName} ("we", "our", "us") collects, uses, stores, and
              shares information when you use our website and services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Information We Collect</h2>
            <div className="space-y-2 text-sm" style={{ color: theme.textMuted }}>
              <p>- Account information (name, email, login identifiers).</p>
              <p>- Order information (products purchased, payment method, order status).</p>
              <p>- Delivery details (address, phone number, pincode) provided during checkout.</p>
              <p>- Device and usage data (basic analytics, IP address, browser type) to improve performance and security.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>How We Use Your Information</h2>
            <div className="space-y-2 text-sm" style={{ color: theme.textMuted }}>
              <p>- To process and deliver your orders.</p>
              <p>- To provide customer support and handle returns/refunds.</p>
              <p>- To communicate order updates and important service notifications.</p>
              <p>- To improve site experience, prevent fraud, and comply with legal obligations.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Sharing of Information</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              We may share information with trusted third parties only as needed to provide services, such as delivery
              partners and payment providers. We do not sell your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Data Retention</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              We retain personal data only as long as necessary for the purposes outlined in this policy and to comply
              with legal, accounting, or reporting requirements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Security</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              We implement reasonable security measures to protect your information. However, no method of transmission
              over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Your Choices</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              You can review/update certain profile details in your account. If you wish to request deletion or access
              to your personal data, contact us at {appConfig.supportEmail}.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Contact</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              Email: {appConfig.supportEmail}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
