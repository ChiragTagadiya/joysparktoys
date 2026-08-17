import { useState } from 'react';
import { MapPin, User, Phone, Building2, Home, Briefcase, Shield } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { INDIAN_STATES, ADDRESS_LABELS } from '../../constants/india';
import { validateAddress } from '../../utils/validators';
import Input from '../common/Input';
import Button from '../common/Button';

const AddressForm = ({ onSubmit, initial = {} }) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  // Use verified phone from auth (non-editable), fallback to initial
  const verifiedPhone = user?.phone || '';

  const [form, setForm] = useState({
    fullName: initial.fullName || user?.name || '',
    phone: verifiedPhone || initial.phone || '',
    addressLine1: initial.addressLine1 || '',
    addressLine2: initial.addressLine2 || '',
    landmark: initial.landmark || '',
    city: initial.city || '',
    state: initial.state || '',
    pincode: initial.pincode || '',
    type: initial.type || 'home',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // If phone is verified, don't allow changes
      if (verifiedPhone) return;
      const digits = String(value || '').replace(/\D/g, '').slice(0, 10);
      setForm((p) => ({ ...p, phone: digits }));
      setErrors((p) => ({ ...p, phone: null }));
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateAddress(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(form);
  };

  const ADDRESS_TYPES = [
    { value: 'home', label: 'Home', icon: Home },
    { value: 'work', label: 'Work', icon: Briefcase },
    { value: 'other', label: 'Other', icon: MapPin },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Address Type */}
      <div>
        <p className="text-sm font-bold mb-2" style={{ color: theme.text }}>Address Type</p>
        <div className="flex gap-3">
          {ADDRESS_TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm((p) => ({ ...p, type: value }))}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all"
              style={{
                borderColor: form.type === value ? theme.primary : theme.border,
                background: form.type === value ? `${theme.primary}15` : 'white',
                color: form.type === value ? theme.primary : theme.textMuted,
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Full Name" name="fullName" value={form.fullName} onChange={handleChange}
          placeholder="As per govt. ID" icon={User} error={errors.fullName} required />

        {/* Phone field - non-editable if verified via OTP */}
        {verifiedPhone ? (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold" style={{ color: theme.text }}>
              Mobile Number <span style={{ color: theme.error }}>*</span>
            </label>
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border"
              style={{ borderColor: theme.border, background: '#F0FDF4' }}
            >
              <Phone size={16} style={{ color: theme.primary }} />
              <span className="text-sm font-semibold" style={{ color: theme.textMuted }}>+91</span>
              <span className="text-sm font-bold" style={{ color: theme.text }}>{verifiedPhone}</span>
              <span className="ml-auto flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: '#D1FAE5', color: '#065F46' }}>
                <Shield size={10} /> Verified
              </span>
            </div>
            <p className="text-xs" style={{ color: '#059669' }}>
              OTP verified number - used for delivery updates
            </p>
          </div>
        ) : (
          <Input label="Mobile Number" name="phone" type="tel" value={form.phone} onChange={handleChange}
            placeholder="10-digit mobile" icon={Phone} prefix="+91" error={errors.phone} required
            inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10}
            hint="Indian mobile number (starts with 6-9)" />
        )}
      </div>

      <Input label="Address Line 1" name="addressLine1" value={form.addressLine1} onChange={handleChange}
        placeholder="House/Flat no., Building, Street" icon={Building2} error={errors.addressLine1} required />

      <Input label="Address Line 2 (Optional)" name="addressLine2" value={form.addressLine2} onChange={handleChange}
        placeholder="Area, Colony, Sector" icon={MapPin} />

      <Input label="Landmark (Optional)" name="landmark" value={form.landmark} onChange={handleChange}
        placeholder="Near famous location" icon={MapPin} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="City / Town" name="city" value={form.city} onChange={handleChange}
          placeholder="Your city" error={errors.city} required />
        <Input label="State" name="state" value={form.state} onChange={handleChange}
          as="select" options={INDIAN_STATES} error={errors.state} required />
        <Input label="PIN Code" name="pincode" value={form.pincode} onChange={handleChange}
          placeholder="6-digit PIN" error={errors.pincode} required hint="India PIN code" />
      </div>

      <div className="pt-2">
        <Button type="submit" variant="primary" size="lg" fullWidth icon={MapPin}>
          Save & Continue
        </Button>
      </div>
    </form>
  );
};

export default AddressForm;
