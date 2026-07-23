import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useProducts } from '../context/ProductContext';
import ProductGrid from '../components/products/ProductGrid';
import ProductFilters from '../components/products/ProductFilters';
import Button from '../components/common/Button';

const Products = () => {
  const { theme } = useTheme();
  const { filteredProducts, searchQuery, setSearchQuery, selectedCategory, resetFilters } = useProducts();
  const [showFilters, setShowFilters] = useState(false);

  const hasFilters = searchQuery || selectedCategory;

  return (
    <div className="min-h-screen pt-20 pb-16" style={{ background: theme.bg }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="py-8">
          <h1 className="text-3xl md:text-4xl font-black mb-2" style={{ color: theme.text }}>
            {selectedCategory ? `${selectedCategory.replace(/-/g, ' ')}` : 'All Toys'} 🧸
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Showing <span className="font-bold" style={{ color: theme.primary }}>{filteredProducts.length}</span> products
            </p>
            {searchQuery && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${theme.primary}15`, color: theme.primary }}>
                <Search size={12} /> "{searchQuery}"
                <button onClick={() => setSearchQuery('')}><X size={12} /></button>
              </span>
            )}
            {hasFilters && (
              <button onClick={resetFilters} className="text-xs underline font-semibold" style={{ color: theme.textMuted }}>
                Clear all filters
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <ProductFilters />
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filter Toggle */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <Button
                variant="secondary"
                size="sm"
                icon={SlidersHorizontal}
                onClick={() => setShowFilters(true)}
              >
                Filters
              </Button>
            </div>

            <ProductGrid products={filteredProducts} />
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 overflow-y-auto p-4 shadow-2xl"
            >
              <ProductFilters onClose={() => setShowFilters(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
