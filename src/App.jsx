import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import { ROUTES } from './constants/routes';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AnnouncementBar from './components/layout/AnnouncementBar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import CartDrawer from './components/cart/CartDrawer';
import AuthModal from './components/auth/AuthModal';
import ToastContainer from './components/common/Toast';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import RefundReturnPolicy from './pages/policies/RefundReturnPolicy';
import PrivacyPolicy from './pages/policies/PrivacyPolicy';
import TermsConditions from './pages/policies/TermsConditions';
import ShippingPolicy from './pages/policies/ShippingPolicy';
import CancellationPolicy from './pages/policies/CancellationPolicy';

const App = () => {
  const { theme } = useTheme();
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div style={{ background: theme.bg, minHeight: '100vh' }}>
      <AnnouncementBar />
      <Navbar onCartOpen={() => setCartOpen(true)} onAuthOpen={() => setAuthOpen(true)} />

      <main>
        <Routes>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.PRODUCTS} element={<Products />} />
          <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetail />} />
          <Route
            path={ROUTES.CHECKOUT}
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ORDERS}
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PROFILE}
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN}
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path={ROUTES.REFUND_RETURN_POLICY} element={<RefundReturnPolicy />} />
          <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPolicy />} />
          <Route path={ROUTES.TERMS_CONDITIONS} element={<TermsConditions />} />
          <Route path={ROUTES.SHIPPING_POLICY} element={<ShippingPolicy />} />
          <Route path={ROUTES.CANCELLATION_POLICY} element={<CancellationPolicy />} />
        </Routes>
      </main>

      <Footer />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onAuthRequired={() => { setCartOpen(false); setAuthOpen(true); }}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
      />

      <ToastContainer />
    </div>
  );
};

export default App;
