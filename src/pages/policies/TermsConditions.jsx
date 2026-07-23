import { useTheme } from '../../context/ThemeContext';
import appConfig from '../../config/app.config';

const TermsConditions = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen pt-36 pb-16" style={{ background: theme.bg }}>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-black mb-2" style={{ color: theme.text }}>Terms & Conditions</h1>
        <p className="text-sm mb-8" style={{ color: theme.textMuted }}>
          Last updated: {new Date().toLocaleDateString('en-IN')}
        </p>

        <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-6" style={{ borderColor: theme.border }}>
          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Acceptance of Terms</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              By accessing or using {appConfig.appName}, you agree to be bound by these Terms & Conditions.
              If you do not agree, please do not use the website.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Account & Orders</h2>
            <div className="space-y-2 text-sm" style={{ color: theme.textMuted }}>
              <p>- You agree to provide accurate contact and delivery details during checkout.</p>
              <p>- We may refuse or cancel orders in case of suspected fraud, pricing errors, or stock unavailability.</p>
              <p>- Order status updates shown are for information and may change based on logistics/processing.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Pricing & Payments</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              Prices are listed in INR and may change without notice. Taxes and shipping charges (if applicable) are
              shown at checkout. Payment methods are subject to availability.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Returns/Refunds</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              Returns and refunds are governed by our Refund & Return Policy and Cancellation Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Intellectual Property</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              All content on the site (text, images, logos, graphics) is owned by or licensed to {appConfig.appName}.
              You may not copy, reproduce, or distribute any content without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Limitation of Liability</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              To the maximum extent permitted under applicable Indian laws, {appConfig.appName} will not be liable for
              indirect, incidental, or consequential damages arising from the use of the website or products.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Governing Law</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              These terms shall be governed by and construed in accordance with the laws of India.
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

export default TermsConditions;
