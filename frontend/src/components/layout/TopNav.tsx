import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Sun, Moon, Globe, User, Settings, LogOut,
  Bell, ChevronDown, Menu, X, ShieldCheck,
} from 'lucide-react';
import { useAuthStore }  from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useT }          from '../../i18n';
import { useQuery }      from '@tanstack/react-query';
import { notificationsApi } from '../../api/endpoints';

export function TopNav() {
  const { user, logout }                         = useAuthStore();
  const { theme, toggleTheme, lang, toggleLang } = useThemeStore();
  const navigate = useNavigate();
  const t        = useT();
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
    { to: '/dashboard',      label: t.nav.home     },
    { to: '/problems',       label: t.nav.problems  },
    { to: '/contests',       label: t.nav.contests  },
    { to: '/duels',          label: t.nav.duels     },
    { to: '/teams',          label: t.nav.teams     },
    { to: '/ai-mentor',      label: t.nav.ai        },
    { to: '/leaderboard',    label: t.nav.rating    },
    { to: '/training',       label: t.nav.training  },
  ];

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <header className="nav-theme sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-5 h-14 flex items-center gap-3">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0 mr-2 group">
          <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center glow-pulse shadow-lg shadow-purple-600/30 group-hover:shadow-purple-500/50 transition-shadow">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-black text-[15px] gradient-text hidden sm:block tracking-tight">Aetheris</span>
        </Link>

        <div className="w-px h-5 bg-[var(--border)] shrink-0" />

        {/* Nav links (desktop) */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 rounded-md ${
                  isActive
                    ? 'text-[var(--accent-text)]'
                    : 'text-[var(--text-3)] hover:text-[var(--text-1)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-purple-500"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) =>
              `relative px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors rounded-md ${
                isActive ? 'text-red-400' : 'text-[var(--text-3)] hover:text-red-400'
              }`
            }>
              {t.nav.admin}
            </NavLink>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1 ml-auto shrink-0">

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Светлая тема' : 'Тёмная тема'}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--hover)] transition-all cursor-pointer"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={isDark ? 'sun' : 'moon'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </motion.div>
            </AnimatePresence>
          </button>

          {/* Language */}
          <button
            onClick={toggleLang}
            className="h-8 px-2 rounded-lg flex items-center gap-1 text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--hover)] transition-all cursor-pointer"
          >
            <Globe size={13} />
            <span className="text-xs font-bold">{lang.toUpperCase()}</span>
          </button>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--hover)] transition-all"
          >
            <Bell size={15} />
            <AnimatePresence>
              {unread > 0 && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center leading-none"
                >
                  {unread > 9 ? '9+' : unread}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <div className="w-px h-5 bg-[var(--border)] mx-0.5" />

          {/* Avatar + dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserOpen(!userOpen)}
              className="flex items-center gap-1.5 h-8 px-2 rounded-lg hover:bg-[var(--hover)] transition-all cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0 ring-1 ring-purple-500/40 group-hover:ring-purple-400/60 transition-all">
                {user?.username?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-sm font-medium text-[var(--text-2)] hidden sm:block max-w-[100px] truncate group-hover:text-[var(--text-1)] transition-colors">
                {user?.username}
              </span>
              <ChevronDown size={11} className={`text-[var(--text-3)] hidden sm:block transition-transform duration-200 ${userOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {userOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-11 z-20 w-56 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden"
                    style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)' }}
                  >
                    <div className="px-4 py-3 border-b border-[var(--border)] bg-gradient-to-br from-purple-500/5 to-transparent">
                      <p className="text-sm font-semibold text-[var(--text-1)] truncate">{user?.username}</p>
                      <p className="text-xs text-[var(--text-3)] truncate mt-0.5">{user?.email}</p>
                    </div>
                    <div className="py-1.5 px-1.5">
                      {[
                        { to: '/profile',  icon: User,        label: t.nav.profile  },
                        { to: '/settings', icon: Settings,    label: t.nav.settings },
                      ].map(({ to, icon: Icon, label }) => (
                        <Link key={to} to={to} onClick={() => setUserOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--hover)] transition-colors">
                          <Icon size={14} className="text-[var(--text-3)]" /> {label}
                        </Link>
                      ))}
                      {user?.role === 'admin' && (
                        <Link to="/admin" onClick={() => setUserOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                          <ShieldCheck size={14} /> {t.nav.admin}
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-[var(--border)] py-1.5 px-1.5">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                        <LogOut size={14} /> {t.nav.logout}
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Burger (mobile) */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-2)] hover:bg-[var(--hover)] transition-all cursor-pointer ml-1"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={mobileOpen ? 'x' : 'menu'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.12 }}>
                {mobileOpen ? <X size={17} /> : <Menu size={17} />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden border-t border-[var(--border)]"
          >
            <div className="px-4 py-3 grid grid-cols-2 gap-1">
              {NAV.map(({ to, label }) => (
                <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--hover)]'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
