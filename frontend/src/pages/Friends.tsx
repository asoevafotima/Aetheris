import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Search, UserPlus, UserMinus, Swords } from 'lucide-react';
import { usersApi, followsApi, duelsApi } from '../api/endpoints';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { SkeletonLine } from '../components/ui/Spinner';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

export function Friends() {
  const { user: me } = useAuthStore();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [duelDiff, setDuelDiff] = useState<Record<string, string>>({});
  const [inviteSent, setInviteSent] = useState<Record<string, boolean>>({});

  const { data: following, isLoading } = useQuery({
    queryKey: ['following'],
    queryFn: followsApi.following,
    enabled: !!me,
  });

  const { data: searchResults } = useQuery({
    queryKey: ['users-search', search],
    queryFn: () => usersApi.search(search),
    enabled: search.length >= 2,
  });

  const unfollowMut = useMutation({
    mutationFn: (id: string) => followsApi.unfollow(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['following'] }),
  });

  const followMut = useMutation({
    mutationFn: (id: string) => followsApi.follow(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['following'] }); setSearch(''); },
  });

  const challengeMut = useMutation({
    mutationFn: async ({ userId, diff }: { userId: string; diff: string }) => {
      const duel = await duelsApi.create({ difficulty: diff });
      await duelsApi.invite({ duel_id: duel.id, to_user_id: userId });
      return duel;
    },
    onSuccess: (_, { userId }) => {
      setInviteSent(prev => ({ ...prev, [userId]: true }));
    },
  });

  const friends = (following ?? []) as { following_id: string; following?: User }[];
  const followingIds = new Set(friends.map(f => f.following_id));

  const DIFFS = [
    { value: 'easy',   label: 'Лёгкая',  color: 'text-emerald-400' },
    { value: 'medium', label: 'Средняя', color: 'text-yellow-400' },
    { value: 'hard',   label: 'Сложная', color: 'text-orange-400' },
    { value: 'expert', label: 'Эксперт', color: 'text-red-400' },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-1)] flex items-center gap-3 mb-1">
          <Users size={24} className="text-purple-400" /> Друзья
        </h1>
        <p className="text-[var(--text-3)] text-sm">Следи за друзьями и вызывай на дуэль</p>
      </motion.div>

      {/* Поиск */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 mb-5">
        <p className="text-sm font-semibold text-[var(--text-2)] mb-3">Найти пользователя</p>
        <Input
          placeholder="Введи никнейм..."
          icon={<Search size={15} />}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search.length >= 2 && searchResults && (
          <div className="mt-3 flex flex-col gap-1">
            {(searchResults as User[]).filter(u => u.id !== me?.id).map(u => {
              const already = followingIds.has(u.id);
              return (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--hover)] transition-colors">
                  <Link to={`/profile/${u.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {u.username[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-[var(--text-1)] truncate">{u.username}</span>
                  </Link>
                  <Button
                    size="sm"
                    variant={already ? 'outline' : 'primary'}
                    icon={already ? <UserMinus size={13} /> : <UserPlus size={13} />}
                    onClick={() => already ? unfollowMut.mutate(u.id) : followMut.mutate(u.id)}
                    loading={followMut.isPending || unfollowMut.isPending}
                  >
                    {already ? 'Удалить' : 'Добавить'}
                  </Button>
                </div>
              );
            })}
            {(searchResults as User[]).filter(u => u.id !== me?.id).length === 0 && (
              <p className="text-sm text-[var(--text-3)] text-center py-2">Никого не найдено</p>
            )}
          </div>
        )}
      </div>

      {/* Список друзей */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-1)]">
            Мои друзья
            <span className="ml-2 text-[var(--text-3)] font-normal">({friends.length})</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="p-4 flex flex-col gap-3">
            {[1,2,3].map(i => <SkeletonLine key={i} className="w-full h-14" />)}
          </div>
        ) : friends.length === 0 ? (
          <div className="py-16 text-center text-[var(--text-3)]">
            <Users size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm mb-1">Друзей пока нет</p>
            <p className="text-xs">Найди людей через поиск выше</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {friends.map(f => {
              const uid = f.following_id;
              const diff = duelDiff[uid] ?? 'easy';
              const sent = inviteSent[uid];
              return (
                <motion.div
                  key={uid}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 flex items-center gap-3"
                >
                  <Link to={`/profile/${uid}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {uid.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-1)] truncate">
                        {uid.slice(0, 8)}…
                      </p>
                      <p className="text-xs text-[var(--text-3)]">Профиль →</p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Выбор сложности дуэли */}
                    <select
                      className="input-theme text-xs rounded-lg px-2 py-1.5"
                      value={diff}
                      onChange={e => setDuelDiff(prev => ({ ...prev, [uid]: e.target.value }))}
                    >
                      {DIFFS.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>

                    {sent ? (
                      <span className="text-xs text-emerald-400 font-medium px-2">✓ Отправлено</span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Swords size={13} />}
                        onClick={() => challengeMut.mutate({ userId: uid, diff })}
                        loading={challengeMut.isPending}
                      >
                        Вызов
                      </Button>
                    )}

                    <button
                      onClick={() => unfollowMut.mutate(uid)}
                      className="w-7 h-7 rounded-lg text-[var(--text-3)] hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <UserMinus size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
