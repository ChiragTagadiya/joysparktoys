import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Package, ShoppingBag, Users, TrendingUp, LayoutDashboard, Tag, Bell, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useProducts } from '../context/ProductContext';
import { useToast } from '../context/ToastContext';
import { formatPrice, formatDate, displayOrderNumber } from '../utils/formatters';
import { OrdersService } from '../services/orders.service';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import ProductForm from '../components/admin/ProductForm';
import ProductTable from '../components/admin/ProductTable';
import DiscountManager from '../components/admin/DiscountManager';
import AnnouncementManager from '../components/admin/AnnouncementManager';

const StatBox = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border flex items-start gap-4" style={{ borderColor: '#E5E7EB' }}>
    <div className="p-3 rounded-2xl" style={{ background: `${color}15` }}>
      <Icon size={24} style={{ color }} />
    </div>
    <div>
      <p className="text-2xl font-black" style={{ color }}>{value}</p>
      <p className="text-sm font-semibold text-gray-600">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const TABS = [
  { id: 'dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'orders',        label: 'Orders',        icon: ShoppingBag },
  { id: 'products',      label: 'Products',       icon: Package },
  { id: 'discounts',     label: 'Discounts',      icon: Tag },
  { id: 'announcements', label: 'Announcements',  icon: Bell },
];

const ORDER_STATUSES = [
  { value: 'confirmed', label: '✅ Confirmed' },
  { value: 'in_progress', label: '⚙️ In Progress' },
  { value: 'delivered', label: '📦 Delivered' },
  { value: 'returned', label: '↩️ Returned' },
  { value: 'cancelled', label: '❌ Cancelled' },
];

const normalizeStatus = (status) => {
  if (!status) return 'confirmed';
  const s = String(status).toLowerCase();
  if (s === 'in progress') return 'in_progress';
  if (s === 'return') return 'returned';
  if (s === 'placed') return 'confirmed';
  return s;
};

const getExpectedDelivery = (order) => {
  const base = order?.expected_delivery_date || order?.expected_delivery || order?.expectedDelivery;
  if (base) return formatDate(base);
  const created = order?.created_at ? new Date(order.created_at) : null;
  if (!created || Number.isNaN(created.getTime())) return '';
  const d = new Date(created);
  d.setDate(d.getDate() + 7);
  return formatDate(d.toISOString());
};

const groupOrderItems = (items = []) => {
  const map = new Map();
  for (const it of items) {
    const key = it?.id ?? it?.productId ?? it?.product_id ?? JSON.stringify([it?.name, it?.price]);
    if (!map.has(key)) {
      map.set(key, {
        key,
        item: it,
        totalQty: 0,
        lines: [],
      });
    }
    const node = map.get(key);
    node.totalQty += Number(it?.quantity || 0);
    node.lines.push(it);
  }
  return Array.from(map.values());
};

const Admin = () => {
  const { theme } = useTheme();
  const { allProducts, addProduct, updateProduct } = useProducts();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [statusSavingId, setStatusSavingId] = useState(null);
  const [orderDrafts, setOrderDrafts] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    OrdersService.getAll().then(({ data }) => setOrders(data || []));
  }, []);

  const refreshOrders = async () => {
    setOrdersLoading(true);
    const { data, error } = await OrdersService.getAll();
    setOrdersLoading(false);
    if (error) { addToast(`Error: ${error.message}`, 'error'); return; }
    setOrders(data || []);
  };

  const updateOrderStatus = async (orderId, status) => {
    setStatusSavingId(orderId);
    const { data, error } = await OrdersService.updateStatus(orderId, status);
    setStatusSavingId(null);
    if (error) { addToast(`Error: ${error.message}`, 'error'); return; }
    setOrders((prev) => prev.map((o) => o.id === orderId ? data : o));
    addToast('Order status updated', 'success');
  };

  const updateOrderExpectedDelivery = async (orderId, expectedDelivery) => {
    setStatusSavingId(orderId);
    const { data, error } = await OrdersService.updateExpectedDelivery(orderId, expectedDelivery);
    setStatusSavingId(null);
    if (error) { addToast(`Error: ${error.message}`, 'error'); return; }
    setOrders((prev) => prev.map((o) => o.id === orderId ? data : o));
    addToast('Expected delivery updated', 'success');
  };

  const saveOrder = async (orderId) => {
    const draft = orderDrafts[orderId];
    if (!draft) return;
    setStatusSavingId(orderId);
    const { data, error } = await OrdersService.update(orderId, {
      status: draft.status,
      expected_delivery_date: draft.expected_delivery_date,
    });
    setStatusSavingId(null);
    if (error) { addToast(`Error: ${error.message}`, 'error'); return; }
    setOrders((prev) => prev.map((o) => o.id === orderId ? data : o));
    setOrderDrafts((prev) => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
    addToast('Order updated', 'success');
  };

  const filteredOrders = useMemo(() => {
    const fromTs = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
    const toTs = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : null;
    return (orders || []).filter((o) => {
      const s = normalizeStatus(o.status);
      if (statusFilter !== 'all' && s !== statusFilter) return false;
      if (fromTs || toTs) {
        const t = o?.created_at ? new Date(o.created_at).getTime() : null;
        if (!t || Number.isNaN(t)) return false;
        if (fromTs && t < fromTs) return false;
        if (toTs && t > toTs) return false;
      }
      return true;
    });
  }, [orders, statusFilter, fromDate, toDate]);

  const dateGroupedOrders = useMemo(() => {
    const map = new Map();
    for (const o of filteredOrders) {
      const key = o?.created_at ? formatDate(o.created_at) : 'Unknown Date';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(o);
    }
    return Array.from(map.entries());
  }, [filteredOrders]);

  const recentOrders = useMemo(() => orders.slice(0, 10), [orders]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const totalSold = orders.reduce((s, o) => s + (o.items?.reduce((a, i) => a + i.quantity, 0) || 0), 0);

  const dashStats = [
    { icon: Package, label: 'Total Products', value: allProducts.length, color: theme.primary, sub: 'In catalogue' },
    { icon: ShoppingBag, label: 'Total Orders', value: orders.length, color: theme.secondary, sub: 'All time' },
    { icon: TrendingUp, label: 'Total Revenue', value: formatPrice(totalRevenue), color: '#10B981', sub: 'From all orders' },
    { icon: Users, label: 'Items Sold', value: totalSold, color: '#F59E0B', sub: 'Units ordered' },
  ];

  const handleAddSubmit = async (productData) => {
    setFormLoading(true);
    const { error } = await addProduct(productData);
    setFormLoading(false);
    if (error) { addToast(`Error: ${error.message}`, 'error'); return; }
    setShowForm(false);
    addToast('Product added successfully! 🎉', 'success');
  };

  const handleEditSubmit = async (productData) => {
    setFormLoading(true);
    const { error } = await updateProduct(editProduct.id, productData);
    setFormLoading(false);
    if (error) { addToast(`Error: ${error.message}`, 'error'); return; }
    setEditProduct(null);
    addToast('Product updated!', 'success');
  };

  return (
    <div className="min-h-screen pt-36 pb-16" style={{ background: theme.bg }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black" style={{ color: theme.text }}>Admin Portal ⚙️</h1>
            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Manage your Joy Spark Toys store</p>
          </div>
          <Button variant="primary" size="md" icon={Plus} onClick={() => setShowForm(true)}>
            Add Product
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b" style={{ borderColor: theme.border }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 -mb-px transition-all"
              style={{
                borderColor: activeTab === id ? theme.primary : 'transparent',
                color: activeTab === id ? theme.primary : theme.textMuted,
              }}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {dashStats.map((s) => <StatBox key={s.label} {...s} />)}
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: theme.border }}>
                <h3 className="font-black text-lg mb-4" style={{ color: theme.text }}>Recent Orders</h3>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag size={40} className="mx-auto mb-3 opacity-20" style={{ color: theme.textMuted }} />
                    <p style={{ color: theme.textMuted }}>No orders yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: theme.bg }}>
                          {['Sr', 'Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status'].map((h) => (
                            <th key={h} className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order, idx) => (
                          (() => {
                            const s = normalizeStatus(order.status);
                            const expectedDelivery = getExpectedDelivery(order);
                            return (
                          <tr key={order.id} className="border-t" style={{ borderColor: theme.border }}>
                            <td className="px-3 py-3 text-xs font-bold" style={{ color: theme.textMuted }}>{idx + 1}</td>
                            <td className="px-3 py-3">
                              <p className="font-bold text-xs" style={{ color: theme.primary }}>
                                {displayOrderNumber(order.order_number, order.id)}
                              </p>
                              {expectedDelivery && (
                                <p className="text-[10px] mt-0.5" style={{ color: theme.textMuted }}>
                                  Expected: {expectedDelivery}
                                </p>
                              )}
                            </td>
                            <td className="px-3 py-3" style={{ color: theme.text }}>{order.address?.fullName}</td>
                            <td className="px-3 py-3" style={{ color: theme.textMuted }}>{order.items?.length} item(s)</td>
                            <td className="px-3 py-3 font-bold" style={{ color: theme.primary }}>{formatPrice(order.total)}</td>
                            <td className="px-3 py-3 uppercase text-xs font-semibold" style={{ color: theme.textMuted }}>{order.payment_method}</td>
                            <td className="px-3 py-3">
                              <span className="px-2 py-1 rounded-lg text-xs font-bold" style={{ background: s === 'cancelled' ? '#FEE2E2' : s === 'returned' ? '#FEF3C7' : s === 'delivered' ? '#F3F4F6' : s === 'in_progress' ? '#DBEAFE' : '#D1FAE5', color: s === 'cancelled' ? '#991B1B' : s === 'returned' ? '#92400E' : s === 'delivered' ? '#374151' : s === 'in_progress' ? '#1E40AF' : '#065F46' }}>
                                {ORDER_STATUSES.find((x) => x.value === s)?.label || '✅ Confirmed'}
                              </span>
                            </td>
                          </tr>
                            );
                          })()
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: theme.border }}>
                <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
                  <div>
                    <h3 className="font-black text-lg" style={{ color: theme.text }}>Orders</h3>
                    <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                      Default expected delivery is 7 days from order date.
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={refreshOrders} loading={ordersLoading}>
                    Refresh
                  </Button>
                </div>

                <div className="rounded-3xl border p-4 mb-5" style={{ borderColor: theme.border, background: theme.bg }}>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.textMuted }}>Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl border text-sm font-semibold focus:outline-none"
                        style={{ borderColor: theme.border, color: theme.text, background: 'white' }}
                      >
                        <option value="all">All</option>
                        {ORDER_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.textMuted }}>From</label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl border text-sm font-semibold focus:outline-none"
                        style={{ borderColor: theme.border, color: theme.text, background: 'white' }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.textMuted }}>To</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl border text-sm font-semibold focus:outline-none"
                        style={{ borderColor: theme.border, color: theme.text, background: 'white' }}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => { setStatusFilter('all'); setFromDate(''); setToDate(''); }}
                        className="w-full"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag size={40} className="mx-auto mb-3 opacity-20" style={{ color: theme.textMuted }} />
                    <p style={{ color: theme.textMuted }}>No orders match your filters</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {dateGroupedOrders.map(([dateLabel, list]) => (
                      <div key={dateLabel}>
                        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: theme.textMuted }}>{dateLabel}</p>
                        <div className="space-y-5">
                          {list.map((order, idx) => {
                            const status = normalizeStatus(order.status);
                            const expectedDelivery = getExpectedDelivery(order);
                            const grouped = groupOrderItems(order.items || []);
                            const expectedInput = (() => {
                              const raw = order?.expected_delivery_date ?? order?.expected_delivery;
                              if (raw) return String(raw).slice(0, 10);
                              if (!order?.created_at) return '';
                              const d = new Date(order.created_at);
                              if (Number.isNaN(d.getTime())) return '';
                              d.setDate(d.getDate() + 7);
                              return d.toISOString().slice(0, 10);
                            })();
                            const draft = orderDrafts[order.id] || { status, expected_delivery_date: expectedInput };
                            const dirty = (draft.status !== status) || (String(draft.expected_delivery_date || '') !== String(expectedInput || ''));
                            return (
                              <div key={order.id} className="rounded-3xl border overflow-hidden" style={{ borderColor: theme.border }}>
                          <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-4" style={{ background: theme.bg }}>
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: theme.textMuted }}>Order</p>
                              <p className="text-base font-black" style={{ color: theme.primary }}>
                                {displayOrderNumber(order.order_number, order.id)}
                              </p>
                              <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Sr No: {idx + 1}</p>
                              <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                                Placed: {formatDate(order.created_at)}
                                {expectedDelivery ? ` • Expected: ${expectedDelivery}` : ''}
                              </p>
                              <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                                Customer: {order.address?.fullName || '—'}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-xs font-bold" style={{ color: theme.textMuted }}>Total</p>
                                <p className="text-lg font-black" style={{ color: theme.primary }}>{formatPrice(order.total || 0)}</p>
                              </div>

                              <div className="min-w-[170px]">
                                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.textMuted }}>Expected Delivery</label>
                                <input
                                  type="date"
                                  value={draft.expected_delivery_date || ''}
                                  disabled={statusSavingId === order.id}
                                  onChange={(e) => setOrderDrafts((prev) => ({
                                    ...prev,
                                    [order.id]: { ...draft, expected_delivery_date: e.target.value },
                                  }))}
                                  className="w-full mt-1 px-3 py-2 rounded-xl border text-sm font-semibold focus:outline-none"
                                  style={{ borderColor: theme.border, color: theme.text, background: 'white' }}
                                />
                              </div>

                              <div className="min-w-[170px]">
                                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.textMuted }}>Status</label>
                                <select
                                  value={draft.status}
                                  onChange={(e) => setOrderDrafts((prev) => ({
                                    ...prev,
                                    [order.id]: { ...draft, status: e.target.value },
                                  }))}
                                  disabled={statusSavingId === order.id}
                                  className="w-full mt-1 px-3 py-2 rounded-xl border text-sm font-semibold focus:outline-none"
                                  style={{ borderColor: theme.border, color: theme.text, background: 'white' }}
                                >
                                  {ORDER_STATUSES.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex flex-col justify-end gap-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => saveOrder(order.id)}
                                  loading={statusSavingId === order.id}
                                  disabled={!dirty}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setSelectedOrder(order)}
                                  disabled={statusSavingId === order.id}
                                >
                                  Customer Details
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setOrderDrafts((prev) => {
                                    const next = { ...prev };
                                    delete next[order.id];
                                    return next;
                                  })}
                                  disabled={!dirty || statusSavingId === order.id}
                                >
                                  Reset
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="px-5 py-4">
                            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: theme.textMuted }}>Items</p>
                            <div className="space-y-3">
                              {grouped.map(({ key, item, totalQty, lines }) => (
                                <div key={key} className="rounded-2xl border p-3" style={{ borderColor: theme.border }}>
                                  <div className="flex items-start gap-3">
                                    <img
                                      src={item?.images?.[0] || 'https://placehold.co/64x64?text=Toy'}
                                      alt=""
                                      className="w-14 h-14 rounded-2xl object-cover bg-gray-100 shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-sm line-clamp-1" style={{ color: theme.text }}>{item?.name || 'Product'}</p>
                                      <div className="inline-flex items-center gap-2 mt-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>Total Qty</span>
                                        <span className="text-2xl font-black px-3 py-0.5 rounded-xl" style={{ background: theme.primary, color: '#fff' }}>
                                          {totalQty}
                                        </span>
                                      </div>
                                      {Array.isArray(item?.images) && item.images.length > 1 && (
                                        <div className="flex gap-1.5 mt-2 overflow-x-auto scrollbar-hide">
                                          {item.images.slice(0, 5).map((u, idx) => (
                                            <img key={u + idx} src={u} alt="" className="w-10 h-10 rounded-xl object-cover bg-gray-100 shrink-0" />
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs font-bold" style={{ color: theme.textMuted }}>Unit</p>
                                      <p className="font-black" style={{ color: theme.primary }}>{formatPrice(item?.price || 0)}</p>
                                    </div>
                                  </div>

                                  {lines.length > 1 && (
                                    <div className="mt-3 pl-2 border-l-2 space-y-1.5" style={{ borderColor: theme.border }}>
                                      {lines.map((ln, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs">
                                          <span style={{ color: theme.textMuted }}>Line {idx + 1}: <span className="text-lg font-black" style={{ color: theme.primary }}>{ln.quantity}</span></span>
                                          <span className="font-bold" style={{ color: theme.text }}>{formatPrice((ln.price || 0) * (ln.quantity || 0))}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: theme.border }}>
                <h3 className="font-black text-lg mb-5" style={{ color: theme.text }}>All Products</h3>
                <ProductTable onEdit={(p) => setEditProduct(p)} />
              </div>
            </motion.div>
          )}

          {activeTab === 'discounts' && (
            <motion.div key="discounts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: theme.border }}>
                <DiscountManager />
              </div>
            </motion.div>
          )}

          {activeTab === 'announcements' && (
            <motion.div key="announcements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: theme.border }}>
                <AnnouncementManager />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Product Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add New Product" size="lg">
        <ProductForm onSubmit={handleAddSubmit} onCancel={() => setShowForm(false)} loading={formLoading} />
      </Modal>

      {/* Edit Product Modal */}
      <Modal isOpen={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product" size="lg">
        {editProduct && (
          <ProductForm initial={editProduct} onSubmit={handleEditSubmit} onCancel={() => setEditProduct(null)} loading={formLoading} />
        )}
      </Modal>

      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Customer Details" size="lg">
        {selectedOrder && (
          <div className="p-6 space-y-4">
            <div className="rounded-2xl border p-4" style={{ borderColor: theme.border, background: theme.bg }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.textMuted }}>Order</p>
              <p className="text-lg font-black" style={{ color: theme.primary }}>
                {displayOrderNumber(selectedOrder.order_number, selectedOrder.id)}
              </p>
              <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                Placed: {formatDate(selectedOrder.created_at)}
              </p>
            </div>

            <div className="rounded-2xl border p-4" style={{ borderColor: theme.border }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: theme.textMuted }}>Delivery Address</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="sm:col-span-2">
                  <p className="text-xs font-bold" style={{ color: theme.textMuted }}>Email</p>
                  <p className="font-semibold" style={{ color: theme.text }}>
                    {selectedOrder.address?.email || selectedOrder.user_email || selectedOrder.email || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: theme.textMuted }}>Full Name</p>
                  <p className="font-semibold" style={{ color: theme.text }}>{selectedOrder.address?.fullName || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: theme.textMuted }}>Mobile</p>
                  <p className="font-semibold" style={{ color: theme.text }}>{selectedOrder.address?.phone || '—'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-bold" style={{ color: theme.textMuted }}>Address</p>
                  <p className="font-semibold" style={{ color: theme.text }}>
                    {[selectedOrder.address?.addressLine1, selectedOrder.address?.addressLine2, selectedOrder.address?.landmark]
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: theme.textMuted }}>City</p>
                  <p className="font-semibold" style={{ color: theme.text }}>{selectedOrder.address?.city || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: theme.textMuted }}>State</p>
                  <p className="font-semibold" style={{ color: theme.text }}>{selectedOrder.address?.state || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: theme.textMuted }}>PIN</p>
                  <p className="font-semibold" style={{ color: theme.text }}>{selectedOrder.address?.pincode || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: theme.textMuted }}>Address Type</p>
                  <p className="font-semibold" style={{ color: theme.text }}>{selectedOrder.address?.type || '—'}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="primary" size="md" onClick={() => setSelectedOrder(null)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Admin;
