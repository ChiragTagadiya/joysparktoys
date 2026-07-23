import { motion } from 'framer-motion';
import { X, SlidersHorizontal } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useProducts } from '../../context/ProductContext';
import { CATEGORIES } from '../../data/categories';
import appConfig from '../../config/app.config';
import Button from '../common/Button';

const SORT_OPTIONS = [
  { value: 'featured',     label: '⭐ Featured' },
  { value: 'price_asc',   label: '💰 Price: Low to High' },
  { value: 'price_desc',  label: '💸 Price: High to Low' },
  { value: 'rating',      label: '⭐ Top Rated' },
  { value: 'newest',      label: '🆕 Newest First' },
  { value: 'discount',    label: '🔥 Biggest Discount' },
];

const RATING_OPTIONS = [4, 3, 2];

const ProductFilters = ({ onClose }) => {
  const { theme } = useTheme();
  const { selectedCategory, setSelectedCategory, sortBy, setSortBy, filters, updateFilter, resetFilters } = useProducts();

  const hasActiveFilters =
    selectedCategory || filters.priceMin || filters.priceMax || filters.ageGroup || filters.rating || filters.onSale || sortBy !== 'featured';

  return (
    <div className="bg-white rounded-3xl p-5 shadow-md border" style={{ borderColor: theme.border }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} style={{ color: theme.primary }} />
          <h3 className="font-bold text-base" style={{ color: theme.text }}>Filters</h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: theme.primary }}>Active</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="xs" onClick={resetFilters}>Clear All</Button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
              <X size={16} style={{ color: theme.textMuted }} />
            </button>
          )}
        </div>
      </div>

      {/* Sort */}
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: theme.textMuted }}>Sort By</p>
        <div className="flex flex-col gap-1">
          {SORT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSortBy(value)}
              className="text-left px-3 py-2 rounded-xl text-sm transition-all"
              style={{
                background: sortBy === value ? `${theme.primary}15` : 'transparent',
                color: sortBy === value ? theme.primary : theme.text,
                fontWeight: sortBy === value ? 700 : 500,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: theme.textMuted }}>Category</p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setSelectedCategory('')}
            className="text-left px-3 py-2 rounded-xl text-sm transition-all"
            style={{
              background: !selectedCategory ? `${theme.primary}15` : 'transparent',
              color: !selectedCategory ? theme.primary : theme.text,
              fontWeight: !selectedCategory ? 700 : 500,
            }}
          >
            🎯 All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? '' : cat.id)}
              className="text-left px-3 py-2 rounded-xl text-sm transition-all"
              style={{
                background: selectedCategory === cat.id ? `${theme.primary}15` : 'transparent',
                color: selectedCategory === cat.id ? theme.primary : theme.text,
                fontWeight: selectedCategory === cat.id ? 700 : 500,
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: theme.textMuted }}>Price Range (₹)</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin}
            onChange={(e) => updateFilter('priceMin', e.target.value)}
            className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
            style={{ borderColor: theme.border, color: theme.text }}
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax}
            onChange={(e) => updateFilter('priceMax', e.target.value)}
            className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
            style={{ borderColor: theme.border, color: theme.text }}
          />
        </div>
      </div>

      {/* Age Group */}
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: theme.textMuted }}>Age Group</p>
        <div className="flex flex-wrap gap-2">
          {appConfig.ageGroups.map((age) => (
            <button
              key={age}
              onClick={() => updateFilter('ageGroup', filters.ageGroup === age ? '' : age)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
              style={{
                borderColor: filters.ageGroup === age ? theme.primary : theme.border,
                background: filters.ageGroup === age ? theme.primary : 'transparent',
                color: filters.ageGroup === age ? 'white' : theme.text,
              }}
            >
              {age}
            </button>
          ))}
        </div>
      </div>

      {/* Min Rating */}
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: theme.textMuted }}>Minimum Rating</p>
        <div className="flex gap-2">
          {RATING_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => updateFilter('rating', filters.rating === String(r) ? '' : String(r))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
              style={{
                borderColor: filters.rating === String(r) ? '#F59E0B' : theme.border,
                background: filters.rating === String(r) ? '#FEF3C7' : 'transparent',
                color: filters.rating === String(r) ? '#B45309' : theme.text,
              }}
            >
              ⭐ {r}+
            </button>
          ))}
        </div>
      </div>

      {/* On Sale */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: theme.textMuted }}>Promotions</p>
        <button
          onClick={() => updateFilter('onSale', filters.onSale ? '' : 'true')}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border-2 w-full justify-center transition-all"
          style={{
            borderColor: filters.onSale ? '#EF4444' : theme.border,
            background: filters.onSale ? '#FEF2F2' : 'transparent',
            color: filters.onSale ? '#EF4444' : theme.text,
          }}
        >
          🔥 On Sale Now
        </button>
      </div>
    </div>
  );
};

export default ProductFilters;
