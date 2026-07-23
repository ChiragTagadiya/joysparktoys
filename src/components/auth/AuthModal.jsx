import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Mail, Lock, User, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateEmail, validatePassword, validateName, validateConfirmPassword } from '../../utils/validators';
import Button from '../common/Button';
import Input from '../common/Input';

const AuthModal = ({ isOpen, onClose, defaultTab = 'login' }) => {
  const { theme } = useTheme();
  const { login, register, authError, loading, clearError } = useAuth();
  const { addToast } = useToast();

  const [tab, setTab] = useState(defaultTab);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) { clearError(); setErrors({}); }
  }, [isOpen, tab, clearError]);

  const handleLoginChange = (e) => {
    setLoginForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: null }));
  };

  const handleRegisterChange = (e) => {
    setRegisterForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: null }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const emailErr = validateEmail(loginForm.email);
    if (emailErr) newErrors.email = emailErr;
    if (!loginForm.password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    const ok = await login(loginForm.email, loginForm.password);
    if (ok) {
      addToast('Welcome back! 🎉', 'success');
      onClose();
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const nameErr = validateName(registerForm.name);
    if (nameErr) newErrors.name = nameErr;
    const emailErr = validateEmail(registerForm.email);
    if (emailErr) newErrors.email = emailErr;
    const passErr = validatePassword(registerForm.password);
    if (passErr) newErrors.password = passErr;
    const confirmErr = validateConfirmPassword(registerForm.password, registerForm.confirmPassword);
    if (confirmErr) newErrors.confirmPassword = confirmErr;
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    const ok = await register(registerForm.name, registerForm.email, registerForm.password);
    if (ok) {
      addToast(`Welcome to Little Joy, ${registerForm.name}! 🧸`, 'success');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4" style={{ background: theme.heroGradient }}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors"
            >
              <X size={20} style={{ color: theme.text }} />
            </button>
            <div className="text-center mb-4">
              <span className="text-4xl block mb-2">🧸</span>
              <h2 className="text-2xl font-black" style={{ background: theme.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Little Joy
              </h2>
              <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
                {tab === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account today!'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex rounded-2xl overflow-hidden border-2" style={{ borderColor: theme.border, background: 'white' }}>
              {['login', 'register'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 py-2.5 text-sm font-bold transition-all capitalize"
                  style={{
                    background: tab === t ? theme.gradient : 'transparent',
                    color: tab === t ? 'white' : theme.textMuted,
                  }}
                >
                  {t === 'login' ? '🔑 Login' : '✨ Sign Up'}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-5">
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-2xl text-sm font-medium"
                style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FCA5A5' }}
              >
                ⚠️ {authError}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {tab === 'login' ? (
                <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleLogin} className="space-y-4">
                  <Input label="Email Address" name="email" type="email" value={loginForm.email} onChange={handleLoginChange} placeholder="you@example.com" icon={Mail} error={errors.email} required />
                  <div>
                    <Input label="Password" name="password" type={showPass ? 'text' : 'password'} value={loginForm.password} onChange={handleLoginChange} placeholder="Your password" icon={Lock} error={errors.password} required
                      suffix={
                        <button type="button" onClick={() => setShowPass((p) => !p)}>
                          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />
                  </div>
                  <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} icon={Sparkles}>
                    Sign In
                  </Button>
                  <p className="text-center text-sm" style={{ color: theme.textMuted }}>
                    Don't have an account?{' '}
                    <button type="button" onClick={() => setTab('register')} className="font-bold" style={{ color: theme.primary }}>Sign up</button>
                  </p>
                </motion.form>
              ) : (
                <motion.form key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleRegister} className="space-y-4">
                  <Input label="Full Name" name="name" type="text" value={registerForm.name} onChange={handleRegisterChange} placeholder="Your full name" icon={User} error={errors.name} required />
                  <Input label="Email Address" name="email" type="email" value={registerForm.email} onChange={handleRegisterChange} placeholder="you@example.com" icon={Mail} error={errors.email} required />
                  <Input label="Password" name="password" type={showPass ? 'text' : 'password'} value={registerForm.password} onChange={handleRegisterChange} placeholder="Min 8 chars, 1 uppercase, 1 number" icon={Lock} error={errors.password} required />
                  <Input label="Confirm Password" name="confirmPassword" type={showConfirmPass ? 'text' : 'password'} value={registerForm.confirmPassword} onChange={handleRegisterChange} placeholder="Repeat your password" icon={Lock} error={errors.confirmPassword} required />
                  <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} icon={Sparkles}>
                    Create Account
                  </Button>
                  <p className="text-center text-sm" style={{ color: theme.textMuted }}>
                    Already have an account?{' '}
                    <button type="button" onClick={() => setTab('login')} className="font-bold" style={{ color: theme.primary }}>Sign in</button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
