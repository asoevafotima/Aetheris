import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Zap, Crown, Search, TrendingUp, User } from 'lucide-react';
import { usersApi } from '../api/endpoints';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { SkeletonLine } from '../components/ui/Spinner';
import { useAuthStore }  from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useT }          from '../i18n';
import type { User as UserType } from '../types';

const ROLE_LABELS: Record<string, Record<string, string>> = {
  admin:     { ru: 'Админ',     en: 'Admin'     },
  moderator: { ru: 'Модератор', en: 'Moderator' },
  user:      { ru: 'Участник',  en: 'User'      },
};

export function Leaderboard() {
  const [search, setSearch] = useState('');
  const { user: me }  = useAuthStore();
  const { lang }      = useThemeStore();
  const t             = useT();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', 'list'],
    queryFn:  () => usersApi.list(0, 100),
  });

  const filtered = (users ?? []).filter((u: UserType) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const getRankIcon = (i: number) => {
    if (i === 0) return <Crown size={18} className="text-yellow-500" />;
    if (i === 1) return <Crown size={18} className="text-slate-400" />;
    if (i === 2) return <Crown size={18} className="text-amber-600" />;
    return <span className="text-app-3 font-mono text-sm w-6 inline-block text-center">{i + 1}</span>;
  };

  const getRatingColor = (i: number) => {
    if (i === 0) return 'text-yellow-600 dark:text-yellow-400 font-bold';
    if (i < 3)   return 'text-purple-600 dark:text-purple-400 font-bold';
    if (i < 10)  return 'text-cyan-600 dark:text-cyan-400 font-semibold';
    return 'text-app-1';
  };

  const fakeRating = (i: number) => Math.max(0, 2800 - i * 35);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-app-1 mb-1 flex items-center gap-3">
          <Zap size={28} className="text-yellow-500" /> {t.leaderboard.title}
        </h1>
        <p className="text-app-2">{t.leaderboard.subtitle}</p>
      </motion.div>

      {/* Подиум */}
      {!isLoading && filtered.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {/* 2-е */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-[var(--surface-2)] border-2 border-[var(--border-2)] flex items-center justify-center text-xl font-black text-app-2">
              {filtered[1]?.username[0].toUpperCase()}
            </div>
            <p className="text-sm font-semibold text-app-2">{filtered[1]?.username}</p>
            <div className="w-20 h-20 bg-[var(--surface-2)] border border-[var(--border)] rounded-t-xl flex items-center justify-center">
              <Crown size={24} className="text-slate-400" />
            </div>
          </motion.div>

          {/* 1-е */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 flex items-center justify-center text-xl font-black text-yellow-700 dark:text-yellow-400 glow-pulse">
              {filtered[0]?.username[0].toUpperCase()}
            </div>
            <p className="text-base font-bold gradient-text">{filtered[0]?.username}</p>
            <div className="w-24 h-28 bg-gradient-to-t from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-800/10 border border-yellow-300 dark:border-yellow-700/40 rounded-t-xl flex items-center justify-center">
              <Crown size={28} className="text-yellow-500" />
            </div>
          </motion.div>

          {/* 3-е */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/20 border-2 border-amber-400 flex items-center justify-center text-xl font-black text-amber-700 dark:text-amber-400">
              {filtered[2]?.username[0].toUpperCase()}
            </div>
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">{filtered[2]?.username}</p>
            <div className="w-20 h-14 bg-amber-50 dark:bg-amber-900/10 border border-amber-300 dark:border-amber-700/30 rounded-t-xl flex items-center justify-center">
              <Crown size={20} className="text-amber-500" />
            </div>
          </motion.div>
        </div>
      )}

      <div className="mb-4">
        <Input placeholder={t.common.search + '…'} icon={<Search size={16} />} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-app-3 uppercase tracking-wider w-16">#</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-app-3 uppercase tracking-wider">{t.settings.profile}</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-app-3 uppercase tracking-wider">{t.dashboard.rating}</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-app-3 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array(10).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-[var(--border)]"><td colSpan={4} className="px-5 py-4"><SkeletonLine /></td></tr>
                  ))
                : filtered.map((u: UserType, i: number) => (
                    <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className={`border-b border-[var(--border)] hover:bg-[var(--hover)] transition-colors ${u.id === me?.id ? 'bg-[var(--accent-light)]' : ''}`}>
                      <td className="px-5 py-4"><div className="flex items-center">{getRankIcon(i)}</div></td>
                      <td className="px-5 py-4">
                        <Link to={`/profile/${u.id}`} className="flex items-center gap-3 group">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${
                            u.role === 'admin' ? 'bg-red-500' : u.role === 'moderator' ? 'bg-cyan-600' : 'bg-purple-600'
                          }`}>{u.username[0].toUpperCase()}</div>
                          <div>
                            <p className="text-sm font-semibold text-app-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {u.username}
                              {u.id === me?.id && <span className="ml-2 text-xs text-purple-500">{lang === 'ru' ? '(вы)' : '(you)'}</span>}
                            </p>
                            <p className="text-xs text-app-3">{new Date(u.created_at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`font-mono text-sm flex items-center justify-end gap-1 ${getRatingColor(i)}`}>
                          <TrendingUp size={12} /> {fakeRating(i).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${
                          u.role === 'admin' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' :
                          u.role === 'moderator' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800' :
                          'bg-[var(--surface-2)] text-app-3 border-[var(--border)]'
                        }`}>
                          {ROLE_LABELS[u.role]?.[lang] ?? u.role}
                        </span>
                      </td>
                    </motion.tr>
                  ))
              }
            </tbody>
          </table>
          {!isLoading && filtered.length === 0 && (
            <div className="py-16 text-center text-app-3">
              <User size={40} className="mx-auto mb-3 opacity-20" /><p>{t.leaderboard.not_found}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
