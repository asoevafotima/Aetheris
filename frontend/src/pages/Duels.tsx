import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords, Plus, Clock, Trophy, X, Check,
  Search, Send, ChevronRight, Crown, Minus,
} from 'lucide-react';
import { duelsApi, usersApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SkeletonLine } from '../components/ui/Spinner';
import { formatDistanceToNow, differenceInSeconds } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuthStore } from '../store/authStore';
import type { Duel, User } from '../types';

const DIFFICULTIES = [
  { value: 'easy',   label: 'Лёгкая',   color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', time: 15 },
  { value: 'medium', label: 'Средняя',  color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/30',  time: 25 },
  { value: 'hard',   label: 'Сложная',  color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/30',  time: 40 },
  { value: 'expert', label: 'Эксперт',  color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30',        time: 60 },
];

function DifficultyPill({ d }: { d: string }) {
  const info = DIFFICULTIES.find(x => x.value === d) ?? DIFFICULTIES[0];
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${info.bg} ${info.color}`}>
      {info.label}
    </span>
  );
}

function ResultBadge({ duel, userId }: { duel: Duel; userId?: string }) {
  if (duel.status !== 'finished' || !duel.result) return null;
  const isChallenger = duel.challenger_id === userId;
  const iWon = (isChallenger && duel.result === 'challenger_win') ||
               (!isChallenger && duel.result === 'opponent_win');
  const isDraw = duel.result === 'draw';

  if (isDraw) return (
    <span className="flex items-center gap-1 text-xs text-[var(--text-3)] bg-[var(--surface-2)] border border-[var(--border)] px-2 py-0.5 rounded-full">
      <Minus size={10} /> Ничья
    </span>
  );
  return iWon ? (
    <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded-full">
      <Crown size={10} /> Победа
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full">
      <X size={10} /> Поражение
    </span>
  );
}

function DuelTimer({ startedAt, limitMin }: { startedAt: string; limitMin: number }) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    const calc = () => {
      const elapsed = differenceInSeconds(new Date(), new Date(startedAt + 'Z'));
      setLeft(Math.max(0, limitMin * 60 - elapsed));
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [startedAt, limitMin]);

  const m = Math.floor(left / 60);
  const s = left % 60;
  const urgent = left < 120;
  return (
    <span className={`font-mono text-sm font-bold tabular-nums ${urgent ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  );
}

function DuelCard({ duel }: { duel: Duel }) {
  const { user } = useAuthStore();
  const isChallenger = duel.challenger_id === user?.id;
  const opponentName = isChallenger ? duel.opponent_username : duel.challenger_username;
  const myName = isChallenger ? duel.challenger_username : duel.opponent_username;

  return (
    <Link to={`/duels/${duel.id}`}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-3 hover:border-purple-500/40 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Swords size={15} className="text-red-400" />
            </div>
            <DifficultyPill d={duel.difficulty} />
          </div>
          <div className="flex items-center gap-2">
            {duel.status === 'active' && duel.started_at && (
              <DuelTimer startedAt={duel.started_at} limitMin={duel.time_limit_minutes} />
            )}
            {duel.status === 'pending' && (
              <span className="text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">Ожидание</span>
            )}
            {duel.status === 'finished' && <ResultBadge duel={duel} userId={user?.id} />}
            {duel.status === 'cancelled' && (
              <span className="text-xs text-[var(--text-3)] bg-[var(--surface-2)] border border-[var(--border)] px-2 py-0.5 rounded-full">Отменена</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-purple-400">{myName ?? 'Вы'}</span>
          <Swords size={12} className="text-[var(--text-3)]" />
          <span className="font-medium text-[var(--text-2)]">{opponentName ?? '???'}</span>
        </div>

        {duel.problem_title && (
          <p className="text-xs text-[var(--text-3)] truncate">
            📝 {duel.problem_title}
          </p>
        )}

        {duel.status === 'finished' && (
          <div className="flex gap-3 text-xs text-[var(--text-3)]">
            <span>Я: {duel.challenger_score?.toFixed(0)}%</span>
            <span>Оппонент: {duel.opponent_score?.toFixed(0)}%</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-[var(--text-3)]">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatDistanceToNow(new Date(duel.created_at), { addSuffix: true, locale: ru })}
          </span>
          <ChevronRight size={14} />
        </div>
      </motion.div>
    </Link>
  );
}

// ── Приглашения ──────────────────────────────────────────────────
function InvitePanel({ duelId, onDone }: { duelId: string; onDone: () => void }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<User | null>(null);
  const qc = useQueryClient();

  const { data: results } = useQuery({
    queryKey: ['users-search', search],
    queryFn: () => usersApi.search(search),
    enabled: search.length >= 2,
  });

  const inviteMut = useMutation({
    mutationFn: () => duelsApi.invite({ duel_id: duelId, to_user_id: selected!.id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['duels'] }); onDone(); },
  });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[var(--text-2)]">Найди друга по нику:</p>
      <Input
        placeholder="Введи никнейм..."
        icon={<Search size={15} />}
        value={search}
        onChange={e => { setSearch(e.target.value); setSelected(null); }}
      />
      {results && results.length > 0 && !selected && (
        <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface-2)]">
          {(results as User[]).map(u => (
            <button
              key={u.id}
              onClick={() => setSelected(u)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--hover)] transition-colors text-left cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">
                {u.username[0].toUpperCase()}
              </div>
              <span className="text-sm text-[var(--text-1)]">{u.username}</span>
            </button>
          ))}
        </div>
      )}
      {selected && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
          <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">
            {selected.username[0].toUpperCase()}
          </div>
          <span className="text-sm font-medium text-purple-300 flex-1">{selected.username}</span>
          <button onClick={() => setSelected(null)} className="text-[var(--text-3)] hover:text-red-400 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}
      <Button
        icon={<Send size={15} />}
        onClick={() => inviteMut.mutate()}
        loading={inviteMut.isPending}
        disabled={!selected}
        className="w-full"
      >
        Отправить приглашение
      </Button>
    </div>
  );
}

// ── Модальное окно создания дуэли ─────────────────────────────────
function CreateModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [diff, setDiff] = useState('easy');
  const [createdDuel, setCreatedDuel] = useState<Duel | null>(null);

  const createMut = useMutation({
    mutationFn: () => duelsApi.create({ difficulty: diff }),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['duels'] });
      setCreatedDuel(d);
    },
  });

  const info = DIFFICULTIES.find(x => x.value === diff)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[var(--text-1)] flex items-center gap-2">
            <Swords size={18} className="text-red-400" />
            {createdDuel ? 'Пригласи соперника' : 'Создать дуэль'}
          </h2>
          <button onClick={onClose} className="text-[var(--text-3)] hover:text-[var(--text-1)] cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {!createdDuel ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[var(--text-2)]">Выбери сложность — задача подберётся автоматически:</p>
            <div className="grid grid-cols-2 gap-2">
              {DIFFICULTIES.map(d => (
                <button
                  key={d.value}
                  onClick={() => setDiff(d.value)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    diff === d.value ? d.bg + ' ' + d.color : 'border-[var(--border)] text-[var(--text-2)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  <p className="font-semibold text-sm">{d.label}</p>
                  <p className="text-xs opacity-70">{d.time} мин</p>
                </button>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-3)]">
              ⏱ Лимит времени: <span className={`font-bold ${info.color}`}>{info.time} минут</span> · Задача выбирается случайно
            </div>
            <Button
              icon={<Swords size={16} />}
              onClick={() => createMut.mutate()}
              loading={createMut.isPending}
              size="lg"
              className="w-full mt-1"
            >
              Создать дуэль
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-400">
              ✓ Дуэль создана! Задача: <strong>{createdDuel.problem_title ?? '—'}</strong>
            </div>
            <InvitePanel duelId={createdDuel.id} onDone={onClose} />
            <button
              onClick={onClose}
              className="text-xs text-[var(--text-3)] hover:text-[var(--text-1)] text-center cursor-pointer"
            >
              Пригласить позже (открыть дуэль)
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Входящие приглашения ─────────────────────────────────────────
function IncomingInvites() {
  const qc = useQueryClient();
  const { data: invites } = useQuery({
    queryKey: ['duel-invitations'],
    queryFn: duelsApi.invitations,
    refetchInterval: 15_000,
  });

  const acceptMut = useMutation({
    mutationFn: (id: string) => duelsApi.acceptInvite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['duels', 'duel-invitations'] }),
  });
  const declineMut = useMutation({
    mutationFn: (id: string) => duelsApi.declineInvite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['duel-invitations'] }),
  });

  const list = (invites ?? []) as { id: string; from_user: User; duel: Duel }[];
  if (!list.length) return null;

  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-[var(--text-2)] uppercase tracking-wide mb-3">
        Входящие приглашения ({list.length})
      </h2>
      <div className="flex flex-col gap-2">
        {list.map(inv => (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/8 border border-purple-500/30"
          >
            <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {(inv.from_user?.username ?? '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-1)]">
                {inv.from_user?.username ?? '...'} вызывает на дуэль
              </p>
              <p className="text-xs text-[var(--text-3)]">
                Сложность: {DIFFICULTIES.find(d => d.value === inv.duel?.difficulty)?.label ?? inv.duel?.difficulty}
                {' · '}{inv.duel?.time_limit_minutes} мин
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => declineMut.mutate(inv.id)}
                className="w-8 h-8 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
              <button
                onClick={() => acceptMut.mutate(inv.id)}
                className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Check size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Главная страница ─────────────────────────────────────────────
export function Duels() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<'open' | 'mine'>('open');

  const { data: activeDuels, isLoading: activeLoading } = useQuery({
    queryKey: ['duels', 'active'],
    queryFn: () => duelsApi.listActive(0, 20),
    refetchInterval: 15_000,
  });

  const { data: myDuels, isLoading: myLoading } = useQuery({
    queryKey: ['duels', 'mine'],
    queryFn: () => duelsApi.mine(0, 20),
    refetchInterval: 15_000,
  });

  const displayDuels = (tab === 'open' ? activeDuels : myDuels) as Duel[] ?? [];
  const isLoading = tab === 'open' ? activeLoading : myLoading;

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-1)] flex items-center gap-3 mb-1">
              <Swords size={26} className="text-red-400" /> Дуэли
            </h1>
            <p className="text-[var(--text-3)] text-sm">1 на 1 — кто быстрее решит задачу</p>
          </div>
          {user && (
            <Button icon={<Plus size={15} />} onClick={() => setShowCreate(true)}>
              Создать дуэль
            </Button>
          )}
        </div>
      </motion.div>

      {user && <IncomingInvites />}

      {/* Табы */}
      <div className="flex gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1 w-fit mb-5">
        {([['open', '⚔️ Открытые'], ['mine', '📋 Мои дуэли']] as const).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              tab === t ? 'bg-purple-600 text-white' : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--hover)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
              <SkeletonLine className="w-full h-32" />
            </div>
          ))}
        </div>
      ) : displayDuels.length === 0 ? (
        <div className="py-20 text-center text-[var(--text-3)]">
          <Swords size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg mb-2">{tab === 'open' ? 'Нет открытых дуэлей' : 'Ты ещё не участвовал в дуэлях'}</p>
          {user && (
            <Button icon={<Plus size={15} />} onClick={() => setShowCreate(true)} className="mt-2">
              Создать дуэль
            </Button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {displayDuels.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <DuelCard duel={d} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
