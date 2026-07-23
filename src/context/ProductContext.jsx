import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { ProductsService, isOnSale } from '../services/products.service';

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [filters, setFilters] = useState({ priceMin: '', priceMax: '', ageGroup: '', rating: '', onSale: '' });

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    const { data, error } = await ProductsService.getAll();
    if (error) setProductsError(error.message);
    else setAllProducts(data || []);
    setProductsLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const addProduct = useCallback(async (product) => {
    const { data, error } = await ProductsService.create(product);
    if (!error && data) setAllProducts((prev) => [data, ...prev]);
    return { data, error };
  }, []);

  const updateProduct = useCallback(async (id, updates) => {
    const { data, error } = await ProductsService.update(id, updates);
    if (!error && data) setAllProducts((prev) => prev.map((p) => p.id === id ? data : p));
    return { data, error };
  }, []);

  const deleteProduct = useCallback(async (id) => {
    const { error } = await ProductsService.delete(id);
    if (!error) setAllProducts((prev) => prev.filter((p) => p.id !== id));
    return { error };
  }, []);

  const featuredProducts = useMemo(() => allProducts.filter((p) => p.featured).slice(0, 10), [allProducts]);
  const bestSellers = useMemo(() => allProducts.filter((p) => p.bestSeller || p.best_seller).slice(0, 10), [allProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.tags?.some((t) => t.includes(q))
      );
    }

    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (filters.priceMin) result = result.filter((p) => p.price >= Number(filters.priceMin));
    if (filters.priceMax) result = result.filter((p) => p.price <= Number(filters.priceMax));
    if (filters.ageGroup) result = result.filter((p) => p.ageGroup === filters.ageGroup);
    if (filters.rating) result = result.filter((p) => p.rating >= Number(filters.rating));
    if (filters.onSale) result = result.filter((p) => isOnSale(p));

    switch (sortBy) {
      case 'price_asc':  result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating':     result.sort((a, b) => b.rating - a.rating); break;
      case 'newest':     result.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')); break;
      case 'featured':   result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
      case 'discount': {
        const pct = (p) => p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
        result.sort((a, b) => pct(b) - pct(a));
        break;
      }
      default: break;
    }

    return result;
  }, [allProducts, searchQuery, selectedCategory, sortBy, filters]);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ priceMin: '', priceMax: '', ageGroup: '', rating: '', onSale: '' });
    setSelectedCategory('');
    setSortBy('featured');
    setSearchQuery('');
  }, []);

  return (
    <ProductContext.Provider value={{
      allProducts, featuredProducts, bestSellers,
      productsLoading, productsError, fetchProducts,
      filteredProducts,
      searchQuery, setSearchQuery,
      selectedCategory, setSelectedCategory,
      sortBy, setSortBy,
      filters, updateFilter, resetFilters,
      addProduct, updateProduct, deleteProduct,
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within ProductProvider');
  return ctx;
};
