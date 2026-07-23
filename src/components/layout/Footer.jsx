import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Shield, RefreshCw, Truck, Headphones } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import appConfig from '../../config/app.config';
import { ROUTES } from '../../constants/routes';

const InstagramIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>);

const Footer = () => {
  const { theme } = useTheme();

  const trustBadges = [
    { icon: Truck, label: 'Free Shipping', sub: 'Orders above ₹499' },
    { icon: RefreshCw, label: '24hr Refund', sub: 'Damaged/Wrong items' },
    { icon: Shield, label: 'Safe Payment', sub: 'Secure transactions' },
    { icon: Headphones, label: '24/7 Support', sub: 'Always here for you' },
  ];

  return (
    <footer style={{ background: theme.bgDark, color: '#E5E7EB' }}>
      {/* Trust Badges */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="p-3 rounded-2xl" style={{ background: `${theme.primary}30` }}>
                  <Icon size={22} style={{ color: theme.primaryLight }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Little Joy Toys" className="h-10 w-auto" />
              <span className="text-2xl font-black" style={{ background: theme.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {appConfig.appName}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">{appConfig.tagline} — Your one-stop shop for quality toys that inspire creativity, learning, and joy for kids across India.</p>
            <div className="flex gap-3">
              <a href={appConfig.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                className="p-2.5 rounded-full transition-all hover:scale-110"
                style={{ background: '#E91E8C20', color: '#E91E8C' }}
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Shop All Toys', to: ROUTES.PRODUCTS },
                { label: 'Best Sellers', to: `${ROUTES.PRODUCTS}?sort=best` },
                { label: 'New Arrivals', to: `${ROUTES.PRODUCTS}?sort=newest` },
                { label: 'My Orders', to: ROUTES.ORDERS },
                { label: 'My Profile', to: ROUTES.PROFILE },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                    <span style={{ color: theme.primaryLight }}>›</span> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Policies</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Refund & Return Policy', to: ROUTES.REFUND_RETURN_POLICY },
                { label: 'Privacy Policy', to: ROUTES.PRIVACY_POLICY },
                { label: 'Terms & Conditions', to: ROUTES.TERMS_CONDITIONS },
                { label: 'Shipping Policy', to: ROUTES.SHIPPING_POLICY },
                { label: 'Cancellation Policy', to: ROUTES.CANCELLATION_POLICY },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                    <span style={{ color: theme.primaryLight }}>›</span> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <Phone size={14} className="mt-0.5 shrink-0" style={{ color: theme.primaryLight }} />
                {appConfig.supportPhone}
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <Mail size={14} className="mt-0.5 shrink-0" style={{ color: theme.primaryLight }} />
                {appConfig.supportEmail}
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: theme.primaryLight }} />
                India (Shipping Nationwide)
              </li>
            </ul>
            <div className="mt-4 p-3 rounded-xl text-xs text-gray-400" style={{ background: 'rgba(255,255,255,0.05)' }}>
              🕐 {appConfig.refundPolicyText}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} {appConfig.appName}. All rights reserved. Made with ❤️ in India.</p>
          <div className="flex items-center gap-3">
            {['Cash on Delivery', 'Free Shipping', '24hr Refund'].map((method) => (
              <span key={method} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/10 text-gray-300">{method}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
