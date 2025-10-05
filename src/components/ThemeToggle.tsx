import { useMemo } from 'react';

type ThemePreference = 'system' | 'light' | 'dark';
type ResolvedTheme = 'light' | 'dark';

interface ThemeToggleProps {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  onToggle: () => void;
}

const SunIcon = () => (
  <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 4a1 1 0 011 1v1a1 1 0 01-2 0V5a1 1 0 011-1zm5.657 2.343a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM19 11a1 1 0 100 2h1a1 1 0 100-2h-1zm-7 7a1 1 0 011 1v1a1 1 0 01-2 0v-1a1 1 0 011-1zm-7-7a1 1 0 100 2H4a1 1 0 100-2h1zm1.05-5.657a1 1 0 011.414 0l.708.707A1 1 0 016.758 8l-.707-.707a1 1 0 010-1.414zM7.465 17.536a1 1 0 010 1.414l-.708.707a1 1 0 11-1.414-1.414l.708-.707a1 1 0 011.414 0zM18.364 17.95a1 1 0 010 1.414l-.708.707a1 1 0 01-1.414-1.414l.708-.707a1 1 0 011.414 0z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const MoonIcon = () => (
  <svg className="h-4 w-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21 12.79A9 9 0 0111.21 3 7 7 0 1019 14.79 9.05 9.05 0 0121 12.79z" />
  </svg>
);

const MonitorIcon = () => (
  <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 5h16a1 1 0 011 1v10a1 1 0 01-1 1h-6l1 2h2a1 1 0 010 2H8a1 1 0 010-2h2l1-2H4a1 1 0 01-1-1V6a1 1 0 011-1zm1 2v8h14V7H5z" />
  </svg>
);

export const ThemeToggle = ({ theme, resolvedTheme, onToggle }: ThemeToggleProps) => {
  const label = useMemo(() => {
    if (theme === 'system') return 'Auto';
    return resolvedTheme === 'dark' ? 'Dark' : 'Light';
  }, [theme, resolvedTheme]);

  const Icon = useMemo(() => {
    if (theme === 'system') return <MonitorIcon />;
    return resolvedTheme === 'dark' ? <MoonIcon /> : <SunIcon />;
  }, [theme, resolvedTheme]);

  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
      aria-label={`Cycle theme (current: ${label})`}
      title={`Theme: ${label}`}
    >
      {Icon}
      <span>{label}</span>
    </button>
  );
};

export type { ThemePreference, ResolvedTheme };
