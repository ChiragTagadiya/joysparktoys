import { useState, useRef, useEffect } from 'react';
import { X, Tag, Package, Upload, Link, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { validateProduct } from '../../utils/validators';
import { StorageService } from '../../services/storage.service';
import { CATEGORIES } from '../../data/categories';
import appConfig from '../../config/app.config';
import Input from '../common/Input';
import Button from '../common/Button';

const MAX_IMAGES = 5;

const EMPTY_FORM = {
  name: '', category: '', brand: '', price: '', originalPrice: '',
  stock: '', ageGroup: '', description: '', tags: '',
  featured: false, bestSeller: false, newArrival: false, images: [],
  discountLabel: '', discountStart: '', discountEnd: '',
};

const ProductForm = ({ initial = null, onSubmit, onCancel, loading }) => {
  const { theme } = useTheme();
  const [form, setForm] = useState(initial ? { ...initial, tags: initial.tags?.join(', ') || '' } : EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const viewerStripRef = useRef(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const images = form.images || [];
  const remainingSlots = Math.max(0, MAX_IMAGES - images.length);
  const atMaxImages = images.length >= MAX_IMAGES;

  useEffect(() => {
    if (!viewerOpen) return;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      const el = viewerStripRef.current;
      if (!el) return;
      const target = el.children?.[viewerIndex];
      if (target?.scrollIntoView) target.scrollIntoView({ behavior: 'instant', inline: 'start', block: 'nearest' });
    }, 0);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = '';
    };
  }, [viewerOpen, viewerIndex]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    setErrors((p) => ({ ...p, [name]: null }));
  };

  const addImage = () => {
    if (!imageUrl.trim()) return;
    if (atMaxImages) return;
    setForm((p) => ({ ...p, images: [...(p.images || []), imageUrl.trim()].slice(0, MAX_IMAGES) }));
    setImageUrl('');
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (remainingSlots <= 0) { e.target.value = ''; return; }

    const toUpload = files.slice(0, remainingSlots);
    setUploading(true);
    const uploadedUrls = [];
    for (const file of toUpload) {
      const { url, error } = await StorageService.uploadImage(file, 'products');
      if (error) {
        setUploading(false);
        alert(`Upload failed: ${error.message}`);
        e.target.value = '';
        return;
      }
      uploadedUrls.push(url);
    }
    setUploading(false);
    setForm((p) => ({ ...p, images: [...(p.images || []), ...uploadedUrls].slice(0, MAX_IMAGES) }));
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
  };

  const openViewer = (idx) => {
    setViewerIndex(idx);
    setViewerOpen(true);
  };

  const closeViewer = () => setViewerOpen(false);

  const goViewer = (dir) => {
    const next = Math.min(Math.max(viewerIndex + dir, 0), images.length - 1);
    setViewerIndex(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateProduct(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload = {
      ...form,
      price: Number(form.price),
      originalPrice: Number(form.originalPrice) || Number(form.price),
      stock: Number(form.stock),
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Product Name" name="name" value={form.name} onChange={handleChange}
          placeholder="e.g. Super Lego Set" error={errors.name} required />
        <Input label="Brand" name="brand" value={form.brand} onChange={handleChange}
          placeholder="e.g. PlayFun" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Category" name="category" value={form.category} onChange={handleChange}
          as="select" options={CATEGORIES.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` }))}
          error={errors.category} required />
        <Input label="Age Group" name="ageGroup" value={form.ageGroup} onChange={handleChange}
          as="select" options={appConfig.ageGroups} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="Sale Price (₹)" name="price" type="number" value={form.price} onChange={handleChange}
          placeholder="799" prefix="₹" error={errors.price} required />
        <Input label="Original Price (₹)" name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange}
          placeholder="1299" prefix="₹" hint="Leave blank if no discount" />
        <Input label="Stock Quantity" name="stock" type="number" value={form.stock} onChange={handleChange}
          placeholder="50" icon={Package} error={errors.stock} required />
      </div>

      <Input label="Description" name="description" value={form.description} onChange={handleChange}
        as="textarea" rows={4} placeholder="Describe the product..." error={errors.description} required />

      <Input label="Tags (comma separated)" name="tags" value={form.tags} onChange={handleChange}
        placeholder="e.g. educational, stem, outdoor" icon={Tag} hint="Helps with search" />

      {/* Flags */}
      <div className="flex items-center gap-6 flex-wrap">
        {[{ name: 'featured', label: '⭐ Featured' }, { name: 'bestSeller', label: '🔥 Best Seller' }, { name: 'newArrival', label: '🆕 New Arrival' }].map(({ name, label }) => (
          <label key={name} className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" name={name} checked={!!form[name]} onChange={handleChange}
              className="w-4 h-4 rounded" style={{ accentColor: theme.primary }} />
            <span className="text-sm font-semibold" style={{ color: theme.text }}>{label}</span>
          </label>
        ))}
      </div>

      {/* Discount Schedule */}
      <div className="p-4 rounded-2xl border-2" style={{ borderColor: `${theme.primary}30`, background: `${theme.primary}04` }}>
        <p className="text-sm font-bold mb-3" style={{ color: theme.text }}>🔥 Discount Schedule <span className="text-xs font-normal" style={{ color: theme.textMuted }}>(optional — auto-shows on site within window)</span></p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold block mb-1" style={{ color: theme.textMuted }}>Label (e.g. FLASH SALE)</label>
            <input
              name="discountLabel"
              value={form.discountLabel}
              onChange={handleChange}
              placeholder="FLASH SALE"
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: theme.border, color: theme.text }}
            />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1" style={{ color: theme.textMuted }}>Sale Starts</label>
            <input
              type="datetime-local"
              name="discountStart"
              value={form.discountStart || ''}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: theme.border, color: theme.text }}
            />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1" style={{ color: theme.textMuted }}>Sale Ends</label>
            <input
              type="datetime-local"
              name="discountEnd"
              value={form.discountEnd || ''}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: theme.border, color: theme.text }}
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div>
        <p className="text-sm font-bold mb-2" style={{ color: theme.text }}>Product Images</p>

        <div className="flex gap-2 mb-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={atMaxImages}
            placeholder="Paste image URL (Unsplash, CDN, etc.)"
            className="flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
            style={{ borderColor: theme.border, color: theme.text }}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
          />
          <Button type="button" variant="secondary" size="sm" onClick={addImage} icon={Link} disabled={atMaxImages}>Add URL</Button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={Upload}
            loading={uploading}
            disabled={atMaxImages}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? 'Uploading...' : 'Upload from Device'}
          </Button>
          <span className="text-xs" style={{ color: theme.textMuted }}>
            Saved to Supabase Storage ({images.length}/{MAX_IMAGES})
          </span>
        </div>

        {form.images?.length > 0 && (
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {form.images.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => openViewer(i)}
                  className="relative group shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2"
                  style={{ borderColor: theme.border }}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://placehold.co/80x80?text=Err'; }} />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                    className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {viewerOpen && images.length > 0 && (
        <div className="fixed inset-0 z-[60] bg-black/90">
          <button
            type="button"
            onClick={closeViewer}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/15 transition-colors"
          >
            <X size={22} className="text-white" />
          </button>

          <button
            type="button"
            onClick={() => goViewer(-1)}
            disabled={viewerIndex === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/15 transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={26} className="text-white" />
          </button>

          <button
            type="button"
            onClick={() => goViewer(1)}
            disabled={viewerIndex === images.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/15 transition-colors disabled:opacity-30"
          >
            <ChevronRight size={26} className="text-white" />
          </button>

          <div
            ref={viewerStripRef}
            className="h-full w-full flex overflow-x-auto snap-x snap-mandatory"
            style={{ scrollBehavior: 'smooth' }}
            onScroll={(e) => {
              const el = e.currentTarget;
              const idx = Math.round(el.scrollLeft / el.clientWidth);
              if (idx !== viewerIndex) setViewerIndex(idx);
            }}
          >
            {images.map((url, i) => (
              <div key={url + i} className="w-full h-full shrink-0 snap-start flex items-center justify-center">
                <img
                  src={url}
                  alt=""
                  className="max-w-full max-h-full object-contain select-none"
                  draggable={false}
                />
              </div>
            ))}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold">
            {viewerIndex + 1} / {images.length}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" size="lg" loading={loading} className="flex-1">
          {initial ? 'Update Product' : 'Add Product'}
        </Button>
        {onCancel && <Button type="button" variant="secondary" size="lg" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
};

export default ProductForm;
