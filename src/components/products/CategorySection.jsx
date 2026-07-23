import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useProducts } from '../../context/ProductContext';
import { CATEGORIES } from '../../data/categories';
import { ROUTES } from '../../constants/routes';

const CategorySection = () => {
  const { theme } = useTheme();
  const { setSelectedCategory } = useProducts();
  const navigate = useNavigate();

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    navigate(ROUTES.PRODUCTS);
  };

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-black mb-6" style={{ color: theme.text }}>
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCategoryClick(cat.id)}
              className="relative flex flex-col items-center gap-3 p-4 rounded-3xl transition-all group"
              style={{
                background: `${cat.color}15`,
                border: `2px solid ${cat.color}30`,
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform group-hover:scale-110"
                style={{ background: `${cat.color}20` }}
              >
                {cat.icon}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold leading-tight" style={{ color: theme.text }}>{cat.name}</p>
                <p className="text-[10px] mt-0.5 hidden sm:block" style={{ color: theme.textMuted }}>{cat.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
