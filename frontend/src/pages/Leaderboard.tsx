import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Zap, Crown, Search, TrendingUp, User } from 'lucide-react';
import { usersApi } from '../api/endpoints';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { SkeletonLine } from '../components/ui/Spinner';
import { useAuthStore } from '../store/authStore';
import type { User as UserType } from '../types';

const ROLE_LABELS: Record<string, string> = { admin: 'Админ', moderator: 'Модератор', user: 'Участник' };

export function Leaderboard() {
  const [search, setSearch] = useState('');
  const { user: me } = useAuthStore();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', 'list'],
    queryFn: () => usersApi.list(0, 100),
  });

  const filtered = (users ?? []).filter((u: UserType) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const getRankIcon = (i: number) => {
    if (i === 0) return <Crown size={18} className="text-yellow-500" />;
    if (i === 1) return <Crown size={18} className="text-slate-400" />;
    if (i === 2) return <Crown size={18} className="text-amber-600" />;
    return <span className="text-slate-400 font-mono text-sm w-6 text-center">{i + 1}</span>;
  };

  const getRatingColor = (i: number) => {
    if (i === 0) return 'text-yellow-600 font-bold';
    if (i < 3)   return 'text-purple-600 font-bold';
    if (i < 10)  return 'text-cyan-600 font-semibold';
    return 'text-slate-700';
  };

  const fakeRating = (i: number) => Math.max(0, 2800 - i * 35);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-1 flex items-center gap-3">
          <Zap size={28} className="text-yellow-500" /> Рейтинг участников
        </h1>
        <p className="text-slate-500">Лучшие программисты платформы Aetheris</p>
      </motion.div>

      {/* Подиум топ-3 */}
      {!isLoading && filtered.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {/* 2-е место */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-xl font-black text-slate-600">
              {filtered[1]?.username[0].toUpperCase()}
            </div>
            <p className="text-sm font-semibold text-slate-700">{filtered[1]?.username}</p>
            <div className="w-20 h-20 bg-slate-200 rounded-t-xl flex items-center justify-center">
              <Crown size={24} className="text-slate-400" />
            </div>
          </motion.div>

          {/* 1-е место */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-2">
            <div className="w-18 h-18 rounded-full bg-yellow-100 border-3 border-yellow-400 flex items-center justify-center text-2xl font-black text-yellow-700 w-16 h-16 shadow-lg shadow-yellow-200">
              {filtered[0]?.username[0].toUpperCase()}
            </div>
            <p className="text-base font-bold gradient-text">{filtered[0]?.username}</p>
            <div className="w-24 h-28 bg-gradient-to-t from-yellow-100 to-yellow-50 border border-yellow-300 rounded-t-xl flex items-center justify-center shadow-sm">
              <Crown size={28} className="text-yellow-500" />
            </div>
          </motion.div>

          {/* 3-е место */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-xl font-black text-amber-700">
              {filtered[2]?.username[0].toUpperCase()}
            </div>
            <p className="text-sm font-semibold text-amber-600">{filtered[2]?.username}</p>
            <div className="w-20 h-14 bg-amber-50 border border-amber-300 rounded-t-xl flex items-center justify-center">
              <Crown size={20} className="text-amber-500" />
            </div>
          </motion.div>
        </div>
      )}

      <div className="mb-4">
        <Input placeholder="Поиск участников…" icon={<Search size={16} />} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Место</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Участник</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Рейтинг</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Роль</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array(10).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100"><td colSpan={4} className="px-5 py-4"><SkeletonLine /></td></tr>
                  ))
                : filtered.map((u: UserType, i: number) => (
                    <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${u.id === me?.id ? 'bg-purple-50/50' : ''}`}
                    >
                      <td className="px-5 py-4"><div className="flex items-center">{getRankIcon(i)}</div></td>
                      <td className="px-5 py-4">
                        <Link to={`/profile/${u.id}`} className="flex items-center gap-3 group">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${
                            u.role === 'admin' ? 'bg-red-500' : u.role === 'moderator' ? 'bg-cyan-600' : 'bg-purple-600'
                          }`}>
                            {u.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 group-hover:text-purple-700 transition-colors">
                              {u.username}
                              {u.id === me?.id && <span className="ml-2 text-xs text-purple-500">(вы)</span>}
                            </p>
                            <p className="text-xs text-slate-400">Зарегистрирован {new Date(u.created_at).toLocaleDateString('ru-RU')}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`font-mono text-sm flex items-center justify-end gap-1 ${getRatingColor(i)}`}>
                          <TrendingUp size={12} /> {fakeRating(i).toLocaleString('ru-RU')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`text-xs capitalize px-2 py-1 rounded-md border font-medium ${
                          u.role === 'admin' ? 'bg-red-100 text-red-700 border-red-200' :
                          u.role === 'moderator' ? 'bg-cyan-100 text-cyan-700 border-cyan-200' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                      </td>
                    </motion.tr>
                  ))
              }
            </tbody>
          </table>
          {!isLoading && filtered.length === 0 && (
            <div className="py-16 text-center text-slate-400">
              <User size={40} className="mx-auto mb-3 opacity-20" /><p>Участники не найдены</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
