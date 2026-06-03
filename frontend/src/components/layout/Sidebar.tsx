import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Code2, Trophy, Swords, Users, Bot,
  BarChart2, User, Settings, LogOut, Zap, BookOpen,
  Bell, ShieldCheck, UserPlus, ChevronRight, Sun, Moon,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../../api/endpoints';

const NAV = [
  { to: '/dashboard',      Icon: LayoutDashboard, label: 'Главная',      color: '#818cf8' },
  { to: '/problems',       Icon: Code2,            label: 'Задачи',       color: '#34d399' },
  { to: '/contests',       Icon: Trophy,           label: 'Контесты',     color: '#fbbf24' },
  { to: '/duels',          Icon: Swords,           label: 'Дуэли',        color: '#f87171' },
  { to: '/friends',        Icon: UserPlus,         label: 'Друзья',       color: '#fb923c' },
  { to: '/teams',          Icon: Users,            label: 'Команды',      color: '#a78bfa' },
  { to: '/ai-mentor',      Icon: Bot,              label: 'AI Ментор',    color: '#22d3ee' },
  { to: '/leaderboard',    Icon: BarChart2,        label: 'Рейтинг',      color: '#f472b6' },
  { to: '/training',       Icon: BookOpen,         label: 'Тренировки',   color: '#86efac' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: notificationsApi.unreadCount,
    refetchInterval: 30_000,
  });
  const unreadCount = unread?.count ?? 0;

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className="flex flex-col h-screen sticky top-0 shrink-0 overflow-hidden z-40"
      style={{
        background: isDark ? '#07071a' : '#ffffff',
        borderRight: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b shrink-0"
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)' }}>
        <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 glow-pulse"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            <Zap size={14} className="text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="font-black text-[15px] tracking-tight whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg,#e0e7ff,#a78bfa)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}
              >
                Aetheris
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
        {NAV.map(({ to, Icon, label, color }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group overflow-hidden ${
                collapsed ? 'justify-center' : ''
              } ${isActive ? 'text-white' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active bg */}
                {isActive && (
                  <motion.div layoutId="sidebar-active" className="absolute inset-0 rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${color}20, ${color}10)`, border: `1px solid ${color}25` }}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                {/* Hover bg */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />

                <div className="relative shrink-0 flex items-center justify-center w-5 h-5">
                  <Icon size={16} style={{ color: isActive ? color : undefined }} />
                </div>

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="relative whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Active dot when collapsed */}
                {collapsed && isActive && (
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full"
                    style={{ background: color }} />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Admin */}
        {user?.role === 'admin' && (
          <NavLink to="/admin"
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all overflow-hidden mt-1 border-t pt-3 ${collapsed ? 'justify-center' : ''} ${
                isActive ? 'text-red-400' : 'text-slate-500 hover:text-red-400'
              }`
            }
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
          >
            <ShieldCheck size={16} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Админ
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-3 pt-2 border-t flex flex-col gap-1"
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>

        {/* Notifications */}
        <NavLink to="/notifications"
          className={({ isActive }) =>
            `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all ${collapsed ? 'justify-center' : ''} ${
              isActive ? 'text-indigo-400' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <div className="relative shrink-0">
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[7px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Уведомления
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>

        {/* Profile */}
        <NavLink to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all ${collapsed ? 'justify-center' : ''} ${
              isActive ? 'text-indigo-400' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <User size={15} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Профиль</motion.span>
            )}
          </AnimatePresence>
        </NavLink>

        <NavLink to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all ${collapsed ? 'justify-center' : ''} ${
              isActive ? 'text-indigo-400' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <Settings size={14} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Настройки</motion.span>
            )}
          </AnimatePresence>
        </NavLink>

        {/* User row */}
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-3 py-2 mt-1 rounded-xl"
            style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold truncate" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>{user.username}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={toggleTheme}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer">
                {isDark ? <Sun size={11} /> : <Moon size={11} />}
              </button>
              <button onClick={async () => { await logout(); navigate('/'); }}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors cursor-pointer">
                <LogOut size={11} />
              </button>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] transition-all cursor-pointer mt-0.5 ${collapsed ? 'justify-center' : ''}`}
          style={{ color: 'var(--t3)' }}
        >
          <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.25 }}>
            <ChevronRight size={14} />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[11px]">
                Свернуть
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
