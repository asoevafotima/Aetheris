import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Code2, Trophy, Swords, Users, Bot,
  BarChart2, User, Settings, LogOut, Zap, BookOpen,
  Bell, ShieldCheck, UserPlus, ChevronLeft, Sun, Moon,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../../api/endpoints';

const NAV_ITEMS = [
  { to: '/dashboard',      Icon: LayoutDashboard, label: 'Главная'      },
  { to: '/problems',       Icon: Code2,            label: 'Задачи'       },
  { to: '/contests',       Icon: Trophy,           label: 'Контесты'     },
  { to: '/duels',          Icon: Swords,           label: 'Дуэли'        },
  { to: '/friends',        Icon: UserPlus,         label: 'Друзья'       },
  { to: '/teams',          Icon: Users,            label: 'Команды'      },
  { to: '/ai-mentor',      Icon: Bot,              label: 'AI Ментор'    },
  { to: '/leaderboard',    Icon: BarChart2,        label: 'Рейтинг'      },
  { to: '/training',       Icon: BookOpen,         label: 'Тренировки'   },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: notificationsApi.unreadCount,
    refetchInterval: 30_000,
  });
  const unread = unreadData?.count ?? 0;

  const w = collapsed ? 60 : 220;

  return (
    <motion.aside
      animate={{ width: w }}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      className="flex flex-col h-screen sticky top-0 shrink-0 overflow-hidden z-50"
      style={{
        background: isDark ? 'rgba(3,3,5,0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: `1px solid var(--border)`,
      }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center h-[54px] px-3.5 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 glow-pulse"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>
            <Zap size={14} className="text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="font-black text-[15px] tracking-tight whitespace-nowrap gradient-text"
              >
                Aetheris
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ to, Icon, label }) => (
          <NavLink key={to} to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 overflow-hidden ${
                collapsed ? 'justify-center' : ''
              } ${isActive
                ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="nav-active-bg"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.18)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                {/* Left accent */}
                {isActive && !collapsed && (
                  <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-[var(--accent)]" />
                )}
                <Icon size={16} className="relative shrink-0" />
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
              </>
            )}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <NavLink to="/admin" title={collapsed ? 'Админ' : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all mt-1 ${collapsed ? 'justify-center' : ''} ${
                isActive ? 'text-red-400 bg-red-500/10' : 'text-[var(--text-3)] hover:text-red-400 hover:bg-red-500/5'
              }`
            }
          >
            <ShieldCheck size={16} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Админ</motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        )}
      </nav>

      {/* ── Bottom ── */}
      <div className="px-2 pb-3 pt-2 border-t flex flex-col gap-0.5" style={{ borderColor: 'var(--border)' }}>

        <NavLink to="/notifications" title={collapsed ? 'Уведомления' : undefined}
          className={({ isActive }) =>
            `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all ${collapsed ? 'justify-center' : ''} ${
              isActive ? 'text-[var(--accent)]' : 'text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-white/5'
            }`
          }
        >
          <div className="relative shrink-0">
            <Bell size={15} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[7px] font-bold flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </div>
          <AnimatePresence>
            {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Уведомления</motion.span>}
          </AnimatePresence>
        </NavLink>

        <NavLink to="/profile" title={collapsed ? 'Профиль' : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all ${collapsed ? 'justify-center' : ''} ${
              isActive ? 'text-[var(--accent)]' : 'text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-white/5'
            }`
          }
        >
          <User size={15} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Профиль</motion.span>}
          </AnimatePresence>
        </NavLink>

        <NavLink to="/settings" title={collapsed ? 'Настройки' : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all ${collapsed ? 'justify-center' : ''} ${
              isActive ? 'text-[var(--accent)]' : 'text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-white/5'
            }`
          }
        >
          <Settings size={14} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Настройки</motion.span>}
          </AnimatePresence>
        </NavLink>

        {/* User row */}
        <AnimatePresence>
          {!collapsed && user && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-xl"
              style={{ background: 'var(--border)' }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}>
                {user.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--text-1)' }}>{user.username}</p>
                <p className="text-[10px] capitalize" style={{ color: 'var(--text-3)' }}>{user.role}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={toggleTheme} title="Сменить тему"
                  className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:bg-white/10"
                  style={{ color: 'var(--text-3)' }}>
                  {isDark ? <Sun size={11} /> : <Moon size={11} />}
                </button>
                <button onClick={async () => { await logout(); navigate('/'); }} title="Выйти"
                  className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:text-red-400"
                  style={{ color: 'var(--text-3)' }}>
                  <LogOut size={11} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Theme + logout when collapsed */}
        {collapsed && (
          <div className="flex flex-col gap-0.5">
            <button onClick={toggleTheme}
              className="w-full h-8 flex items-center justify-center rounded-xl transition-colors cursor-pointer hover:bg-white/5"
              style={{ color: 'var(--text-3)' }}>
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button onClick={async () => { await logout(); navigate('/'); }}
              className="w-full h-8 flex items-center justify-center rounded-xl transition-colors cursor-pointer hover:text-red-400"
              style={{ color: 'var(--text-3)' }}>
              <LogOut size={14} />
            </button>
          </div>
        )}

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full h-8 mt-0.5 rounded-xl transition-all cursor-pointer hover:bg-white/5"
          style={{ color: 'var(--text-3)' }}>
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronLeft size={14} />
          </motion.div>
        </button>
      </div>
    </motion.aside>
  );
}
