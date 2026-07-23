import { createContext, useContext, useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { THEMES, DEFAULT_THEME } from '../constants/colors';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(
    () => localStorage.getItem('lj_theme') || DEFAULT_THEME
  );

  const theme = THEMES[themeName] || THEMES[DEFAULT_THEME];

  const applyTheme = useCallback((t) => {
    const root = document.documentElement;
    Object.entries(t).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--color-${key}`, value);
      }
    });
  }, []);

  useLayoutEffect(() => {
    applyTheme(theme);
    localStorage.setItem('lj_theme', themeName);
  }, [themeName, theme, applyTheme]);

  const changeTheme = useCallback((name) => {
    if (THEMES[name]) setThemeName(name);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, themeName, changeTheme, allThemes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
