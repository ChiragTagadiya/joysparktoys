import { useTheme } from '../../context/ThemeContext';

const Loader = ({ size = 40, fullScreen = false }) => {
  const { theme } = useTheme();

  const spinner = (
    <div
      className="rounded-full border-4 border-t-transparent animate-spin"
      style={{
        width: size,
        height: size,
        borderColor: `${theme.primaryLight} ${theme.primaryLight} ${theme.primaryLight} transparent`,
        borderTopColor: theme.primary,
      }}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
        {spinner}
        <p className="mt-4 text-sm font-medium" style={{ color: theme.textMuted }}>Loading...</p>
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12">{spinner}</div>;
};

export default Loader;
