import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Shield, User, Sparkles, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validatePhone, validateName } from '../../utils/validators';
import Button from '../common/Button';
import Input from '../common/Input';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds

const AuthModal = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const { sendOtp, verifyOtp, resendOtp, updateProfile, authError, loading, clearError } = useAuth();
  const { addToast } = useToast();

  // Steps: 'phone' | 'otp' | 'name'
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);
  const otpInputRef = useRef(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      clearError();
      setErrors({});
      setStep('phone');
      setOtp('');
      setSessionId('');
      setName('');
      setResendTimer(0);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen, clearError]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resendTimer]);

  // Auto-focus OTP input when step changes
  useEffect(() => {
    if (step === 'otp' && otpInputRef.current) {
      setTimeout(() => otpInputRef.current?.focus(), 300);
    }
  }, [step]);

  const handlePhoneChange = (e) => {
    const digits = String(e.target.value || '').replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    setErrors((p) => ({ ...p, phone: null }));
  };

  const handleOtpChange = (e) => {
    const digits = String(e.target.value || '').replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(digits);
    setErrors((p) => ({ ...p, otp: null }));
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    setErrors((p) => ({ ...p, name: null }));
  };

  /** Step 1: Send OTP */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const phoneErr = validatePhone(phone);
    if (phoneErr) { setErrors({ phone: phoneErr }); return; }

    setSubmitting(true);
    const result = await sendOtp(phone);
    setSubmitting(false);

    if (result.ok) {
      setSessionId(result.sessionId);
      setStep('otp');
      setResendTimer(RESEND_COOLDOWN);
      setOtp('');
    }
  };

  /** Step 2: Verify OTP */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== OTP_LENGTH) {
      setErrors({ otp: `Enter ${OTP_LENGTH}-digit OTP` });
      return;
    }

    setSubmitting(true);
    const result = await verifyOtp(phone, sessionId, otp, name);
    setSubmitting(false);

    if (result.ok) {
      if (result.isNew) {
        // New user — ask for name
        setStep('name');
      } else {
        addToast('Welcome back! Verified successfully.', 'success');
        onClose();
      }
    }
  };

  /** Step 3: Save name (new users) */
  const handleSaveName = async (e) => {
    e.preventDefault();
    const nameErr = validateName(name);
    if (nameErr) { setErrors({ name: nameErr }); return; }

    setSubmitting(true);
    await updateProfile({ name });
    setSubmitting(false);
    addToast(`Welcome to Joy Spark Toys, ${name}!`, 'success');
    onClose();
  };

  /** Resend OTP */
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setSubmitting(true);
    const result = await resendOtp(phone);
    setSubmitting(false);

    if (result.ok) {
      setSessionId(result.sessionId);
      setResendTimer(RESEND_COOLDOWN);
      setOtp('');
      addToast('OTP sent again!', 'info');
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
            <div className="text-center mb-2">
              <img src="/logo.png" alt="Joy Spark Toys" className="h-12 mx-auto mb-2" />
              <h2 className="text-xl font-black" style={{ color: theme.text }}>
                {step === 'phone' && 'Login / Sign Up'}
                {step === 'otp' && 'Verify OTP'}
                {step === 'name' && 'Almost Done!'}
              </h2>
              <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
                {step === 'phone' && 'Enter your mobile number to continue'}
                {step === 'otp' && `OTP sent to +91 ${phone}`}
                {step === 'name' && 'Tell us your name'}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            {/* Error message */}
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200"
              >
                {authError}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {/* Step 1: Phone Input */}
              {step === 'phone' && (
                <motion.form
                  key="phone-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSendOtp}
                  className="space-y-4"
                >
                  <Input
                    label="Mobile Number"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="Enter 10-digit mobile number"
                    icon={Phone}
                    prefix="+91"
                    error={errors.phone}
                    required
                    inputMode="numeric"
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    hint="Indian mobile number (starts with 6-9)"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={submitting}
                    icon={Sparkles}
                  >
                    Send OTP
                  </Button>
                  <p className="text-xs text-center" style={{ color: theme.textMuted }}>
                    You will receive a verification OTP via SMS or Call
                  </p>
                  <p className="text-xs text-center" style={{ color: theme.textMuted }}>
                    By continuing, you agree to our Terms of Service
                  </p>
                </motion.form>
              )}

              {/* Step 2: OTP Verification */}
              {step === 'otp' && (
                <motion.form
                  key="otp-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-sm font-semibold block mb-1.5" style={{ color: theme.text }}>
                      Enter OTP <span style={{ color: theme.error }}>*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: theme.primary }}>
                        <Shield size={16} />
                      </div>
                      <input
                        ref={otpInputRef}
                        type="text"
                        value={otp}
                        onChange={handleOtpChange}
                        placeholder="Enter 6-digit OTP"
                        inputMode="numeric"
                        maxLength={OTP_LENGTH}
                        autoComplete="one-time-code"
                        className="w-full py-3 pl-10 pr-4 rounded-xl border text-center text-lg font-bold tracking-[0.3em] transition-all focus:outline-none focus:ring-2"
                        style={{
                          borderColor: errors.otp ? theme.error : theme.border,
                          color: theme.text,
                        }}
                      />
                    </div>
                    {errors.otp && <p className="text-xs mt-1" style={{ color: theme.error }}>{errors.otp}</p>}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={submitting}
                    icon={Shield}
                  >
                    Verify & Continue
                  </Button>

                  {/* Resend OTP */}
                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-sm" style={{ color: theme.textMuted }}>
                        Resend OTP in <span className="font-bold" style={{ color: theme.primary }}>{resendTimer}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        className="text-sm font-semibold hover:underline"
                        style={{ color: theme.primary }}
                        disabled={submitting}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  {/* Back to phone */}
                  <button
                    type="button"
                    onClick={() => { setStep('phone'); clearError(); }}
                    className="flex items-center gap-1 text-sm font-medium mx-auto"
                    style={{ color: theme.textMuted }}
                  >
                    <ArrowLeft size={14} /> Change number
                  </button>
                </motion.form>
              )}

              {/* Step 3: Name Input (new users) */}
              {step === 'name' && (
                <motion.form
                  key="name-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSaveName}
                  className="space-y-4"
                >
                  <Input
                    label="Your Name"
                    name="name"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Enter your full name"
                    icon={User}
                    error={errors.name}
                    required
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={submitting}
                    icon={Sparkles}
                  >
                    Continue Shopping
                  </Button>
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
