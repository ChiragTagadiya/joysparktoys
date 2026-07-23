import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: { bg: '#ECFDF5', border: '#10B981', icon: '#10B981', text: '#065F46' },
  error: { bg: '#FEF2F2', border: '#EF4444', icon: '#EF4444', text: '#7F1D1D' },
  warning: { bg: '#FFFBEB', border: '#F59E0B', icon: '#F59E0B', text: '#78350F' },
  info: { bg: '#EFF6FF', border: '#3B82F6', icon: '#3B82F6', text: '#1E3A8A' },
};

const ToastItem = ({ toast, onRemove }) => {
  const Icon = ICONS[toast.type] || Info;
  const colors = COLORS[toast.type] || COLORS.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      className="flex items-start gap-3 p-4 rounded-2xl shadow-xl border min-w-[280px] max-w-sm"
      style={{ background: colors.bg, borderColor: colors.border }}
    >
      <Icon size={20} style={{ color: colors.icon, flexShrink: 0, marginTop: 1 }} />
      <p className="flex-1 text-sm font-medium" style={{ color: colors.text }}>{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X size={16} style={{ color: colors.text }} />
      </button>
    </motion.div>
  );
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
