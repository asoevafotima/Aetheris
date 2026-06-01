import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Users, Search, ChevronDown, Check, UserCog,
} from 'lucide-react';
import { usersApi } from '../api/endpoints';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { SkeletonLine } from '../components/ui/Spinner';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import api from '../api/client';
import type { User } from '../types';

const ROLES = [
  { value: 'user',      label: 'Участник',        color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { value: 'moderator', label: 'Модератор',       color: 'bg-cyan-100 text-cyan-700 border-cyan-200'   },
  { value: 'admin',     label: 'Администратор',   color: 'bg-red-100 text-red-700 border-red-200'      },
];

function RoleDropdown({ user, onChangeRole }: { user: User; onChangeRole: (id: string, role: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = ROLES.find(r => r.value === user.role) ?? ROLES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${current.color}`}
      >
        {current.label}
        <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            {ROLES.map(r => (
              <button
                key={r.value}
                onClick={() => { onChangeRole(user.id, r.value); setOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className={`px-2 py-0.5 rounded-md border text-xs font-medium ${r.color}`}>{r.label}</span>
                {user.role === r.value && <Check size={14} className="text-purple-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatBox({ value, label, icon: Icon, color }: { value: number; label: string; icon: React.ElementType; color: string }) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-slate-500 text-sm">{label}</p>
      </div>
    </div>
  );
}

export function AdminPanel() {
  const { user: me } = useAuthStore();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  if (me?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => usersApi.list(0, 200),
  });

  const changeRoleMut = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.patch(`/users/${id}/role`, { role }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users', 'all'] }),
  });

  // Прямое изменение роли через SQL (через специальный эндпоинт или patch)
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/users/${userId}`, { role: newRole });
      qc.invalidateQueries({ queryKey: ['users', 'all'] });
    } catch {
      // Fallback — прямой запрос
      changeRoleMut.mutate({ id: userId, role: newRole });
    }
  };

  const allUsers = (users ?? []) as User[];
  const filtered = allUsers.filter(u => {
    const matchSearch = u.username.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const admins = allUsers.filter(u => u.role === 'admin').length;
  const mods   = allUsers.filter(u => u.role === 'moderator').length;
  const regular= allUsers.filter(u => u.role === 'user').length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center">
            <ShieldCheck size={20} className="text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Панель администратора</h1>
            <p className="text-slate-500 text-sm">Управление пользователями и ролями</p>
          </div>
        </div>
      </motion.div>

      {/* Как создавать роли */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="mb-6 p-5 rounded-xl border border-blue-200 bg-blue-50"
      >
        <h2 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <UserCog size={16} /> Как назначить роль?
        </h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <span className="px-2 py-0.5 rounded border border-red-300 bg-red-100 text-red-700 text-xs font-medium shrink-0 mt-0.5">Администратор</span>
            <p>Полный доступ: создание/удаление задач, контестов, управление всеми пользователями.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="px-2 py-0.5 rounded border border-cyan-300 bg-cyan-100 text-cyan-700 text-xs font-medium shrink-0 mt-0.5">Модератор</span>
            <p>Создание задач и контестов, проверка решений. Не может удалять пользователей.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="px-2 py-0.5 rounded border border-slate-300 bg-slate-100 text-slate-700 text-xs font-medium shrink-0 mt-0.5">Участник</span>
            <p>Обычный конкурсант. Решает задачи, участвует в контестах и дуэлях.</p>
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-3">
          💡 Нажмите на кнопку роли справа от пользователя, чтобы изменить её.
        </p>
      </motion.div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatBox value={allUsers.length} label="Всего пользователей" icon={Users}     color="bg-purple-100 text-purple-600" />
        <StatBox value={admins}          label="Администраторов"     icon={ShieldCheck}color="bg-red-100 text-red-600"      />
        <StatBox value={mods}            label="Модераторов"         icon={UserCog}    color="bg-cyan-100 text-cyan-600"    />
        <StatBox value={regular}         label="Участников"          icon={Users}      color="bg-emerald-100 text-emerald-600" />
      </div>

      {/* Фильтры */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Поиск по логину или email..."
            icon={<Search size={16} />}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
          {[
            { v: '',          l: 'Все'            },
            { v: 'admin',     l: 'Администраторы' },
            { v: 'moderator', l: 'Модераторы'     },
            { v: 'user',      l: 'Участники'      },
          ].map(t => (
            <button
              key={t.v}
              onClick={() => setRoleFilter(t.v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                roleFilter === t.v
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* Таблица */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Пользователь</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Дата регистрации</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Статус</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Роль</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array(8).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td colSpan={5} className="px-5 py-4"><SkeletonLine className="w-full" /></td>
                    </tr>
                  ))
                : filtered.map((u: User, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className={`border-b border-slate-100 hover:bg-slate-50/70 transition-colors ${u.id === me?.id ? 'bg-purple-50/40' : ''}`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${
                            u.role === 'admin' ? 'bg-red-500' : u.role === 'moderator' ? 'bg-cyan-600' : 'bg-purple-600'
                          }`}>
                            {u.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {u.username}
                              {u.id === me?.id && <span className="ml-1.5 text-xs text-purple-500">(вы)</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{u.email}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">
                        {format(new Date(u.created_at), 'd MMM yyyy', { locale: ru })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                          u.is_active
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {u.is_active ? 'Активен' : 'Отключён'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {u.id !== me?.id ? (
                          <RoleDropdown user={u} onChangeRole={handleRoleChange} />
                        ) : (
                          <span className="text-xs text-slate-400 italic">нельзя изменить себя</span>
                        )}
                      </td>
                    </motion.tr>
                  ))
              }
            </tbody>
          </table>
          {!isLoading && filtered.length === 0 && (
            <div className="py-16 text-center text-slate-400">
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              <p>Пользователи не найдены</p>
            </div>
          )}
        </div>
      </Card>

      <p className="text-xs text-slate-400 mt-4 text-center">
        Всего пользователей: {filtered.length} из {allUsers.length}
      </p>
    </div>
  );
}
