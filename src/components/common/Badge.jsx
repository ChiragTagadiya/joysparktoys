const BADGE_STYLES = {
  sale: { bg: '#FEE2E2', color: '#B91C1C' },
  new: { bg: '#DBEAFE', color: '#1D4ED8' },
  hot: { bg: '#FEF3C7', color: '#B45309' },
  best: { bg: '#D1FAE5', color: '#065F46' },
  outofstock: { bg: '#F3F4F6', color: '#6B7280' },
};

const Badge = ({ type = 'sale', children, className = '' }) => {
  const style = BADGE_STYLES[type] || BADGE_STYLES.sale;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${className}`}
      style={{ background: style.bg, color: style.color }}
    >
      {children}
    </span>
  );
};

export default Badge;
