import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Tag, Calendar, Percent, X, CheckSquare, Square, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useProducts } from '../../context/ProductContext';
import { useToast } from '../../context/ToastContext';
import { ProductsService, isOnSale } from '../../services/products.service';
import { formatPrice, formatDate } from '../../utils/formatters';
import Button from '../common/Button';

const getSaleStatus = (product) => {
  if (!product.discountStart || !product.discountEnd) return 'none';
  const now = Date.now();
  const start = new Date(product.discountStart).getTime();
  const end = new Date(product.discountEnd).getTime();
  if (now < start) return 'upcoming';
  if (now > end) return 'expired';
  return 'active';
};

const STATUS_BADGE = {
  active:   { label: '🟢 Active',   bg: '#D1FAE5', color: '#065F46' },
  upcoming: { label: '🔵 Upcoming', bg: '#DBEAFE', color: '#1E40AF' },
  expired:  { label: '⚪ Expired',  bg: '#F3F4F6', color: '#6B7280' },
  none:     { label: '— No Sale',   bg: '#F9FAFB', color: '#9CA3AF' },
};

const DiscountManager = () => {
  const { theme } = useTheme();
  const { allProducts, fetchProducts, productsLoading, productsError } = useProducts();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [applying, setApplying] = useState(false);

  const [bulk, setBulk] = useState({
    discountPct: '',
    discountLabel: '',
    discountStart: '',
    discountEnd: '',
  });

  const [singleEdit, setSingleEdit] = useState(null);
  const [singleForm, setSingleForm] = useState({});
  const [savingSingle, setSavingSingle] = useState(false);

  const filtered = useMemo(() => {
    let list = [...allProducts];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      list = list.filter((p) => getSaleStatus(p) === statusFilter);
    }
    return list;
  }, [allProducts, search, statusFilter]);

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelected((prev) => prev.length === filtered.length ? [] : filtered.map((p) => p.id));
  };

  const handleBulkApply = async () => {
    if (!selected.length) return;
    if (!bulk.discountStart || !bulk.discountEnd) {
      addToast('Please set start and end dates.', 'error'); return;
    }
    setApplying(true);
    const { error } = await ProductsService.bulkUpdateDiscount(selected, {
      discountPct: Number(bulk.discountPct) || 0,
      discountLabel: bulk.discountLabel || (bulk.discountPct ? `${bulk.discountPct}% OFF` : 'ON SALE'),
      discountStart: bulk.discountStart,
      discountEnd: bulk.discountEnd,
    });
    setApplying(false);
    if (error) { addToast(`Error: ${error.message}`, 'error'); return; }
    addToast(`Discount applied to ${selected.length} product(s)! 🎉`, 'success');
    setSelected([]);
    setBulkMode(false);
    await fetchProducts();
  };

  const handleClearDiscount = async (id) => {
    const { error } = await ProductsService.clearDiscount(id);
    if (error) addToast(`Error: ${error.message}`, 'error');
    else { addToast('Discount removed.', 'success'); fetchProducts(); }
  };

  const openSingleEdit = (product) => {
    setSingleEdit(product.id);
    setSingleForm({
      discountLabel: product.discountLabel || '',
      discountPct: '',
      discountStart: product.discountStart ? product.discountStart.slice(0, 16) : '',
      discountEnd: product.discountEnd ? product.discountEnd.slice(0, 16) : '',
    });
  };

  const handleSingleSave = async () => {
    setSavingSingle(true);
    const product = allProducts.find((p) => p.id === singleEdit);
    if (!product) return;
    const base = product.originalPrice || product.price;
    const pct = Number(singleForm.discountPct);
    const newPrice = pct > 0 ? Math.round(base * (1 - pct / 100)) : undefined;
    const { error } = await ProductsService.update(singleEdit, {
      ...product,
      discountLabel: singleForm.discountLabel || (pct ? `${pct}% OFF` : 'ON SALE'),
      discountStart: singleForm.discountStart || null,
      discountEnd: singleForm.discountEnd || null,
      ...(newPrice !== undefined ? { price: newPrice, originalPrice: base } : {}),
    });
    setSavingSingle(false);
    if (error) addToast(`Error: ${error.message}`, 'error');
    else { addToast('Discount saved!', 'success'); setSingleEdit(null); fetchProducts(); }
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

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: theme.textMuted }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none"
            style={{ borderColor: theme.border, color: theme.text }}
          />
        </div>

        <div className="flex gap-2">
          {['all', 'active', 'upcoming', 'expired', 'none'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-full text-xs font-bold border transition-all"
              style={{
                borderColor: statusFilter === s ? theme.primary : theme.border,
                background: statusFilter === s ? theme.primary : 'transparent',
                color: statusFilter === s ? 'white' : theme.textMuted,
              }}
            >
              {s === 'all' ? '📋 All' : STATUS_BADGE[s]?.label}
            </button>
          ))}
        </div>

        <Button
          variant={bulkMode ? 'primary' : 'secondary'}
          size="sm"
          icon={Zap}
          onClick={() => { setBulkMode(!bulkMode); setSelected([]); }}
        >
          Bulk Discount
        </Button>

        <span className="text-xs font-bold" style={{ color: theme.textMuted }}>
          {productsLoading ? 'Loading…' : `${filtered.length} product(s)`}
        </span>
      </div>

      {/* Bulk Discount Panel */}
      {bulkMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-4 rounded-2xl border-2"
          style={{ borderColor: theme.primary, background: `${theme.primary}08` }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-sm" style={{ color: theme.primary }}>
              Bulk Discount — {selected.length} product(s) selected
            </p>
            <button onClick={() => { setBulkMode(false); setSelected([]); }}>
              <X size={16} style={{ color: theme.textMuted }} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="text-xs font-bold block mb-1" style={{ color: theme.textMuted }}>Discount %</label>
              <div className="relative">
                <Percent size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
                <input
                  type="number" min="0" max="90"
                  value={bulk.discountPct}
                  onChange={(e) => setBulk((p) => ({ ...p, discountPct: e.target.value }))}
                  placeholder="30"
                  className="w-full pl-7 pr-3 py-2 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: theme.border, color: theme.text }}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1" style={{ color: theme.textMuted }}>Label</label>
              <div className="relative">
                <Tag size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
                <input
                  value={bulk.discountLabel}
                  onChange={(e) => setBulk((p) => ({ ...p, discountLabel: e.target.value }))}
                  placeholder="FLASH SALE"
                  className="w-full pl-7 pr-3 py-2 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: theme.border, color: theme.text }}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1" style={{ color: theme.textMuted }}>Start Date *</label>
              <input
                type="datetime-local"
                value={bulk.discountStart}
                onChange={(e) => setBulk((p) => ({ ...p, discountStart: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: theme.border, color: theme.text }}
              />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1" style={{ color: theme.textMuted }}>End Date *</label>
              <input
                type="datetime-local"
                value={bulk.discountEnd}
                onChange={(e) => setBulk((p) => ({ ...p, discountEnd: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: theme.border, color: theme.text }}
              />
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            loading={applying}
            onClick={handleBulkApply}
            disabled={!selected.length}
          >
            Apply to {selected.length || 0} Product(s)
          </Button>
          {!selected.length && (
            <p className="text-xs mt-2" style={{ color: theme.textMuted }}>Select products from the table below first.</p>
          )}
        </motion.div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: theme.border }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: theme.bg }}>
              {bulkMode && (
                <th className="px-3 py-3">
                  <button onClick={toggleAll}>
                    {selected.length === filtered.length && filtered.length > 0
                      ? <CheckSquare size={16} style={{ color: theme.primary }} />
                      : <Square size={16} style={{ color: theme.textMuted }} />}
                  </button>
                </th>
              )}
              {['Product', 'Current Price', 'Discount Label', 'Sale Window', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((product, i) => {
              const status = getSaleStatus(product);
              const badge = STATUS_BADGE[status];
              const isEditing = singleEdit === product.id;
              return (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-t"
                  style={{ borderColor: theme.border, background: isEditing ? `${theme.primary}06` : 'white' }}
                >
                  {bulkMode && (
                    <td className="px-3 py-3">
                      <button onClick={() => toggleSelect(product.id)}>
                        {selected.includes(product.id)
                          ? <CheckSquare size={16} style={{ color: theme.primary }} />
                          : <Square size={16} style={{ color: theme.textMuted }} />}
                      </button>
                    </td>
                  )}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <img src={product.images?.[0] || 'https://placehold.co/40x40?text=Toy'} alt="" className="w-9 h-9 rounded-xl object-cover bg-gray-100" />
                      <p className="font-semibold text-xs line-clamp-2 max-w-[140px]" style={{ color: theme.text }}>{product.name}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-bold text-xs" style={{ color: theme.primary }}>{formatPrice(product.price)}</p>
                    {product.originalPrice > product.price && (
                      <p className="text-[10px] line-through" style={{ color: theme.textMuted }}>{formatPrice(product.originalPrice)}</p>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {isEditing ? (
                      <input
                        value={singleForm.discountLabel}
                        onChange={(e) => setSingleForm((p) => ({ ...p, discountLabel: e.target.value }))}
                        placeholder="FLASH SALE"
                        className="w-28 px-2 py-1 rounded-lg border text-xs focus:outline-none"
                        style={{ borderColor: theme.border }}
                      />
                    ) : (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: isOnSale(product) ? '#FEF3C7' : '#F3F4F6', color: isOnSale(product) ? '#B45309' : '#6B7280' }}>
                        {product.discountLabel || '—'}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs" style={{ color: theme.textMuted }}>
                    {isEditing ? (
                      <div className="space-y-1">
                        <div>
                          <span className="text-[10px] font-bold block mb-0.5">Discount %</span>
                          <input type="number" min="0" max="90" value={singleForm.discountPct}
                            onChange={(e) => setSingleForm((p) => ({ ...p, discountPct: e.target.value }))}
                            placeholder="0" className="w-20 px-2 py-1 rounded-lg border text-xs focus:outline-none" style={{ borderColor: theme.border }} />
                        </div>
                        <input type="datetime-local" value={singleForm.discountStart}
                          onChange={(e) => setSingleForm((p) => ({ ...p, discountStart: e.target.value }))}
                          className="w-full px-2 py-1 rounded-lg border text-[10px] focus:outline-none" style={{ borderColor: theme.border }} />
                        <input type="datetime-local" value={singleForm.discountEnd}
                          onChange={(e) => setSingleForm((p) => ({ ...p, discountEnd: e.target.value }))}
                          className="w-full px-2 py-1 rounded-lg border text-[10px] focus:outline-none" style={{ borderColor: theme.border }} />
                      </div>
                    ) : product.discountStart ? (
                      <>
                        <p>From: {formatDate(product.discountStart)}</p>
                        <p>To: {formatDate(product.discountEnd)}</p>
                      </>
                    ) : <span>—</span>}
                  </td>
                  <td className="px-3 py-3">
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <>
                          <Button variant="primary" size="xs" loading={savingSingle} onClick={handleSingleSave}>Save</Button>
                          <Button variant="secondary" size="xs" onClick={() => setSingleEdit(null)}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => openSingleEdit(product)} className="px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: `${theme.primary}15`, color: theme.primary }}>
                            Edit
                          </button>
                          {status !== 'none' && (
                            <button onClick={() => handleClearDiscount(product.id)} className="px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: '#FEE2E2', color: '#EF4444' }}>
                              Clear
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10" style={{ color: theme.textMuted }}>
          <Tag size={36} className="mx-auto mb-2 opacity-20" />
          <p className="text-sm font-semibold">No products match your filter.</p>
        </div>
      )}
    </div>
  );
};

export default DiscountManager;
