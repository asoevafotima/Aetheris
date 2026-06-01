import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Code2, Trophy, Swords, Users, Bot, BarChart2,
  User, Settings, LogOut, Zap, BookOpen, Bell, ChevronLeft, ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

const NAV = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Главная'         },
  { to: '/problems',       icon: Code2,            label: 'Задачи'          },
  { to: '/contests',       icon: Trophy,           label: 'Контесты'        },
  { to: '/duels',          icon: Swords,           label: 'Дуэли'           },
  { to: '/teams',          icon: Users,            label: 'Команды'         },
  { to: '/ai-mentor',      icon: Bot,              label: 'AI Наставник'    },
  { to: '/visualizations', icon: BarChart2,        label: 'Визуализации'    },
  { to: '/leaderboard',    icon: Zap,              label: 'Рейтинг'         },
  { to: '/training',       icon: BookOpen,         label: 'Тренировки'      },
];

const BOTTOM = [
  { to: '/notifications', icon: Bell,     label: 'Уведомления' },
  { to: '/profile',       icon: User,     label: 'Профиль'     },
  { to: '/settings',      icon: Settings, label: 'Настройки'   },
];

const ROLE_LABELS: Record<string, string> = {
  admin:     'Администратор',
  moderator: 'Модератор',
  user:      'Участник',
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';
  const isMod   = user?.role === 'admin' || user?.role === 'moderator';

  return (
    <aside
      className={`
        flex flex-col h-screen sticky top-0
        bg-white border-r border-slate-200 shadow-sm
        transition-all duration-300 z-50 shrink-0
        ${collapsed ? 'w-16' : 'w-56'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-100 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-purple-200">
          <Zap size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-base gradient-text">Aetheris</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto flex flex-col gap-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-150 group
              ${collapsed ? 'justify-center' : ''}
              ${isActive
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }
            `}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {/* Admin / Moderator section */}
        {isMod && (
          <div className={`mt-2 pt-2 border-t border-slate-100 flex flex-col gap-0.5`}>
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150
                  ${collapsed ? 'justify-center' : ''}
                  ${isActive
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'text-slate-600 hover:text-red-700 hover:bg-red-50 border border-transparent'
                  }
                `}
                title={collapsed ? 'Панель администратора' : undefined}
              >
                <ShieldCheck size={18} className="shrink-0" />
                {!collapsed && <span>Администратор</span>}
              </NavLink>
            )}
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-2 border-t border-slate-100 pt-2 flex flex-col gap-0.5">
        {BOTTOM.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
              transition-all duration-150
              ${collapsed ? 'justify-center' : ''}
              ${isActive
                ? 'bg-purple-50 text-purple-700'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }
            `}
            title={collapsed ? label : undefined}
          >
            <Icon size={16} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {/* User row */}
        {!collapsed && user && (
          <div className="flex items-center gap-2 px-3 py-2 mt-1 rounded-lg bg-slate-50 border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{user.username}</p>
              <p className="text-[10px] text-slate-400">{ROLE_LABELS[user.role] ?? user.role}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer" title="Выйти">
              <LogOut size={14} />
            </button>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 text-sm transition-all cursor-pointer ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="text-xs">Свернуть</span>}
        </button>
      </div>
    </aside>
  );
}
