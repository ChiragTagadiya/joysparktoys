import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const VARIANTS = {
  primary: 'text-white shadow-lg hover:shadow-xl',
  secondary: 'border-2 bg-transparent hover:text-white',
  ghost: 'bg-transparent hover:bg-opacity-10',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md',
};

const SIZES = {
  xs: 'px-3 py-1.5 text-xs rounded-lg',
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-2.5 text-sm rounded-xl',
  lg: 'px-8 py-3 text-base rounded-2xl',
  xl: 'px-10 py-4 text-lg rounded-2xl',
};

const Button = ({
  children, onClick, variant = 'primary', size = 'md',
  disabled = false, loading = false, fullWidth = false,
  className = '', type = 'button', icon: Icon, iconRight: IconRight,
  glow = false,
}) => {
  const { theme } = useTheme();

  const getStyle = () => {
    if (variant === 'primary') return { background: theme.gradient };
    if (variant === 'secondary') return { borderColor: theme.primary, color: theme.primary };
    if (variant === 'ghost') return { color: theme.primary };
    return {};
  };

  const getHoverClass = () => {
    if (variant === 'secondary') return 'hover:text-white';
    return '';
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      animate={glow && !disabled && !loading ? { boxShadow: [`0 0 0 0 ${theme.primary}80`, `0 0 0 14px ${theme.primary}00`] } : {}}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200
        ${SIZES[size]} ${VARIANTS[variant]} ${getHoverClass()}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${glow ? 'relative overflow-hidden' : ''}
        ${className}
      `}
      style={getStyle()}
    >
      {glow && !disabled && !loading && (
        <span className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }} />
      )}
      {loading ? (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon size={size === 'xs' || size === 'sm' ? 14 : 18} />
      ) : null}
      {children}
      {IconRight && !loading && <IconRight size={size === 'xs' || size === 'sm' ? 14 : 18} />}
    </motion.button>
  );
};

export default Button;
