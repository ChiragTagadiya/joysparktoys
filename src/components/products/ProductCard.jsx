import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice, formatDiscount } from '../../utils/formatters';
import { getProductRoute } from '../../constants/routes';
import { isOnSale } from '../../services/products.service';
import StarRating from '../common/StarRating';
import Badge from '../common/Badge';
import Button from '../common/Button';

const ProductCard = ({ product }) => {
  const { theme } = useTheme();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const discount = formatDiscount(product.originalPrice, product.price);
  const inWishlist = isInWishlist(product.id);
  const isOOS = product.stock === 0;
  const saleLive = isOnSale(product);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOOS) return;
    addToCart(product);
    addToast(`${product.name} added to cart! 🛒`, 'success');
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product.id);
    addToast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist ❤️', inWishlist ? 'info' : 'success');
  };

  const handleView = (e) => {
    e.stopPropagation();
    navigate(getProductRoute(product.id));
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => navigate(getProductRoute(product.id))}
      className="relative bg-white rounded-3xl overflow-hidden cursor-pointer group"
      style={{
        boxShadow: hovered
          ? `0 20px 40px ${theme.primary}25`
          : '0 4px 16px rgba(0,0,0,0.08)',
        border: `2px solid ${hovered ? theme.primaryLight : theme.border}`,
        transition: 'box-shadow 0.3s, border-color 0.3s',
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
        )}
        <img
          src={product.images?.[0] || 'https://placehold.co/300x300?text=Toy'}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-500 ${hovered ? 'scale-110' : 'scale-100'} ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {saleLive && product.discountLabel && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black text-white animate-pulse" style={{ background: '#EF4444' }}>
              🔥 {product.discountLabel}
            </span>
          )}
          {discount > 0 && !saleLive && <Badge type="sale">{discount}% OFF</Badge>}
          {discount > 0 && saleLive && <Badge type="sale">{discount}% OFF</Badge>}
          {product.bestSeller && <Badge type="best">Best Seller</Badge>}
          {product.newArrival && !product.bestSeller && <Badge type="hot">🆕 New</Badge>}
          {product.featured && !product.bestSeller && !product.newArrival && <Badge type="hot">🔥 Hot</Badge>}
          {isOOS && <Badge type="outofstock">Out of Stock</Badge>}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 10 }}
          className="absolute top-3 right-3 flex flex-col gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWishlist}
            className="p-2 rounded-full shadow-lg transition-all"
            style={{ background: inWishlist ? '#FEE2E2' : 'white', color: inWishlist ? '#EF4444' : '#6B7280' }}
          >
            <Heart size={16} fill={inWishlist ? '#EF4444' : 'none'} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleView}
            className="p-2 rounded-full bg-white shadow-lg text-gray-600 hover:text-gray-900 transition-all"
          >
            <Eye size={16} />
          </motion.button>
        </motion.div>

        {/* Add to Cart Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <Button
            onClick={handleAddToCart}
            disabled={isOOS}
            fullWidth
            size="sm"
            icon={isOOS ? undefined : ShoppingCart}
            glow={!isOOS}
            className="!rounded-2xl !font-bold"
          >
            {isOOS ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: theme.primary }}>
          {product.brand}
        </p>
        <h3 className="text-sm font-bold leading-snug mb-2 line-clamp-2" style={{ color: theme.text }}>
          {product.name}
        </h3>

        <StarRating rating={product.rating} reviews={product.reviewCount} size={12} />

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black" style={{ color: theme.primary }}>{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="text-xs line-through text-gray-400">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            disabled={isOOS}
            className="p-2.5 rounded-2xl text-white shadow-md transition-all disabled:opacity-50"
            style={{ background: theme.gradient }}
          >
            <Zap size={14} />
          </motion.button>
        </div>

        <p className="text-[10px] mt-1.5" style={{ color: theme.textMuted }}>
          Age: {product.ageGroup}
        </p>
      </div>
    </motion.div>
  );
};

export default ProductCard;
