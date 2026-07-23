import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnnouncementsService } from '../../services/announcements.service';
import { useTheme } from '../../context/ThemeContext';

const TYPE_STYLES = {
  discount:    { bg: '#EF4444', text: '#fff' },
  trending:    { bg: '#F59E0B', text: '#fff' },
  new_arrival: { bg: '#10B981', text: '#fff' },
  promo:       { bg: '#8B5CF6', text: '#fff' },
  info:        { bg: '#3B82F6', text: '#fff' },
};

const DEFAULT_ITEMS = [
  { id: 'def1', text: 'FREE Shipping on orders above ₹499!', emoji: '🚚', type: 'promo' },
  { id: 'def2', text: 'Up to 40% OFF on Best Sellers!',      emoji: '🔥', type: 'discount' },
  { id: 'def3', text: 'New Arrivals Every Week',              emoji: '🆕', type: 'new_arrival' },
];

const AnnouncementBar = () => {
  const { theme } = useTheme();
  const [items, setItems] = useState([]);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    AnnouncementsService.getActive().then(({ data }) => {
      setItems(data?.length ? data : DEFAULT_ITEMS);
    });
  }, []);

  const startTimer = (list) => {
    if (list.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % list.length);
    }, 6000);
  };

  useEffect(() => {
    if (items.length > 0) startTimer(items);
    return () => clearInterval(timerRef.current);
  }, [items]);

  const go = (dir) => {
    clearInterval(timerRef.current);
    setCurrent((prev) => (prev + dir + items.length) % items.length);
    startTimer(items);
  };

  if (items.length === 0) return null;

  const item = items[current];

  return (
    <div className="sticky top-0 z-50">
      <motion.div
        className="relative flex items-center justify-between px-4 overflow-hidden border-b"
        style={{
          background: theme.gradient,
          color: 'white',
          height: '56px',
          minHeight: '56px',
          borderColor: `${theme.primary}35`,
        }}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.18), transparent 40%), radial-gradient(circle at 90% 70%, rgba(255,255,255,0.12), transparent 45%)',
            mixBlendMode: 'overlay',
          }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />

      {/* Chevron Left */}
      {items.length > 1 && (
        <button onClick={() => go(-1)} className="shrink-0 opacity-70 hover:opacity-100 p-1">
          <ChevronLeft size={14} />
        </button>
      )}

      {/* Animated Text */}
      <div className="flex-1 overflow-hidden text-center mx-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={current}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="text-xs sm:text-sm font-black tracking-wide truncate"
          >
            {item?.emoji && (
              <motion.span
                className="mr-1 sm:mr-2 inline-block shrink-0"
                animate={{ rotate: [0, -6, 6, 0], scale: [1, 1.08, 1, 1.04, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                {item.emoji}
              </motion.span>
            )}
            <span className="inline-flex items-center gap-1 sm:gap-2 truncate">
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black shrink-0" style={{ background: 'rgba(0,0,0,0.25)' }}>
                {(item?.type || 'info').replace(/_/g, ' ').toUpperCase()}
              </span>
              <span className="truncate">{item?.text}</span>
            </span>
            {item?.link && (
              <a href={item.link} className="hidden sm:inline ml-2 underline underline-offset-4 opacity-90 font-black shrink-0">Shop →</a>
            )}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Dots */}
      {items.length > 1 && (
        <div className="hidden sm:flex items-center gap-1 shrink-0 mr-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => { clearInterval(timerRef.current); setCurrent(i); startTimer(items); }}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{ background: i === current ? 'white' : 'rgba(255,255,255,0.4)' }}
            />
          ))}
        </div>
      )}

      {/* Chevron Right */}
      {items.length > 1 && (
        <button onClick={() => go(1)} className="shrink-0 opacity-70 hover:opacity-100 p-1">
          <ChevronRight size={14} />
        </button>
      )}

      </motion.div>
    </div>
  );
};

export default AnnouncementBar;
