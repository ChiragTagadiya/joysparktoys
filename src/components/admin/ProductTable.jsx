import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Eye, Package, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useProducts } from '../../context/ProductContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice, formatDiscount } from '../../utils/formatters';
import { getProductRoute } from '../../constants/routes';
import Badge from '../common/Badge';

const ProductTable = ({ onEdit }) => {
  const { theme } = useTheme();
  const { allProducts, deleteProduct, productsLoading, productsError, fetchProducts } = useProducts();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = allProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    const { error } = await deleteProduct(id);
    setDeleteConfirm(null);
    if (error) addToast(`Delete failed: ${error.message}`, 'error');
    else addToast('Product deleted', 'success');
  };

  return (
    <div>
      {productsError && (
        <div className="rounded-2xl border px-4 py-3 mb-4 flex items-center justify-between gap-3" style={{ borderColor: theme.border, background: '#FEF2F2' }}>
          <p className="text-xs font-bold" style={{ color: '#991B1B' }}>
            Failed to load products: {productsError}
          </p>
          <button
            onClick={fetchProducts}
            className="px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: theme.primary, color: 'white' }}
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: theme.primary }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none"
            style={{ borderColor: theme.border, color: theme.text }}
          />
        </div>
        <span className="text-sm font-semibold" style={{ color: theme.textMuted }}>
          {productsLoading ? 'Loading…' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: theme.border }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: theme.bg }}>
              {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <Package size={40} className="mx-auto mb-3 opacity-20" style={{ color: theme.textMuted }} />
                  <p className="font-semibold" style={{ color: theme.textMuted }}>No products found</p>
                </td>
              </tr>
            ) : (
              filtered.map((product, i) => {
                const discount = formatDiscount(product.originalPrice, product.price);
                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-t hover:bg-gray-50 transition-colors"
                    style={{ borderColor: theme.border }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0] || 'https://placehold.co/48x48?text=No+Image'}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover bg-gray-100"
                        />
                        <div>
                          <p className="font-semibold line-clamp-1" style={{ color: theme.text }}>{product.name}</p>
                          <p className="text-xs" style={{ color: theme.textMuted }}>{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-lg text-xs font-semibold capitalize" style={{ background: `${theme.primary}15`, color: theme.primary }}>
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold" style={{ color: theme.primary }}>{formatPrice(product.price)}</p>
                      {discount > 0 && (
                        <p className="text-xs line-through" style={{ color: theme.textMuted }}>{formatPrice(product.originalPrice)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="font-semibold text-xs px-2 py-1 rounded-lg"
                        style={{
                          background: product.stock > 10 ? '#D1FAE5' : product.stock > 0 ? '#FEF3C7' : '#FEE2E2',
                          color: product.stock > 10 ? '#065F46' : product.stock > 0 ? '#92400E' : '#991B1B',
                        }}
                      >
                        {product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {product.featured && <Badge type="hot">Featured</Badge>}
                        {product.bestSeller && <Badge type="best">Best Seller</Badge>}
                        {!product.featured && !product.bestSeller && (
                          <span className="text-xs" style={{ color: theme.textMuted }}>—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(getProductRoute(product.id))}
                          className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="View"
                          style={{ color: '#3B82F6' }}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => onEdit(product)}
                          className="p-2 rounded-lg hover:bg-amber-50 transition-colors"
                          title="Edit"
                          style={{ color: '#F59E0B' }}
                        >
                          <Pencil size={15} />
                        </button>
                        {deleteConfirm === product.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(product.id)} className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-bold">Yes</button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded-lg bg-gray-200 text-gray-700 text-xs">No</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(product.id)}
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete"
                            style={{ color: '#EF4444' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
