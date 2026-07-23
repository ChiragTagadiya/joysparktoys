import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, GripVertical } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { AnnouncementsService } from '../../services/announcements.service';
import Button from '../common/Button';
import Modal from '../common/Modal';

const TYPE_OPTIONS = [
  { value: 'discount',    label: '🔥 Discount',    color: '#EF4444' },
  { value: 'trending',    label: '📈 Trending',    color: '#F59E0B' },
  { value: 'new_arrival', label: '🆕 New Arrival', color: '#10B981' },
  { value: 'promo',       label: '🎁 Promo',       color: '#8B5CF6' },
  { value: 'info',        label: 'ℹ️ Info',        color: '#3B82F6' },
];

const TYPE_COLORS = Object.fromEntries(TYPE_OPTIONS.map((t) => [t.value, t.color]));

const EMPTY_FORM = { text: '', type: 'promo', emoji: '🎉', link: '', active: true, sort_order: 0 };

const AnnouncementManager = () => {
  const { theme } = useTheme();
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await AnnouncementsService.getAll();
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setEditItem(null); setShowForm(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setShowForm(true); };

  const handleSave = async () => {
    if (!form.text.trim()) return;
    setSaving(true);
    if (editItem) {
      const { error } = await AnnouncementsService.update(editItem.id, form);
      if (error) addToast(`Error: ${error.message}`, 'error');
      else { addToast('Announcement updated!', 'success'); setShowForm(false); load(); }
    } else {
      const { error } = await AnnouncementsService.create(form);
      if (error) addToast(`Error: ${error.message}`, 'error');
      else { addToast('Announcement added!', 'success'); setShowForm(false); load(); }
    }
    setSaving(false);
  };

  const handleToggle = async (item) => {
    const { error } = await AnnouncementsService.toggleActive(item.id, !item.active);
    if (!error) setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, active: !i.active } : i));
    else addToast(`Error: ${error.message}`, 'error');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    const { error } = await AnnouncementsService.delete(id);
    if (error) addToast(`Error: ${error.message}`, 'error');
    else { addToast('Deleted!', 'success'); setItems((prev) => prev.filter((i) => i.id !== id)); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-black text-base" style={{ color: theme.text }}>Announcement Bar</h3>
          <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
            Manage the scrolling ticker at the top of the website. Drag to reorder (update sort_order field).
          </p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={openAdd}>Add Item</Button>
      </div>

      {loading ? (
        <p className="text-sm text-center py-8" style={{ color: theme.textMuted }}>Loading...</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => {
            const typeColor = TYPE_COLORS[item.type] || '#6B7280';
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-2xl border"
                style={{
                  borderColor: item.active ? `${typeColor}40` : theme.border,
                  background: item.active ? `${typeColor}08` : theme.bg,
                  opacity: item.active ? 1 : 0.5,
                }}
              >
                <GripVertical size={14} style={{ color: theme.textMuted }} className="shrink-0 cursor-grab" />

                <span
                  className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                  style={{ background: typeColor }}
                >
                  {item.type}
                </span>

                <span className="text-lg shrink-0">{item.emoji}</span>

                <p className="flex-1 text-sm font-semibold line-clamp-1" style={{ color: theme.text }}>
                  {item.text}
                  {item.link && <span className="ml-2 text-xs text-blue-500">[link]</span>}
                </p>

                <span className="text-xs font-bold shrink-0" style={{ color: theme.textMuted }}>
                  #{item.sort_order}
                </span>

                <button onClick={() => handleToggle(item)} className="shrink-0" title={item.active ? 'Deactivate' : 'Activate'}>
                  {item.active
                    ? <ToggleRight size={20} style={{ color: '#10B981' }} />
                    : <ToggleLeft size={20} style={{ color: theme.textMuted }} />}
                </button>

                <button onClick={() => openEdit(item)} className="shrink-0 p-1.5 rounded-lg hover:bg-amber-50" style={{ color: '#F59E0B' }}>
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="shrink-0 p-1.5 rounded-lg hover:bg-red-50" style={{ color: '#EF4444' }}>
                  <Trash2 size={14} />
                </button>
              </motion.div>
            );
          })}

          {items.length === 0 && (
            <div className="text-center py-10" style={{ color: theme.textMuted }}>
              <p className="text-3xl mb-2">📢</p>
              <p className="text-sm font-semibold">No announcements yet. Add one!</p>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editItem ? 'Edit Announcement' : 'New Announcement'} size="sm">
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: theme.textMuted }}>Text *</label>
            <input
              value={form.text}
              onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
              placeholder="e.g. FREE Shipping on orders above ₹499!"
              className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: theme.border, color: theme.text }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: theme.textMuted }}>Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: theme.border, color: theme.text }}
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: theme.textMuted }}>Emoji</label>
              <input
                value={form.emoji}
                onChange={(e) => setForm((p) => ({ ...p, emoji: e.target.value }))}
                placeholder="🎉"
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: theme.border, color: theme.text }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: theme.textMuted }}>Link (optional)</label>
              <input
                value={form.link}
                onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
                placeholder="/products"
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: theme.border, color: theme.text }}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: theme.textMuted }}>Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((p) => ({ ...p, sort_order: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: theme.border, color: theme.text }}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
              className="w-4 h-4 rounded"
              style={{ accentColor: theme.primary }}
            />
            <span className="text-sm font-semibold" style={{ color: theme.text }}>Active (visible on site)</span>
          </label>

          <div className="flex gap-3 pt-2">
            <Button variant="primary" size="md" loading={saving} onClick={handleSave} className="flex-1">
              {editItem ? 'Save Changes' : 'Add Announcement'}
            </Button>
            <Button variant="secondary" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AnnouncementManager;
