import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, GripVertical, Image as ImageIcon, Video } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { MarketingService } from '../../services/marketing.service';
import { StorageService } from '../../services/storage.service';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';

const EMPTY_ITEM = {
  type: 'image',
  src: '',
  poster: '',
  title: '',
  subtitle: '',
  cta: 'Shop Now',
  link: '/products',
  displayOrder: 0,
  isActive: true,
};

const MarketingManager = () => {
  const { theme } = useTheme();
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_ITEM);
  const [uploading, setUploading] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await MarketingService.getAdminAll();
    if (error) addToast(`Error loading carousel: ${error.message}`, 'error');
    else setItems(data || []);
    setLoading(false);
  }, [addToast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openAdd = () => { setEditingItem(null); setForm(EMPTY_ITEM); setModalOpen(true); };
  const openEdit = (item) => { setEditingItem(item); setForm(item); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      addToast('Only image and video files are allowed.', 'error');
      return;
    }
    setUploading(true);
    const { url, error } = await StorageService.uploadFile(file, 'marketing');
    setUploading(false);
    if (error) {
      addToast(`Upload failed: ${error.message}`, 'error');
      return;
    }
    const fileType = file.type.startsWith('video/') ? 'video' : 'image';
    setForm((p) => ({ ...p, src: url, type: fileType, poster: fileType === 'video' ? p.poster : '' }));
    addToast(`${fileType === 'video' ? 'Video' : 'Image'} uploaded!`, 'success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    let result;
    if (editingItem) {
      result = await MarketingService.update(editingItem.id, form);
    } else {
      result = await MarketingService.create(form);
    }
    setSaving(false);
    if (result.error) { addToast(`Error: ${result.error.message}`, 'error'); return; }
    addToast(editingItem ? 'Carousel item updated!' : 'Carousel item added!', 'success');
    closeModal();
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this carousel item?')) return;
    setSaving(true);
    const { error } = await MarketingService.delete(id);
    setSaving(false);
    if (error) { addToast(`Error: ${error.message}`, 'error'); return; }
    addToast('Item deleted', 'info');
    fetchItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black" style={{ color: theme.text }}>Marketing Carousel</h2>
        <Button icon={Plus} onClick={openAdd}>Add Item</Button>
      </div>

      {loading ? (
        <div className="p-12 text-center" style={{ color: theme.textMuted }}>Loading...</div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border-2 border-dashed" style={{ borderColor: theme.border, color: theme.textMuted }}>
          No marketing carousel items yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white border"
              style={{ borderColor: theme.border }}
            >
              {item.type === 'video' ? <Video size={20} style={{ color: theme.primary }} /> : <ImageIcon size={20} style={{ color: theme.primary }} />}
              <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                {item.type === 'video' ? (
                  <video src={item.src} className="w-full h-full object-cover" />
                ) : (
                  <img src={item.src} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate" style={{ color: theme.text }}>{item.title || 'Untitled'}</p>
                <p className="text-xs truncate" style={{ color: theme.textMuted }}>{item.type} • Order {item.displayOrder} {item.isActive ? '' : '• Hidden'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(item)} className="p-2 rounded-full hover:bg-gray-100" style={{ color: theme.primary }}>
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-full hover:bg-red-50" style={{ color: '#EF4444' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingItem ? 'Edit Carousel Item' : 'Add Carousel Item'} size="md">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Type" name="type" value={form.type} onChange={handleChange}
              as="select" options={[{ value: 'image', label: 'Image' }, { value: 'video', label: 'Video' }]} />
            <Input label="Display Order" name="displayOrder" type="number" value={form.displayOrder} onChange={handleChange} />
          </div>

          <Input label="Media URL" name="src" value={form.src} onChange={handleChange} placeholder="https://..." />
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: theme.textMuted }}>or upload</span>
            <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="text-sm" disabled={uploading} />
            {uploading && <span className="text-xs" style={{ color: theme.primary }}>Uploading…</span>}
          </div>

          {form.type === 'video' && (
            <Input label="Poster URL" name="poster" value={form.poster} onChange={handleChange} placeholder="https://..." />
          )}

          <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
          <Input label="Subtitle" name="subtitle" value={form.subtitle} onChange={handleChange} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="CTA Text" name="cta" value={form.cta} onChange={handleChange} />
            <Input label="Link" name="link" value={form.link} onChange={handleChange} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isActive" checked={!!form.isActive} onChange={handleChange} />
            <span className="text-sm font-semibold" style={{ color: theme.text }}>Active</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={closeModal} type="button">Cancel</Button>
            <Button type="submit" loading={saving || uploading} disabled={uploading}>{editingItem ? 'Update' : 'Add'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MarketingManager;
