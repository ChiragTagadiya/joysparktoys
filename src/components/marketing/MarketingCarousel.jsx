import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Skeleton = () => (
  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
);

const MARKETING_ITEMS = [
  {
    id: 1,
    type: 'image',
    src: 'https://images.unsplash.com/photo-1558060370-d644479cb6f0?w=800&auto=format&fit=crop&q=60',
    title: '🎉 New Arrivals',
    subtitle: 'Discover the latest toys for your little ones',
    cta: 'Shop Now',
    link: '/products',
  },
  {
    id: 2,
    type: 'video',
    src: 'https://videos.pexels.com/video-files/855029/855029-hd_1920_1080_30fps.mp4',
    poster: 'https://images.unsplash.com/photo-1566576912902-48f5304e1f09?w=800&auto=format&fit=crop&q=60',
    title: '🚗 Unbox Fun',
    subtitle: 'Watch the joy of unboxing in action',
    cta: 'Explore',
    link: '/products',
  },
  {
    id: 3,
    type: 'image',
    src: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=60',
    title: '🔥 Best Sellers',
    subtitle: 'Top-rated toys loved by kids and parents',
    cta: 'View Best Sellers',
    link: '/products',
  },
  {
    id: 4,
    type: 'image',
    src: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&auto=format&fit=crop&q=60',
    title: '💰 Big Savings',
    subtitle: 'Up to 40% off on selected items',
    cta: 'Grab Deals',
    link: '/products',
  },
];

const MarketingCarousel = ({ items = MARKETING_ITEMS }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState({});
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRefs = useRef({});
  const containerRef = useRef(null);
  const sectionRef = useRef(null);
  const intervalRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  const itemCount = items.length;
  if (itemCount === 0) return null;

  const next = useCallback(() => setIndex((i) => (i + 1) % itemCount), [itemCount]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + itemCount) % itemCount), [itemCount]);

  useEffect(() => {
    if (!isVisible || isPaused || isInteracting || !items[index]) return;
    if (items[index].type !== 'image') return;
    intervalRef.current = setInterval(next, 5000);
    return () => clearInterval(intervalRef.current);
  }, [isVisible, isPaused, isInteracting, index, items, next]);

  useEffect(() => {
    if (index >= items.length) { setIndex(0); return; }
    const container = containerRef.current;
    const item = container?.children[index];
    if (container && item) {
      container.scrollTo({ left: item.offsetLeft, behavior: 'smooth' });
    }
  }, [index, items]);

  useEffect(() => {
    Object.values(videoRefs.current).forEach((v) => { if (v) v.pause(); });
    const activeItem = items[index];
    if (!isVisible || !activeItem || activeItem.type !== 'video') return;
    const activeVideo = videoRefs.current[activeItem.id];
    if (activeVideo) {
      activeVideo.muted = muted;
      activeVideo.play().catch(() => {});
    }
  }, [index, muted, items, isVisible]);

  const updateIndexFromScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const children = Array.from(container.children);
    const containerCenter = container.scrollLeft + container.offsetWidth / 2;
    const closest = children.reduce((best, child, i) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(childCenter - containerCenter);
      return dist < best.dist ? { dist, i } : best;
    }, { dist: Infinity, i: 0 });
    setIndex(closest.i);
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(updateIndexFromScroll, 80);
  }, [updateIndexFromScroll]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.25 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const handleVideoEnded = useCallback(() => {
    next();
  }, [next]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden pt-28"
      style={{ background: theme.bg }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div
          ref={containerRef}
          className="relative flex overflow-x-auto scrollbar-hide snap-x snap-mandatory rounded-3xl"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
          onScroll={handleScroll}
          onMouseDown={() => setIsInteracting(true)}
          onMouseUp={() => setIsInteracting(false)}
          onMouseLeave={() => setIsInteracting(false)}
          onTouchStart={() => setIsInteracting(true)}
          onTouchEnd={() => setIsInteracting(false)}
        >
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              className="snap-start shrink-0 w-full aspect-[16/9] md:aspect-[21/9] relative rounded-3xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {!loaded[item.id] && <Skeleton />}
              {item.type === 'video' ? (
                <video
                  ref={(el) => { videoRefs.current[item.id] = el; }}
                  src={item.src}
                  poster={item.poster}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${loaded[item.id] ? 'opacity-100' : 'opacity-0'}`}
                  loop={false}
                  muted={muted}
                  playsInline
                  controls={false}
                  onLoadedData={() => setLoaded((p) => ({ ...p, [item.id]: true }))}
                  onEnded={handleVideoEnded}
                />
              ) : (
                <motion.img
                  src={item.src}
                  alt={item.title}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${loaded[item.id] ? 'opacity-100' : 'opacity-0'}`}
                  animate={loaded[item.id] ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  onLoad={() => setLoaded((p) => ({ ...p, [item.id]: true }))}
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col items-start gap-3">
                <motion.h3
                  key={`title-${item.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-2xl md:text-4xl font-black text-white"
                >
                  {item.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-sm md:text-lg text-white/90 font-medium"
                >
                  {item.subtitle}
                </motion.p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.link)}
                  className="mt-2 px-6 py-2.5 rounded-full bg-white text-sm font-black shadow-lg"
                  style={{ color: theme.primary }}
                >
                  {item.cta} →
                </motion.button>
              </div>

              {item.type === 'video' && (
                <button
                  onClick={() => setMuted((m) => !m)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white backdrop-blur-sm"
                >
                  {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === index ? '2rem' : '0.5rem',
                background: i === index ? theme.primary : theme.border,
              }}
            />
          ))}
        </div>

        <button
          onClick={prev}
          aria-label="Previous"
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md hover:scale-110 transition-transform z-10"
          style={{ color: theme.primary }}
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={next}
          aria-label="Next"
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md hover:scale-110 transition-transform z-10"
          style={{ color: theme.primary }}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
};

export default MarketingCarousel;
