import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sun, Moon, User, Settings, LogOut, Bell, ChevronDown, Menu, X, ShieldCheck } from 'lucide-react';
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
  const [mob, setMob]   = useState(false);
  const [drop, setDrop] = useState(false);
  const isDark = theme === 'dark';

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn:  notificationsApi.unreadCount,
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

  return (
    <header className="nav-theme sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-5 h-[54px] flex items-center gap-3">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0 mr-1 group">
          <div className="relative w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden glow-pulse"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)' }} />
            <Zap size={14} className="text-white relative z-10" />
          </div>
          <span className="font-black text-[15px] tracking-[-0.03em] hidden sm:block"
            style={{ background: 'linear-gradient(135deg,#e0e7ff,#c7d2fe,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
            Aetheris
          </span>
        </Link>

        <div className="w-px h-4 shrink-0" style={{ background: 'var(--b0)' }} />

        {/* Nav links */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto">
          {NAV.map(({ to, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `relative px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 rounded-xl ${
                  isActive ? 'text-[var(--ac)]' : 'text-[var(--t3)] hover:text-[var(--t1)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl -z-10"
                      style={{ background: 'rgba(129,140,248,0.1)' }}
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin"
              className={({ isActive }) =>
                `px-3 py-1.5 text-[13px] font-medium whitespace-nowrap rounded-xl transition-colors ${
                  isActive ? 'text-red-400' : 'text-[var(--t3)] hover:text-red-400'
                }`
              }>
              {t.nav.admin}
            </NavLink>
          )}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-0.5 ml-auto shrink-0">

          {/* Theme */}
          <button onClick={toggleTheme}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--t3)] hover:text-[var(--t1)] hover:bg-[var(--hv)] transition-all cursor-pointer">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={isDark ? 's' : 'm'}
                initial={{ rotate: -60, scale: 0.7, opacity: 0 }}
                animate={{ rotate: 0,   scale: 1,   opacity: 1 }}
                exit={{    rotate:  60, scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.18 }}>
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
              </motion.div>
            </AnimatePresence>
          </button>

          {/* Language */}
          <button onClick={toggleLang}
            className="h-8 px-2 rounded-xl text-[11px] font-bold text-[var(--t3)] hover:text-[var(--t1)] hover:bg-[var(--hv)] transition-all cursor-pointer tracking-wider">
            {lang.toUpperCase()}
          </button>

          {/* Notifications */}
          <Link to="/notifications"
            className="relative w-8 h-8 rounded-xl flex items-center justify-center text-[var(--t3)] hover:text-[var(--t1)] hover:bg-[var(--hv)] transition-all">
            <Bell size={14} />
            <AnimatePresence>
              {unread > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[7px] font-bold flex items-center justify-center leading-none">
                  {unread > 9 ? '9+' : unread}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <div className="w-px h-4 mx-1" style={{ background: 'var(--b0)' }} />

          {/* Avatar */}
          <div className="relative">
            <button onClick={() => setDrop(!drop)}
              className="flex items-center gap-2 h-8 px-2 rounded-xl hover:bg-[var(--hv)] transition-all cursor-pointer group">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ring-2 ring-transparent group-hover:ring-indigo-500/30 transition-all"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                {user?.username?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-[13px] font-medium text-[var(--t2)] hidden sm:block max-w-[90px] truncate group-hover:text-[var(--t1)] transition-colors">{user?.username}</span>
              <motion.div animate={{ rotate: drop ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={11} className="text-[var(--t3)] hidden sm:block" />
              </motion.div>
            </button>

            <AnimatePresence>
              {drop && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDrop(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{   opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: [0.16,1,0.3,1] }}
                    className="absolute right-0 top-11 z-20 w-56 rounded-2xl overflow-hidden"
                    style={{
                      background: isDark ? 'rgba(8,8,26,0.95)' : 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(24px)',
                      border: '1px solid var(--b0)',
                      boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}
                  >
                    <div className="px-4 py-3.5 border-b"
                      style={{ borderColor: 'var(--b0)', background: 'rgba(129,140,248,0.04)' }}>
                      <p className="text-sm font-semibold text-[var(--t1)] truncate">{user?.username}</p>
                      <p className="text-xs text-[var(--t3)] truncate mt-0.5">{user?.email}</p>
                    </div>
                    <div className="p-1.5">
                      {[
                        { to: '/profile',  Icon: User,     label: t.nav.profile  },
                        { to: '/settings', Icon: Settings, label: t.nav.settings },
                      ].map(({ to, Icon, label }) => (
                        <Link key={to} to={to} onClick={() => setDrop(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-[var(--t2)] hover:text-[var(--t1)] hover:bg-[var(--hv)] transition-colors">
                          <Icon size={13} className="text-[var(--t3)]" /> {label}
                        </Link>
                      ))}
                      {user?.role === 'admin' && (
                        <Link to="/admin" onClick={() => setDrop(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-red-400 hover:bg-red-500/8 transition-colors">
                          <ShieldCheck size={13} /> {t.nav.admin}
                        </Link>
                      )}
                    </div>
                    <div className="p-1.5 border-t" style={{ borderColor: 'var(--b0)' }}>
                      <button onClick={async () => { await logout(); navigate('/'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-red-400 hover:bg-red-500/8 transition-colors cursor-pointer">
                        <LogOut size={13} /> {t.nav.logout}
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Burger */}
          <button onClick={() => setMob(!mob)}
            className="lg:hidden w-8 h-8 rounded-xl flex items-center justify-center text-[var(--t2)] hover:bg-[var(--hv)] transition-all cursor-pointer ml-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={mob ? 'x' : 'm'}
                initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.12 }}>
                {mob ? <X size={16} /> : <Menu size={16} />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile */}
      <AnimatePresence>
        {mob && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden border-t"
            style={{ borderColor: 'var(--b0)' }}
          >
            <div className="p-3 grid grid-cols-2 gap-1">
              {NAV.map(({ to, label }) => (
                <NavLink key={to} to={to} onClick={() => setMob(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                      isActive ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-[var(--t2)] hover:text-[var(--t1)] hover:bg-[var(--hv)]'
                    }`
                  }>
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
