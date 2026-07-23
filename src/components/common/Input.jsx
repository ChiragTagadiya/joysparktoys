import { useTheme } from '../../context/ThemeContext';

const Input = ({
  label, name, type = 'text', value, onChange, onBlur,
  placeholder, error, required = false, disabled = false,
  icon: Icon, prefix, suffix, className = '', as = 'input',
  rows = 3, options = [], hint,
  maxLength, inputMode, pattern,
}) => {
  const { theme } = useTheme();

  const borderStyle = error
    ? { borderColor: theme.error }
    : { borderColor: theme.border };

  const focusRing = `focus:outline-none focus:ring-2`;

  const commonProps = {
    id: name, name, value, onChange, onBlur, disabled, required,
    placeholder,
    maxLength,
    inputMode,
    pattern,
    className: `
      w-full px-4 py-2.5 rounded-xl border bg-white transition-all duration-200 text-sm
      ${focusRing} ${Icon ? 'pl-10' : ''} ${prefix ? 'pl-14' : ''}
      ${disabled ? 'bg-gray-50 cursor-not-allowed text-gray-400' : 'text-gray-800'}
      ${className}
    `,
    style: borderStyle,
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={name} className="text-sm font-semibold" style={{ color: theme.text }}>
          {label} {required && <span style={{ color: theme.error }}>*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: theme.primary }}>
            <Icon size={16} />
          </div>
        )}
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: theme.textMuted }}>
            {prefix}
          </span>
        )}
        {as === 'textarea' ? (
          <textarea {...commonProps} rows={rows} />
        ) : as === 'select' ? (
          <select {...commonProps}>
            <option value="">-- Select --</option>
            {options.map((opt) => (
              <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
                {typeof opt === 'string' ? opt : opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input type={type} {...commonProps} />
        )}
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: theme.textMuted }}>
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs" style={{ color: theme.error }}>{error}</p>}
      {hint && !error && <p className="text-xs" style={{ color: theme.textMuted }}>{hint}</p>}
    </div>
  );
};

export default Input;
