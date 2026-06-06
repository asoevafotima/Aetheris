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
    { to: '/leaderboard',    label: t.nav.rating     },
    { to: '/training',       label: t.nav.training   },
  ];

  const handleLogout = async () => { await logout(); navigate('/'); };

  const navBg       = isDark ? 'rgba(4,8,15,0.92)'        : 'rgba(255,255,255,0.92)';
  const navBorder   = isDark ? 'rgba(255,255,255,0.07)'   : 'rgba(0,0,0,0.08)';
  const iconColor   = isDark ? 'rgba(255,255,255,0.45)'   : 'rgba(0,0,0,0.45)';
  const userColor   = isDark ? 'rgba(255,255,255,0.8)'    : 'rgba(0,0,0,0.8)';
  const chevColor   = isDark ? 'rgba(255,255,255,0.35)'   : 'rgba(0,0,0,0.35)';
  const hoverBg     = isDark ? 'hover:bg-white/8'         : 'hover:bg-black/5';
  const dropBg      = isDark ? 'rgba(6,12,28,0.97)'       : 'rgba(255,255,255,0.98)';
  const dropBorder  = isDark ? 'rgba(255,255,255,0.1)'    : 'rgba(0,0,0,0.1)';
  const dropUserN   = isDark ? 'rgba(255,255,255,0.88)'   : 'rgba(0,0,0,0.88)';
  const dropUserE   = isDark ? 'rgba(255,255,255,0.35)'   : 'rgba(0,0,0,0.4)';
  const dropItemC   = isDark ? 'rgba(255,255,255,0.65)'   : 'rgba(0,0,0,0.65)';
  const dropHover   = isDark ? 'hover:bg-white/5'         : 'hover:bg-black/5';
  const dividerBg   = isDark ? 'rgba(255,255,255,0.1)'    : 'rgba(0,0,0,0.1)';

  const linkCls = (active: boolean) =>
    `px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-150 ${
      active
        ? isDark
          ? 'bg-indigo-500/20 text-indigo-300'
          : 'bg-indigo-50 text-indigo-600'
        : isDark
          ? 'text-white/45 hover:text-white/85 hover:bg-white/5'
          : 'text-black/50 hover:text-black/80 hover:bg-black/5'
    }`;

  return (
    <header className="sticky top-0 z-50" style={{ background: navBg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: `1px solid ${navBorder}` }}>
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
        <div className="w-px h-5 shrink-0" style={{ background: dividerBg }} />

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
                isActive ? 'bg-red-100 text-red-700' : 'text-red-400 hover:text-red-600 hover:bg-red-50'
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
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${hoverBg}`}
            style={{ color: iconColor }}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Язык */}
          <button onClick={toggleLang} title={lang === 'ru' ? 'Switch to English' : 'На русский'}
            className={`h-8 px-2 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${hoverBg}`}
            style={{ color: iconColor }}>
            <Globe size={14} />
            <span className="text-xs font-bold">{lang.toUpperCase()}</span>
          </button>

          {/* Уведомления */}
          <Link to="/notifications" className={`relative w-8 h-8 rounded-lg flex items-center justify-center ${hoverBg} transition-all`}
            style={{ color: iconColor }}>
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center leading-none">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>

          {/* Разделитель */}
          <div className="w-px h-5 mx-1" style={{ background: dividerBg }} />

          {/* Аватар + дропдаун */}
          <div className="relative">
            <button onClick={() => setUserOpen(!userOpen)}
              className={`flex items-center gap-1.5 h-8 px-2 rounded-lg ${hoverBg} transition-all cursor-pointer`}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg,#1d4ed8,#f59e0b)' }}>
                {user?.username?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate" style={{ color: userColor }}>
                {user?.username}
              </span>
              <ChevronDown size={12} className="hidden sm:block" style={{ color: chevColor }} />
            </button>

            {userOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
                <div className="absolute right-0 top-10 z-20 w-52 rounded-xl overflow-hidden"
                  style={{ background: dropBg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: `1px solid ${dropBorder}`, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
                  <div className="px-4 py-3" style={{ borderBottom: `1px solid ${dropBorder}` }}>
                    <p className="text-sm font-semibold truncate" style={{ color: dropUserN }}>{user?.username}</p>
                    <p className="text-xs truncate" style={{ color: dropUserE }}>{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link to="/profile" onClick={() => setUserOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${dropHover}`}
                      style={{ color: dropItemC }}>
                      <User size={14} /> {t.nav.profile}
                    </Link>
                    <Link to="/settings" onClick={() => setUserOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${dropHover}`}
                      style={{ color: dropItemC }}>
                      <Settings size={14} /> {t.nav.settings}
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" onClick={() => setUserOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-red-500/10"
                        style={{ color: '#f87171' }}>
                        <ShieldCheck size={14} /> {t.nav.admin}
                      </Link>
                    )}
                  </div>
                  <div className="py-1" style={{ borderTop: `1px solid ${dropBorder}` }}>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer hover:bg-red-500/10"
                      style={{ color: '#f87171' }}>
                      <LogOut size={14} /> {t.nav.logout}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Бургер (мобильный) */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden w-8 h-8 rounded-lg flex items-center justify-center ${hoverBg} transition-all cursor-pointer ml-1`}
            style={{ color: iconColor }}>
            {mobileOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {mobileOpen && (
        <div className="lg:hidden px-4 py-3 grid grid-cols-2 gap-1" style={{ borderTop: `1px solid ${navBorder}`, background: isDark ? 'rgba(4,8,15,0.97)' : 'rgba(255,255,255,0.97)' }}>
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
