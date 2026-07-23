import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { useTheme } from '../../context/ThemeContext';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const ProductGrid = ({ products = [], emptyMessage = 'No products found' }) => {
  const { theme } = useTheme();

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <span className="text-7xl">🔍</span>
        <p className="text-xl font-bold" style={{ color: theme.text }}>{emptyMessage}</p>
        <p className="text-sm" style={{ color: theme.textMuted }}>Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={itemVariants}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProductGrid;
