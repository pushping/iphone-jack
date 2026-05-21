import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Upload, Wand2, Film, Menu, X, LogIn, UserPlus, LogOut, User, Shield } from 'lucide-react';
import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/utils';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { path: '/', label: '首页', icon: Sparkles },
  { path: '/upload', label: '上传', icon: Upload },
  { path: '/generate', label: '生成', icon: Wand2 },
  { path: '/video', label: '视频', icon: Film },
] as const;

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);

  const currentPath = location.pathname;

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate('/');
  }, [signOut, navigate]);

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

  // Auth section for desktop
  const desktopAuth = user ? (
    <div className="relative">
      <button
        onClick={() => setUserMenuOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
      >
        <div className="w-7 h-7 rounded-full neon-border-cyan flex items-center justify-center text-xs font-bold text-neon-cyan">
          {(user.displayName || user.email)[0].toUpperCase()}
        </div>
        <span className="hidden lg:inline max-w-[120px] truncate">
          {user.displayName || user.email}
        </span>
      </button>

      {userMenuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 glass-strong rounded-xl py-2 z-50">
            <div className="px-4 py-2 border-b border-white/10 mb-1">
              <p className="text-sm text-white truncate">{user.displayName || user.email}</p>
              <p className="text-xs text-gray-500">{user.subscriptionTier === 'paid' ? '付费版' : '免费版'}</p>
            </div>
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-neon-purple hover:bg-white/5 transition-all"
              >
                <Shield className="w-4 h-4" />
                管理后台
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-white/5 transition-all"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>
        </>
      )}
    </div>
  ) : (
    <div className="hidden md:flex items-center gap-2">
      <Link
        to="/login"
        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-all"
      >
        登录
      </Link>
      <Link
        to="/register"
        className="neon-btn-cyan px-4 py-2 rounded-lg text-sm text-white"
      >
        注册
      </Link>
    </div>
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

          {/* Desktop Auth + Mobile Toggle */}
          <div className="flex items-center gap-2">
            {desktopAuth}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={toggleMobile}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 border-t border-white/10 pt-3">
            {mobileNav}
            <div className="border-t border-white/10 mt-3 pt-3">
              {user ? (
                <>
                  <div className="px-4 py-2 mb-2">
                    <p className="text-sm text-white">{user.displayName || user.email}</p>
                    <p className="text-xs text-gray-500">{user.subscriptionTier === 'paid' ? '付费版' : '免费版'}</p>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={closeMobile}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-neon-purple hover:bg-white/5"
                    >
                      <Shield className="w-5 h-5" />
                      管理后台
                    </Link>
                  )}
                  <button
                    onClick={() => { handleSignOut(); closeMobile(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-white/5"
                  >
                    <LogOut className="w-5 h-5" />
                    退出登录
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMobile}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    <LogIn className="w-5 h-5" />
                    登录
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobile}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-neon-cyan hover:bg-white/5"
                  >
                    <UserPlus className="w-5 h-5" />
                    注册
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
