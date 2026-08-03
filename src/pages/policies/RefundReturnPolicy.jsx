import { useTheme } from '../../context/ThemeContext';
import appConfig from '../../config/app.config';
import SEO from '../../components/common/SEO';

const RefundReturnPolicy = () => {
  const { theme } = useTheme();
  const hours = appConfig.refundPolicyHours || 24;

  return (
    <div className="min-h-screen pt-36 pb-16" style={{ background: theme.bg }}>
      <SEO
        title="Refund & Return Policy"
        description="Joy Spark Toys refund & return policy. 24-hour refund guarantee on damaged or wrong items. Shop kids toys online in India with confidence."
        path="/refund-return-policy"
        keywords="joy spark toys refund policy, toy return policy india, 24 hour refund toys"
      />
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-black mb-2" style={{ color: theme.text }}>Refund & Return Policy</h1>
        <p className="text-sm mb-8" style={{ color: theme.textMuted }}>
          Last updated: {new Date().toLocaleDateString('en-IN')}
        </p>

        <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-6" style={{ borderColor: theme.border }}>
          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Overview</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              We want you to have a great experience with {appConfig.appName}. If you receive a damaged product,
              a wrong item, or an item with missing parts, we may accept a return and/or provide a refund/replacement
              as per this policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Return Window</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              Any return/refund request must be raised within {hours} hours of delivery. If the request is not raised
              within {hours} hours, no return will be processed and we will not be responsible for any return/claims.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Before You Return (Mandatory)</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              You must communicate your return request with our support team before sending any product back. Returns
              sent without prior communication/approval may be rejected.
            </p>
            <div className="mt-3 text-sm" style={{ color: theme.textMuted }}>
              Support Email: <span className="font-bold" style={{ color: theme.primary }}>{appConfig.supportEmail}</span>
              <br />
              Support Phone: <span className="font-bold" style={{ color: theme.primary }}>{appConfig.supportPhone}</span>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Return Acceptance Conditions</h2>
            <div className="space-y-2 text-sm" style={{ color: theme.textMuted }}>
              <p>- The return will be accepted/processed only if the product is returned in the exact same box/packaging as delivered.</p>
              <p>- The product must be the exact same item as delivered, with all accessories/parts and tags (if any).</p>
              <p>- The item must be unused, unwashed, and in resalable condition (unless the return reason is damage or wrong item).</p>
              <p>- We may request photos/videos and unboxing evidence to validate the claim.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>📹 Mandatory Unboxing Video (Important)</h2>
            <div className="p-4 rounded-2xl border-2 border-red-200" style={{ background: '#FEF2F2' }}>
              <div className="space-y-2 text-sm" style={{ color: '#991B1B' }}>
                <p className="font-bold">You must record a video while opening the seal-packed box. This is mandatory for all orders.</p>
                <p>- The video must be a single continuous recording from the moment you start opening the sealed package until the product is fully visible.</p>
                <p>- The video must NOT be edited, cut, trimmed, combined, or modified in any way.</p>
                <p>- If no unboxing video is recorded and shared with us at the time of raising a return/refund request, <span className="font-black">No Return / No Cancellation / No Refund</span> will be provided.</p>
                <p>- The video must clearly show the sealed package, the process of opening, and the product inside.</p>
                <p>- Share the unboxing video to our support email or phone when raising a complaint.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Refunds</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              Once your return is received and inspected, we will notify you of the approval or rejection of your refund.
              If approved, the refund will be initiated to the original method of payment or an alternate method as applicable.
              Refund timelines depend on your payment provider/bank.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Shipping & Handling Charges</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              If a return is approved, shipping/handling/delivery/return pickup charges may apply depending on the case.
              If a return is not approved or is raised after {hours} hours, any required delivery/return charges will be
              strongly applied.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Non-Returnable Items</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              Certain items may be non-returnable for hygiene/safety reasons or due to brand/manufacturer restrictions.
              Where applicable, such items will be marked accordingly on the product page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black mb-2" style={{ color: theme.text }}>Contact</h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              For any questions about this policy, contact us at {appConfig.supportEmail}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundReturnPolicy;
