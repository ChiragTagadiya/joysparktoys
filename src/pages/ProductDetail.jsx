import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Heart, ArrowLeft, Truck, Shield, RefreshCw,
  Minus, Plus, Share2, Tag, ChevronRight,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useProducts } from '../context/ProductContext';
import { formatPrice, formatDiscount } from '../utils/formatters';
import { ROUTES } from '../constants/routes';
import StarRating from '../components/common/StarRating';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import HeroScroll from '../components/products/HeroScroll';

const ProductDetail = () => {
  const { id } = useParams();
  const { theme } = useTheme();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const { allProducts } = useProducts();
  const product = allProducts.find((p) => p.id === id);
  const [selectedImg, setSelectedImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const related = allProducts.filter((p) => p.category === product?.category && p.id !== id).slice(0, 8);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-20" style={{ background: theme.bg }}>
        <span className="text-7xl">😕</span>
        <h2 className="text-2xl font-black" style={{ color: theme.text }}>Product not found</h2>
        <Button onClick={() => navigate(ROUTES.PRODUCTS)} icon={ArrowLeft}>Back to Shop</Button>
      </div>
    );
  }

  const discount = formatDiscount(product.originalPrice, product.price);
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    addToast(`${product.name} added to cart! 🛒`, 'success');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate(ROUTES.CHECKOUT);
  };

  return (
    <div className="min-h-screen pt-20 pb-16" style={{ background: theme.bg }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 py-4 text-sm flex-wrap">
          {[{ label: 'Home', to: ROUTES.HOME }, { label: 'Products', to: ROUTES.PRODUCTS }, { label: product.name }].map((crumb, i, arr) => (
            <span key={i} className="flex items-center gap-2">
              {crumb.to ? (
                <button onClick={() => navigate(crumb.to)} className="hover:underline font-medium" style={{ color: theme.primary }}>{crumb.label}</button>
              ) : (
                <span className="font-semibold line-clamp-1 max-w-[200px]" style={{ color: theme.textMuted }}>{crumb.label}</span>
              )}
              {i < arr.length - 1 && <ChevronRight size={14} style={{ color: theme.textMuted }} />}
            </span>
          ))}
        </div>

        {/* Product Main */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <motion.div
              key={selectedImg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square rounded-3xl overflow-hidden bg-gray-100 border-2"
              style={{ borderColor: theme.border }}
            >
              <img
                src={product.images?.[selectedImg] || 'https://placehold.co/600x600?text=No+Image'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            {product.images?.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className="w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all"
                    style={{ borderColor: selectedImg === i ? theme.primary : theme.border }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: theme.primary }}>{product.brand}</p>
              <h1 className="text-2xl md:text-3xl font-black leading-tight mb-3" style={{ color: theme.text }}>{product.name}</h1>
              <StarRating rating={product.rating} reviews={product.reviewCount} size={16} />
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {discount > 0 && <Badge type="sale">{discount}% OFF</Badge>}
              {product.bestSeller && <Badge type="best">Best Seller</Badge>}
              {product.featured && <Badge type="hot">🔥 Featured</Badge>}
              {product.stock === 0 && <Badge type="outofstock">Out of Stock</Badge>}
              {product.stock > 0 && product.stock <= 10 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: '#FEF3C7', color: '#B45309' }}>
                  Only {product.stock} left!
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black" style={{ color: theme.primary }}>{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-xl line-through text-gray-400">{formatPrice(product.originalPrice)}</span>
                  <span className="text-lg font-bold text-emerald-600">Save {formatPrice(product.originalPrice - product.price)}</span>
                </>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl" style={{ background: `${theme.primary}08` }}>
              <div><p className="text-xs" style={{ color: theme.textMuted }}>Age Group</p><p className="font-bold text-sm" style={{ color: theme.text }}>{product.ageGroup}</p></div>
              <div><p className="text-xs" style={{ color: theme.textMuted }}>Category</p><p className="font-bold text-sm capitalize" style={{ color: theme.text }}>{product.category}</p></div>
              <div><p className="text-xs" style={{ color: theme.textMuted }}>Availability</p><p className="font-bold text-sm" style={{ color: product.stock > 0 ? '#10B981' : '#EF4444' }}>{product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}</p></div>
              <div><p className="text-xs" style={{ color: theme.textMuted }}>Brand</p><p className="font-bold text-sm" style={{ color: theme.text }}>{product.brand}</p></div>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${theme.primary}12`, color: theme.primary }}>
                    <Tag size={10} /> {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-bold mb-2" style={{ color: theme.text }}>Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border-2 rounded-2xl overflow-hidden" style={{ borderColor: theme.border }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2.5 hover:bg-gray-50 transition-colors" style={{ color: theme.primary }}>
                    <Minus size={16} />
                  </button>
                  <span className="px-6 py-2.5 font-black text-lg" style={{ color: theme.text }}>{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="px-4 py-2.5 hover:bg-gray-50 transition-colors" style={{ color: theme.primary }}>
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  onClick={() => { toggleWishlist(product.id); addToast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist ❤️', 'success'); }}
                  className="p-3 rounded-2xl border-2 transition-all"
                  style={{
                    borderColor: inWishlist ? '#EF4444' : theme.border,
                    background: inWishlist ? '#FEF2F2' : 'transparent',
                    color: inWishlist ? '#EF4444' : theme.textMuted,
                  }}
                >
                  <Heart size={20} fill={inWishlist ? '#EF4444' : 'none'} />
                </button>
                <button className="p-3 rounded-2xl border-2 transition-all hover:bg-gray-50" style={{ borderColor: theme.border, color: theme.textMuted }}>
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                icon={ShoppingCart}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                Add to Cart
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                Buy Now ⚡
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: 'Free Delivery', sub: 'On orders ₹499+' },
                { icon: Shield, label: 'Safe & Certified', sub: 'BIS Certified' },
                { icon: RefreshCw, label: '24hr Return', sub: 'Damaged items' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-2xl text-center" style={{ background: `${theme.primary}08` }}>
                  <Icon size={18} style={{ color: theme.primary }} />
                  <p className="text-[11px] font-bold" style={{ color: theme.text }}>{label}</p>
                  <p className="text-[10px]" style={{ color: theme.textMuted }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-16">
          <div className="flex border-b mb-6" style={{ borderColor: theme.border }}>
            {['description', 'details'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className="px-6 py-3 text-sm font-bold capitalize transition-all border-b-2 -mb-px"
                style={{
                  borderColor: activeTab === t ? theme.primary : 'transparent',
                  color: activeTab === t ? theme.primary : theme.textMuted,
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base leading-relaxed"
            style={{ color: theme.textMuted }}
          >
            {activeTab === 'description' ? (
              <p>{product.description}</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Brand', value: product.brand },
                  { label: 'Age Group', value: product.ageGroup },
                  { label: 'Category', value: product.category },
                  { label: 'Stock', value: `${product.stock} units` },
                  { label: 'Rating', value: `${product.rating}/5` },
                  { label: 'Reviews', value: product.reviewCount?.toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label} className="p-4 rounded-2xl" style={{ background: `${theme.primary}08` }}>
                    <p className="text-xs font-bold mb-1" style={{ color: theme.textMuted }}>{label}</p>
                    <p className="font-bold" style={{ color: theme.text }}>{value}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <HeroScroll products={related} title="You May Also Like" />
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
