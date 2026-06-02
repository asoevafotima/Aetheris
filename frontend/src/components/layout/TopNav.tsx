import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Zap, Sun, Moon, Globe, User, Settings, LogOut, Bell, ChevronDown, Menu, X, ShieldCheck } from 'lucide-react';
import { useAuthStore }  from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useT }          from '../../i18n';
import { useQuery }      from '@tanstack/react-query';
import { notificationsApi } from '../../api/endpoints';

export function TopNav() {
  const { user, logout }                          = useAuthStore();
  const { theme, toggleTheme, lang, toggleLang }  = useThemeStore();
  const navigate  = useNavigate();
  const t         = useT();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen,   setUserOpen]   = useState(false);
  const isDark = theme === 'dark';

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: notificationsApi.unreadCount,
    refetchInterval: 30_000,
  });
  const unread = unreadData?.count ?? 0;

  const NAV = [
    { to: '/dashboard',      label: t.nav.home      },
    { to: '/problems',       label: t.nav.problems   },
    { to: '/contests',       label: t.nav.contests   },
    { to: '/duels',          label: t.nav.duels      },
    { to: '/teams',          label: t.nav.teams      },
    { to: '/ai-mentor',      label: t.nav.ai         },
    { to: '/visualizations', label: t.nav.viz        },
    { to: '/leaderboard',    label: t.nav.rating     },
    { to: '/training',       label: t.nav.training   },
  ];

  const handleLogout = async () => { await logout(); navigate('/'); };

  const linkCls = (active: boolean) =>
    `px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-150 ${
      active
        ? 'bg-[var(--accent-light)] text-[var(--accent-text)]'
        : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--hover)]'
    }`;

  return (
    <header className="nav-theme sticky top-0 z-50">
      {/* Единственная строка навигации */}
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center gap-4">

        {/* Лого */}
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0 mr-2">
          <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center glow-pulse shadow-sm">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-black text-[15px] gradient-text hidden sm:block tracking-tight">Aetheris</span>
        </Link>

        {/* Разделитель */}
        <div className="w-px h-5 bg-[var(--border)] shrink-0" />

        {/* Ссылки навигации (десктоп) */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto">
          {NAV.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => linkCls(isActive)}>
              {label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) =>
              `px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                isActive ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                         : 'text-[var(--text-3)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`
            }>
              {t.nav.admin}
            </NavLink>
          )}
        </nav>

        {/* Правая часть */}
        <div className="flex items-center gap-1 ml-auto shrink-0">

          {/* Тема */}
          <button onClick={toggleTheme} title={isDark ? 'Светлая тема' : 'Тёмная тема'}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--hover)] transition-all cursor-pointer">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Язык */}
          <button onClick={toggleLang} title={lang === 'ru' ? 'Switch to English' : 'На русский'}
            className="h-8 px-2 rounded-lg flex items-center gap-1 text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--hover)] transition-all cursor-pointer">
            <Globe size={14} />
            <span className="text-xs font-bold">{lang.toUpperCase()}</span>
          </button>

          {/* Уведомления */}
          <Link to="/notifications" className="relative w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--hover)] transition-all">
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center leading-none">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>

          {/* Разделитель */}
          <div className="w-px h-5 bg-[var(--border)] mx-1" />

          {/* Аватар + дропдаун */}
          <div className="relative">
            <button onClick={() => setUserOpen(!userOpen)}
              className="flex items-center gap-1.5 h-8 px-2 rounded-lg hover:bg-[var(--hover)] transition-all cursor-pointer">
              <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                {user?.username?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-sm font-medium text-[var(--text-1)] hidden sm:block max-w-[100px] truncate">
                {user?.username}
              </span>
              <ChevronDown size={12} className="text-[var(--text-3)] hidden sm:block" />
            </button>

            {userOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
                <div className="absolute right-0 top-10 z-20 w-52 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-app-md overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--border)]">
                    <p className="text-sm font-semibold text-[var(--text-1)] truncate">{user?.username}</p>
                    <p className="text-xs text-[var(--text-3)] truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link to="/profile" onClick={() => setUserOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--hover)] transition-colors">
                      <User size={14} /> {t.nav.profile}
                    </Link>
                    <Link to="/settings" onClick={() => setUserOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--hover)] transition-colors">
                      <Settings size={14} /> {t.nav.settings}
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" onClick={() => setUserOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-[var(--hover)] transition-colors">
                        <ShieldCheck size={14} /> {t.nav.admin}
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-[var(--border)] py-1">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-[var(--hover)] transition-colors cursor-pointer">
                      <LogOut size={14} /> {t.nav.logout}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Бургер (мобильный) */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-2)] hover:bg-[var(--hover)] transition-all cursor-pointer ml-1">
            {mobileOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 grid grid-cols-2 gap-1">
          {NAV.map(({ to, label }) => (
            <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
              className={({ isActive }) => linkCls(isActive)}>
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
