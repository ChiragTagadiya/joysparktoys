import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Search, Heart, User, Menu, X, ChevronDown,
  Package, Settings, LogOut, LayoutDashboard, Palette, Sun, Droplets, Leaf,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import appConfig from '../../config/app.config';
import { ROUTES } from '../../constants/routes';
import useDebounce from '../../hooks/useDebounce';

const THEME_ICONS = { candy: Palette, ocean: Droplets, sunshine: Sun, forest: Leaf };

const Navbar = ({ onCartOpen, onAuthOpen }) => {
  const { theme, themeName, changeTheme, allThemes } = useTheme();
  const { cartSummary, wishlist } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const { searchQuery, setSearchQuery } = useProducts();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const userMenuRef = useRef(null);
  const themeMenuRef = useRef(null);

  const debouncedSearch = useDebounce(searchQuery, 400);

  useEffect(() => {
    if (debouncedSearch) navigate(ROUTES.PRODUCTS);
  }, [debouncedSearch, navigate]);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target)) setThemeMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate(ROUTES.HOME);
  };

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className="text-sm font-semibold transition-colors hover:opacity-80"
      style={{ color: theme.text }}
      onClick={() => setMobileOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <header
      className="fixed top-14 left-0 right-0 z-40 transition-all duration-300"
      style={{ background: theme.bg }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-16">

          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="Little Joy Toys" className="h-10 w-auto" />
            <div className="leading-none">
              <span className="text-xl font-black" style={{ background: theme.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {appConfig.appName}
              </span>
              <p className="text-[10px] font-medium hidden sm:block" style={{ color: theme.textMuted }}>{appConfig.tagline}</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className={`flex-1 max-w-md mx-4 hidden md:block transition-all ${searchFocused ? 'max-w-lg' : ''}`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" size={16} style={{ color: theme.primary }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search toys, brands, categories..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm border-2 transition-all focus:outline-none"
                style={{
                  borderColor: searchFocused ? theme.primary : theme.border,
                  background: 'white',
                  color: theme.text,
                  boxShadow: searchFocused ? `0 0 0 3px ${theme.primaryLight}30` : 'none',
                }}
              />
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <NavLink to={ROUTES.HOME}>Home</NavLink>
            <NavLink to={ROUTES.PRODUCTS}>Shop</NavLink>
            {isAdmin && <NavLink to={ROUTES.ADMIN}>Admin</NavLink>}
          </nav>

          {/* Right Actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* Theme Switcher */}
            <div ref={themeMenuRef} className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setThemeMenuOpen((p) => !p)}
                className="p-2 rounded-full transition-colors hover:bg-black/5"
                style={{ color: theme.primary }}
              >
                <Palette size={20} />
              </motion.button>
              <AnimatePresence>
                {themeMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-2xl border overflow-hidden"
                    style={{ borderColor: theme.border }}
                  >
                    <p className="px-3 pt-3 pb-1 text-xs font-bold uppercase tracking-widest" style={{ color: theme.textMuted }}>Theme</p>
                    {Object.entries(allThemes).map(([key, t]) => {
                      const Icon = THEME_ICONS[key] || Palette;
                      return (
                        <button
                          key={key}
                          onClick={() => { changeTheme(key); setThemeMenuOpen(false); }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                          style={{ color: themeName === key ? t.primary : theme.text, fontWeight: themeName === key ? 700 : 500 }}
                        >
                          <span className="w-4 h-4 rounded-full" style={{ background: t.gradient }} />
                          {t.name}
                          {themeName === key && <span className="ml-auto text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(ROUTES.PRODUCTS)}
              className="relative p-2 rounded-full transition-colors hover:bg-black/5"
              style={{ color: theme.primary }}
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold text-white rounded-full flex items-center justify-center" style={{ background: theme.secondary }}>
                  {wishlist.length}
                </span>
              )}
            </motion.button>

            {/* Cart */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCartOpen}
              className="relative p-2 rounded-full transition-colors hover:bg-black/5"
              style={{ color: theme.primary }}
            >
              <ShoppingCart size={20} />
              {cartSummary.totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 text-[10px] font-bold text-white rounded-full flex items-center justify-center"
                  style={{ background: theme.gradient }}
                >
                  {cartSummary.totalItems}
                </motion.span>
              )}
            </motion.button>

            {/* User */}
            {user ? (
              <div ref={userMenuRef} className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen((p) => !p)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full transition-all hover:bg-black/5"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: theme.gradient }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-semibold" style={{ color: theme.text }}>{user.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} style={{ color: theme.textMuted }} />
                </motion.button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border overflow-hidden"
                      style={{ borderColor: theme.border }}
                    >
                      <div className="px-4 py-3 border-b" style={{ borderColor: theme.border }}>
                        <p className="font-bold text-sm" style={{ color: theme.text }}>{user.name}</p>
                        <p className="text-xs" style={{ color: theme.textMuted }}>{user.email}</p>
                      </div>
                      {[
                        { icon: User, label: 'My Profile', to: ROUTES.PROFILE },
                        { icon: Package, label: 'My Orders', to: ROUTES.ORDERS },
                        ...(isAdmin ? [{ icon: LayoutDashboard, label: 'Admin Panel', to: ROUTES.ADMIN }] : []),
                      ].map(({ icon: Icon, label, to }) => (
                        <Link key={to} to={to} onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                          style={{ color: theme.text }}>
                          <Icon size={16} style={{ color: theme.primary }} /> {label}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-red-50 transition-colors border-t"
                        style={{ color: '#EF4444', borderColor: theme.border }}
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAuthOpen}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white transition-all"
                style={{ background: theme.gradient }}
              >
                <User size={16} /> Login
              </motion.button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="lg:hidden p-2 rounded-full hover:bg-black/5 transition-colors"
              style={{ color: theme.primary }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" size={16} style={{ color: theme.primary }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search toys..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm border-2 focus:outline-none transition-all"
              style={{ borderColor: theme.border, color: theme.text, background: 'white' }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t overflow-hidden"
            style={{ borderColor: theme.border, background: theme.bg }}
          >
            <nav className="flex flex-col gap-1 px-4 py-4">
              <NavLink to={ROUTES.HOME}>🏠 Home</NavLink>
              <NavLink to={ROUTES.PRODUCTS}>🛍️ Shop All Toys</NavLink>
              {user && <NavLink to={ROUTES.ORDERS}>📦 My Orders</NavLink>}
              {user && <NavLink to={ROUTES.PROFILE}>👤 My Profile</NavLink>}
              {isAdmin && <NavLink to={ROUTES.ADMIN}>⚙️ Admin Panel</NavLink>}
              {!user && (
                <button
                  onClick={() => { onAuthOpen(); setMobileOpen(false); }}
                  className="text-left text-sm font-semibold py-2"
                  style={{ color: theme.primary }}
                >
                  🔑 Login / Register
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
