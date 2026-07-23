import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import ProductCard from './ProductCard';

const HeroScroll = ({ products = [], title = 'Featured Products' }) => {
  const { theme } = useTheme();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(null);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, [checkScroll]);

  const scroll = useCallback((dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, scrollLeft: scrollRef.current.scrollLeft };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    scrollRef.current.scrollLeft = dragStart.current.scrollLeft - dx;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStart.current = null;
  };

  const handleTouchStart = (e) => {
    dragStart.current = { x: e.touches[0].clientX, scrollLeft: scrollRef.current.scrollLeft };
  };

  const handleTouchMove = (e) => {
    if (!dragStart.current) return;
    const dx = e.touches[0].clientX - dragStart.current.x;
    scrollRef.current.scrollLeft = dragStart.current.scrollLeft - dx;
  };

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-black" style={{ color: theme.text }}>
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scroll(-1)}
              disabled={!canScrollLeft}
              className="p-2.5 rounded-full border-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                borderColor: theme.primary,
                color: theme.primary,
                background: canScrollLeft ? `${theme.primary}10` : 'transparent',
              }}
            >
              <ChevronLeft size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scroll(1)}
              disabled={!canScrollRight}
              className="p-2.5 rounded-full border-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                borderColor: theme.primary,
                color: theme.primary,
                background: canScrollRight ? `${theme.primary}10` : 'transparent',
              }}
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>
        </div>

        {/* Scroll Fade Indicators */}
        <div className="relative">
          <AnimatePresence>
            {canScrollLeft && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute left-0 top-0 bottom-0 w-16 pointer-events-none z-10"
                style={{ background: `linear-gradient(to right, ${theme.bg}, transparent)` }}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {canScrollRight && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none z-10"
                style={{ background: `linear-gradient(to left, ${theme.bg}, transparent)` }}
              />
            )}
          </AnimatePresence>

          <div
            ref={scrollRef}
            className={`flex gap-4 overflow-x-auto scrollbar-hide pb-4 ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => { dragStart.current = null; }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="shrink-0 w-64"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroScroll;
