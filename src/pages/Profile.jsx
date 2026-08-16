import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Save, LogOut, Package, ShoppingBag, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateName } from '../utils/validators';
import { getInitials, formatDate } from '../utils/formatters';
import { ROUTES } from '../constants/routes';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import SEO from '../components/common/SEO';

const Profile = () => {
  const { theme } = useTheme();
  const { user, updateProfile, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: user?.name || '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: null }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = {};
    const nameErr = validateName(form.name);
    if (nameErr) errs.name = nameErr;
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    updateProfile(form);
    setSaving(false);
    addToast('Profile updated successfully!', 'success');
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
    addToast('Signed out successfully', 'info');
  };

  return (
    <div className="min-h-screen pt-48 md:pt-36 pb-16" style={{ background: theme.bg }}>
      <SEO title="My Profile" path="/profile" noindex={true} />
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-black mb-8" style={{ color: theme.text }}>My Profile</h1>

        {/* Avatar Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-sm border mb-6 text-center"
          style={{ borderColor: theme.border }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black text-white mx-auto mb-4 shadow-lg"
            style={{ background: theme.gradient }}
          >
            {getInitials(user?.name)}
          </div>
          <h2 className="text-2xl font-black mb-1" style={{ color: theme.text }}>{user?.name}</h2>
          {user?.phone && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <Phone size={14} style={{ color: theme.primary }} />
              <span className="text-sm font-semibold" style={{ color: theme.text }}>+91 {user.phone}</span>
              {user.phoneVerified && (
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: '#D1FAE5', color: '#065F46' }}>
                  <Shield size={10} /> Verified
                </span>
              )}
            </div>
          )}
          <p className="text-xs" style={{ color: theme.textMuted }}>Member since {formatDate(user?.createdAt)}</p>
          {user?.role === 'admin' && (
            <span className="inline-flex mt-3 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: theme.gradient }}>
              Admin
            </span>
          )}
        </motion.div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => navigate(ROUTES.ORDERS)}
            className="bg-white rounded-3xl p-6 shadow-sm border flex flex-col items-center gap-3 hover:shadow-md transition-all"
            style={{ borderColor: theme.border }}
          >
            <div className="p-3 rounded-2xl" style={{ background: `${theme.primary}15` }}>
              <Package size={24} style={{ color: theme.primary }} />
            </div>
            <span className="font-bold" style={{ color: theme.text }}>My Orders</span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => navigate(ROUTES.PRODUCTS)}
            className="bg-white rounded-3xl p-6 shadow-sm border flex flex-col items-center gap-3 hover:shadow-md transition-all"
            style={{ borderColor: theme.border }}
          >
            <div className="p-3 rounded-2xl" style={{ background: `${theme.secondary}15` }}>
              <ShoppingBag size={24} style={{ color: theme.secondary }} />
            </div>
            <span className="font-bold" style={{ color: theme.text }}>Shop Now</span>
          </motion.button>
        </div>

        {/* Edit Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-sm border mb-6"
          style={{ borderColor: theme.border }}
        >
          <h3 className="text-lg font-black mb-5" style={{ color: theme.text }}>Edit Profile</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              icon={User}
              error={errors.name}
              required
            />

            {/* Phone - Read-only verified number */}
            <div>
              <label className="text-sm font-semibold block mb-1.5" style={{ color: theme.text }}>Mobile Number</label>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border" style={{ borderColor: theme.border, background: '#F0FDF4' }}>
                <Phone size={16} style={{ color: theme.primary }} />
                <span className="text-sm font-semibold" style={{ color: theme.textMuted }}>+91</span>
                <span className="text-sm font-bold" style={{ color: theme.text }}>{user?.phone || 'Not set'}</span>
                {user?.phoneVerified && (
                  <span className="ml-auto flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#D1FAE5', color: '#065F46' }}>
                    <Shield size={10} /> Verified
                  </span>
                )}
              </div>
              <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Phone number is verified via OTP and cannot be changed</p>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={saving} icon={Save} fullWidth>
              Save Changes
            </Button>
          </form>
        </motion.div>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button variant="danger" size="lg" fullWidth onClick={handleLogout} icon={LogOut}>
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
