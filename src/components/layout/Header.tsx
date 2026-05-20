import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Upload, Wand2, Film, Menu, X } from 'lucide-react';
import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/utils';

const NAV_ITEMS = [
  { path: '/', label: '首页', icon: Sparkles },
  { path: '/upload', label: '上传', icon: Upload },
  { path: '/generate', label: '生成', icon: Wand2 },
  { path: '/video', label: '视频', icon: Film },
] as const;

export function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);

  const currentPath = location.pathname;

  // Memoize nav items rendering to avoid re-creating on every render
  const desktopNav = useMemo(
    () =>
      NAV_ITEMS.map((item) => {
        const isActive = currentPath === item.path;
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              isActive
                ? 'neon-border-cyan text-neon-cyan bg-neon-cyan/5'
                : 'text-gray-400 hover:text-white hover:bg-white/5',
            )}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      }),
    [currentPath],
  );

  const mobileNav = useMemo(
    () =>
      NAV_ITEMS.map((item) => {
        const isActive = currentPath === item.path;
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={closeMobile}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
              isActive
                ? 'neon-border-cyan text-neon-cyan bg-neon-cyan/5'
                : 'text-gray-400 hover:text-white hover:bg-white/5',
            )}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        );
      }),
    [currentPath, closeMobile],
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Sparkles className="w-7 h-7 text-neon-cyan group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold text-white neon-text-cyan">
              iPhone Jack
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {desktopNav}
          </nav>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={toggleMobile}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 border-t border-white/10 pt-3">
            {mobileNav}
          </nav>
        )}
      </div>
    </header>
  );
}
