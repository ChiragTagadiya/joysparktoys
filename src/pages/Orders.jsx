import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, MapPin, CreditCard, ShoppingBag, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { formatPrice, formatDate, displayOrderNumber } from '../utils/formatters';
import { ROUTES, getProductRoute } from '../constants/routes';
import { OrdersService } from '../services/orders.service';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';

const STATUS_STYLES = {
  confirmed: { label: '✅ Confirmed', bg: '#D1FAE5', color: '#065F46' },
  in_progress: { label: '⚙️ In Progress', bg: '#DBEAFE', color: '#1E40AF' },
  processing: { label: '⚙️ Processing', bg: '#DBEAFE', color: '#1E40AF' },
  shipped: { label: '🚚 Shipped', bg: '#EDE9FE', color: '#5B21B6' },
  delivered: { label: '📦 Delivered', bg: '#F3F4F6', color: '#374151' },
  returned: { label: '↩️ Returned', bg: '#FEF3C7', color: '#92400E' },
  cancelled: { label: '❌ Cancelled', bg: '#FEE2E2', color: '#991B1B' },
};

const normalizeStatus = (status) => {
  if (!status) return 'confirmed';
  const s = String(status).toLowerCase();
  if (s === 'in progress') return 'in_progress';
  if (s === 'return') return 'returned';
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

const Orders = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await OrdersService.getByUser(user.id);
    setOrders(data || []);
  }, [user?.id]);

  const refreshOrders = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  useEffect(() => {
    if (!user?.id) return;
    OrdersService.getByUser(user.id).then(({ data }) => {
      setOrders(data || []);
      setLoading(false);
    });
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const onFocus = () => {
      refreshOrders();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') refreshOrders();
    });
    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, [refreshOrders, user?.id]);

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

  const groupedOrders = useMemo(() => {
    const map = new Map();
    for (const o of filteredOrders) {
      const key = o?.created_at ? formatDate(o.created_at) : 'Unknown Date';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(o);
    }
    return Array.from(map.entries());
  }, [filteredOrders]);

  if (loading) return <Loader fullScreen />;

  if (!orders.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-20" style={{ background: theme.bg }}>
        <span className="text-8xl">📦</span>
        <h2 className="text-2xl font-black" style={{ color: theme.text }}>No orders yet!</h2>
        <p className="text-sm" style={{ color: theme.textMuted }}>Start shopping and your orders will appear here.</p>
        <Button onClick={() => navigate(ROUTES.PRODUCTS)} icon={ShoppingBag}>Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-36 pb-16" style={{ background: theme.bg }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <h1 className="text-3xl font-black" style={{ color: theme.text }}>My Orders 📦</h1>
          <Button variant="secondary" size="sm" onClick={refreshOrders} loading={refreshing}>
            Refresh
          </Button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border p-4 mb-6" style={{ borderColor: theme.border }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.textMuted }}>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl border text-sm font-semibold focus:outline-none"
                style={{ borderColor: theme.border, color: theme.text, background: 'white' }}
              >
                <option value="all">All</option>
                <option value="confirmed">✅ Confirmed</option>
                <option value="in_progress">⚙️ In Progress</option>
                <option value="delivered">📦 Delivered</option>
                <option value="returned">↩️ Returned</option>
                <option value="cancelled">❌ Cancelled</option>
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
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12" style={{ color: theme.textMuted }}>
            No orders match your filters.
          </div>
        ) : (
          <div className="space-y-8">
            {groupedOrders.map(([dateLabel, list]) => (
              <div key={dateLabel}>
                <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: theme.textMuted }}>{dateLabel}</h2>
                <div className="space-y-6">
                  {list.map((order, idx) => {
                    const statusKey = normalizeStatus(order.status);
                    const status = STATUS_STYLES[statusKey] || STATUS_STYLES.confirmed;
                    const expectedDelivery = getExpectedDelivery(order);
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white rounded-3xl shadow-sm border overflow-hidden"
                        style={{ borderColor: theme.border }}
                      >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b" style={{ borderColor: theme.border, background: theme.bg }}>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: theme.textMuted }}>Order ID</p>
                    <p className="font-black text-lg" style={{ color: theme.primary }}>{displayOrderNumber(order.order_number, order.id)}</p>
                    {expectedDelivery && (
                      <p className="text-xs font-semibold mt-1" style={{ color: theme.textMuted }}>
                        Expected Delivery: {expectedDelivery}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} style={{ color: theme.textMuted }} />
                    <p className="text-sm font-semibold" style={{ color: theme.textMuted }}>{formatDate(order.created_at)}</p>
                  </div>
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: status.bg, color: status.color }}>
                    {status.label}
                  </span>
                </div>

                {/* Items */}
                <div className="px-6 py-4 space-y-3">
                  {groupOrderItems(order.items || []).map(({ key, item, totalQty, lines }) => (
                    <div key={key} className="rounded-2xl border p-3" style={{ borderColor: theme.border }}>
                      <div className="flex items-center gap-4">
                        <button onClick={() => navigate(getProductRoute(item.id))}>
                          <img src={item.images?.[0]} alt={item.name} className="w-16 h-16 rounded-2xl object-cover bg-gray-100" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm line-clamp-1" style={{ color: theme.text }}>{item.name}</p>
                          <p className="text-xs" style={{ color: theme.textMuted }}>Total Qty: {totalQty} • Unit: {formatPrice(item.price)}</p>
                          {Array.isArray(item?.images) && item.images.length > 1 && (
                            <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-hide">
                              {item.images.slice(0, 5).map((u, idx) => (
                                <img key={u + idx} src={u} alt="" className="w-10 h-10 rounded-xl object-cover bg-gray-100 shrink-0" />
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="font-black" style={{ color: theme.primary }}>{formatPrice((item.price || 0) * totalQty)}</p>
                      </div>

                      {lines.length > 1 && (
                        <div className="mt-3 pl-3 border-l-2 space-y-1.5" style={{ borderColor: theme.border }}>
                          {lines.map((ln, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span style={{ color: theme.textMuted }}>Line {idx + 1}: Qty {ln.quantity}</span>
                              <span className="font-bold" style={{ color: theme.text }}>{formatPrice((ln.price || 0) * (ln.quantity || 0))}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t" style={{ borderColor: theme.border, background: theme.bg }}>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} style={{ color: theme.primary, marginTop: 2 }} />
                    <div>
                      <p className="text-xs font-bold" style={{ color: theme.text }}>{order.address?.fullName}</p>
                      <p className="text-xs" style={{ color: theme.textMuted }}>{order.address?.city}, {order.address?.state} – {order.address?.pincode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} style={{ color: theme.textMuted }} />
                    <span className="text-xs font-semibold uppercase" style={{ color: theme.textMuted }}>{order.payment_method}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm" style={{ color: theme.textMuted }}>Total:</p>
                    <p className="font-black text-lg" style={{ color: theme.primary }}>{formatPrice(order.total)}</p>
                  </div>
                </div>
              </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
