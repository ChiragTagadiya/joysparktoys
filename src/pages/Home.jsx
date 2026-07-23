import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Gift, Zap, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useProducts } from '../context/ProductContext';
import { ROUTES } from '../constants/routes';
import HeroScroll from '../components/products/HeroScroll';
import CategorySection from '../components/products/CategorySection';
import Button from '../components/common/Button';

const FLOATING_EMOJIS = ['🧸', '🎮', '🚀', '🎨', '🏆', '🎲', '🚗', '⭐', '🎪', '🦸'];
const FLOATING_CONFIG = FLOATING_EMOJIS.map((emoji, i) => ({
  emoji,
  delay: i * 1.5,
  x: (i * 9.5) + 2,
  duration: 8 + i * 0.8,
}));

const FloatingEmoji = ({ emoji, delay, x, duration }) => (
  <motion.div
    className="absolute text-3xl select-none pointer-events-none"
    style={{ left: `${x}%`, top: '-2rem' }}
    animate={{ y: ['0vh', '110vh'], rotate: [0, 360], opacity: [0, 0.7, 0] }}
    transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
  >
    {emoji}
  </motion.div>
);

const StatCard = ({ icon: Icon, value, label, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="flex flex-col items-center gap-2 p-6 bg-white rounded-3xl shadow-lg"
  >
    <div className="p-3 rounded-2xl" style={{ background: `${color}15` }}>
      <Icon size={28} style={{ color }} />
    </div>
    <p className="text-3xl font-black" style={{ color }}>{value}</p>
    <p className="text-sm font-semibold text-gray-500 text-center">{label}</p>
  </motion.div>
);

const Home = () => {
  const { theme } = useTheme();
  const { setSelectedCategory, resetFilters, featuredProducts, bestSellers } = useProducts();
  const navigate = useNavigate();

  const handleShopAll = () => {
    resetFilters();
    navigate(ROUTES.PRODUCTS);
  };

  return (
    <div className="min-h-screen" style={{ background: theme.bg }}>
      {/* Hero Section */}
      <section
        className="relative min-h-[90vh] flex items-center overflow-hidden"
        style={{ background: theme.heroGradient }}
      >
        {/* Floating Emojis Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {FLOATING_CONFIG.map((cfg, i) => (
            <FloatingEmoji key={i} {...cfg} />
          ))}
        </div>

        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-20"
        >
          {/* Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6"
              style={{ background: `${theme.primary}20`, color: theme.primary }}
            >
              <Sparkles size={14} />
              India's Most Loved Toy Store
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-black leading-tight mb-4"
              style={{ color: theme.text }}
            >
              Where
              <span className="block" style={{ background: theme.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Play Begins!
              </span>
              🧸
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl mb-8 leading-relaxed"
              style={{ color: theme.textMuted }}
            >
              Discover 500+ handpicked toys that spark imagination, creativity, and endless joy for children of all ages. Quality guaranteed. Delivered across India.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              <Button size="xl" variant="primary" onClick={handleShopAll} iconRight={ArrowRight}>
                Shop Now
              </Button>
              <Button size="xl" variant="secondary" onClick={() => { setSelectedCategory('educational'); navigate(ROUTES.PRODUCTS); }}>
                🔬 Educational Toys
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4 text-sm font-semibold"
              style={{ color: theme.textMuted }}
            >
              {['✅ Free Shipping', '🔄 24-hr Refund', '� Cash on Delivery', '🇮🇳 India Shipping'].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </motion.div>
          </div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', damping: 20 }}
            className="hidden lg:flex items-center justify-center relative"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[200px] select-none filter drop-shadow-2xl"
            >
              🧸
            </motion.div>
            {/* Orbiting badges */}
            {[
              { emoji: '🎮', pos: 'top-0 left-0', delay: 0 },
              { emoji: '🚀', pos: 'top-8 right-0', delay: 0.5 },
              { emoji: '🎨', pos: 'bottom-8 left-4', delay: 1 },
              { emoji: '🏆', pos: 'bottom-0 right-8', delay: 1.5 },
            ].map(({ emoji, pos, delay: d }) => (
              <motion.div
                key={emoji}
                animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2 + d, repeat: Infinity, delay: d }}
                className={`absolute text-4xl ${pos}`}
              >
                {emoji}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '80px' }}>
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill={theme.bg} />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12" style={{ background: theme.bg }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Gift} value="500+" label="Curated Toys" color={theme.primary} />
            <StatCard icon={Sparkles} value="50K+" label="Happy Kids" color={theme.secondary} />
            <StatCard icon={Zap} value="4.8★" label="Avg Rating" color="#F59E0B" />
            <StatCard icon={Shield} value="100%" label="Safe Products" color="#10B981" />
          </div>
        </div>
      </section>

      {/* Featured - Horizontal Scroll */}
      <div style={{ background: theme.bg }}>
        <HeroScroll products={featuredProducts} title="✨ Featured Picks" />
      </div>

      {/* Categories */}
      <div style={{ background: theme.bg }}>
        <CategorySection />
      </div>

      {/* Best Sellers */}
      <div style={{ background: theme.bg }}>
        <HeroScroll products={bestSellers} title="🔥 Best Sellers" />
      </div>

      {/* Promo Banner */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-8 md:p-12 overflow-hidden text-white text-center"
            style={{ background: theme.gradient }}
          >
            <div className="absolute inset-0 opacity-10 text-[8rem] flex items-center justify-around select-none pointer-events-none">
              {'🧸🎮🚀🎨🏆'.split('').map((e, i) => <span key={i}>{e}</span>)}
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Limited Time Offer</p>
              <h2 className="text-3xl md:text-5xl font-black mb-4">Up to 40% OFF<br />on Best Sellers! 🎉</h2>
              <p className="text-lg opacity-90 mb-8">Plus free shipping on orders above ₹499</p>
              <Button
                variant="ghost"
                size="xl"
                onClick={handleShopAll}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/50 text-white"
              >
                Shop the Sale →
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Little Joy */}
      <section className="py-12" style={{ background: theme.bg }}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-black text-center mb-10" style={{ color: theme.text }}>Why Parents Love Joy Spark Toys</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🧪', title: 'Safety First', desc: 'All toys are BIS certified and made from non-toxic, child-safe materials.' },
              { icon: '🎁', title: 'Gift Ready', desc: 'Beautiful packaging makes every order gift-ready for special occasions.' },
              { icon: '🚚', title: 'Fast Delivery', desc: 'Pan-India delivery with reliable partners. Track your order in real time.' },
              { icon: '💬', title: 'Expert Curation', desc: 'Each toy is handpicked by child development experts and parents.' },
              { icon: '🔄', title: '24-hr Refund', desc: 'Wrong or damaged item? Get a full refund within 24 hours, no questions asked.' },
              { icon: '�', title: 'Cash on Delivery', desc: 'No prepayment needed. Pay in cash when your order arrives at your door.' },
            ].map(({ icon, title, desc }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 rounded-3xl bg-white shadow-sm border flex gap-4"
                style={{ borderColor: theme.border }}
              >
                <span className="text-4xl shrink-0">{icon}</span>
                <div>
                  <h3 className="font-bold text-base mb-1" style={{ color: theme.text }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
