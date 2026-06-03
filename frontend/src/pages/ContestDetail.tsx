import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useBlocker } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Trophy, Code2, Send, MessageSquare, Crown,
  Snowflake, Users, CheckCircle, Circle,
  AlertCircle, Wifi, WifiOff, Lock, ArrowLeft, LogOut, Users2,
} from 'lucide-react';
import { contestsApi, chatApi, submissionsApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SkeletonLine } from '../components/ui/Spinner';
import { formatDistanceToNow, isPast, isFuture, intervalToDuration, format, differenceInMinutes } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuthStore } from '../store/authStore';
import type { ContestStanding } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const WS_BASE  = API_BASE.replace(/^http/, 'ws');

// ─── WebSocket hook ────────────────────────────────────────────
function useContestWS(url: string | null, onMessage: (msg: unknown) => void) {
  const wsRef   = useRef<WebSocket | null>(null);
  const cbRef   = useRef(onMessage);
  cbRef.current = onMessage;
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!url) return;
    let dead = false;
    let retryTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      if (dead) return;
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;
        ws.onopen    = () => !dead && setConnected(true);
        ws.onmessage = (e) => { try { cbRef.current(JSON.parse(e.data)); } catch {} };
        ws.onerror   = () => ws.close();
        ws.onclose   = () => {
          if (!dead) { setConnected(false); retryTimer = setTimeout(connect, 3000); }
        };
      } catch {}
    };

    connect();
    return () => {
      dead = true;
      clearTimeout(retryTimer);
      wsRef.current?.close();
    };
  }, [url]);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN)
      wsRef.current.send(JSON.stringify(data));
  }, []);

  return { connected, send };
}

// ─── Countdown timer ───────────────────────────────────────────
function CountdownTimer({ target, started }: { target: Date; started: boolean }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  if (isPast(target)) return <span className="font-mono text-2xl font-black text-[var(--text-3)]">Завершён</span>;
  const minsLeft = differenceInMinutes(target, now);
  const dur = intervalToDuration({ start: now, end: target });
  const pad = (n?: number) => String(n ?? 0).padStart(2, '0');
  const timeStr = `${pad(dur.hours)}:${pad(dur.minutes)}:${pad(dur.seconds)}`;
  const urgent  = started && minsLeft < 30;
  const critical = started && minsLeft < 5;
  return (
    <span className={`font-mono text-2xl font-black tabular-nums transition-colors ${
      critical ? 'text-red-400 animate-pulse' : urgent ? 'text-orange-400' : 'text-[var(--text-1)]'
    }`}>{timeStr}</span>
  );
}

interface StandingRow extends ContestStanding {
  username?: string;
}

interface ChatMsg {
  id: string; user_id: string; username?: string; content: string; created_at: string;
}

// ─── Problems panel ─────────────────────────────────────────────
function ProblemsPanel({
  problems, solvedIds, attemptedIds, contestId,
}: {
  problems: { id: string; problem?: { title: string; slug: string; difficulty: string }; label?: string }[];
  solvedIds: Set<string>; attemptedIds: Set<string>; contestId: string;
}) {
  if (!problems.length) return (
    <div className="flex flex-col items-center justify-center h-40 text-[var(--text-3)]">
      <Code2 size={32} className="opacity-20 mb-2" /><p className="text-sm">Задач нет</p>
    </div>
  );
  return (
    <div className="flex flex-col gap-1">
      {problems.map((cp, i) => {
        const pId    = cp.problem?.slug ?? cp.id;
        const solved = solvedIds.has(cp.id);
        const tried  = attemptedIds.has(cp.id);
        return (
          <Link key={cp.id} to={`/problems/${pId}?contest=${contestId}`}>
            <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
              solved ? 'border-emerald-500/30 bg-emerald-500/8 hover:bg-emerald-500/12'
              : tried ? 'border-orange-500/30 bg-orange-500/8 hover:bg-orange-500/12'
              : 'border-[var(--border)] hover:border-purple-500/40 hover:bg-[var(--hover)]'
            }`}>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                solved ? 'bg-emerald-500/20 text-emerald-400' : tried ? 'bg-orange-500/20 text-orange-400'
                : 'bg-[var(--surface-2)] text-[var(--text-2)]'
              }`}>{cp.label ?? String.fromCharCode(65 + i)}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${solved ? 'text-emerald-400' : tried ? 'text-orange-400' : 'text-[var(--text-1)]'}`}>
                  {cp.problem?.title ?? 'Задача'}
                </p>
                {cp.problem?.difficulty && <span className="text-xs text-[var(--text-3)]">{cp.problem.difficulty}</span>}
              </div>
              {solved && <CheckCircle size={14} className="text-emerald-400 shrink-0" />}
              {!solved && tried && <Circle size={14} className="text-orange-400 shrink-0" />}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─── Standings panel ────────────────────────────────────────────
function StandingsPanel({ standings, userId, frozen, isLoading }: {
  standings: StandingRow[]; userId?: string; frozen: boolean; isLoading: boolean;
}) {
  if (isLoading) return <div className="flex flex-col gap-2 p-4">{[1,2,3,4,5].map(i => <SkeletonLine key={i} className="w-full h-12" />)}</div>;
  if (!standings.length) return (
    <div className="flex flex-col items-center justify-center h-40 text-[var(--text-3)]">
      <Trophy size={32} className="opacity-20 mb-2" /><p className="text-sm">Результатов пока нет</p>
    </div>
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
            <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-3)] uppercase w-14">#</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-3)] uppercase">Участник</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--text-3)] uppercase">Очки</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--text-3)] uppercase">Штраф</th>
            {!frozen && <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--text-3)] uppercase">Посл. решение</th>}
          </tr>
        </thead>
        <LayoutGroup>
          <tbody>
            {standings.map((s, i) => (
              <motion.tr
                key={s.user_id}
                layout layoutId={`row-${s.user_id}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`border-b border-[var(--border)] transition-colors ${s.user_id === userId ? 'bg-purple-500/10' : 'hover:bg-[var(--hover)]'}`}
              >
                <td className="px-4 py-3.5 text-sm">
                  {i === 0 ? <Crown size={17} className="text-yellow-400" />
                  : i === 1 ? <Crown size={17} className="text-slate-400" />
                  : i === 2 ? <Crown size={17} className="text-amber-600" />
                  : <span className="text-[var(--text-3)] font-mono text-xs">{s.rank}</span>}
                </td>
                <td className="px-4 py-3.5 text-sm font-medium text-[var(--text-1)]">
                  <Link to={`/profile/${s.user_id}`} className="hover:text-purple-400 transition-colors">
                    {s.username ?? `user#${s.user_id.slice(0, 6)}`}
                    {s.user_id === userId && <span className="ml-2 text-xs text-purple-400">(вы)</span>}
                  </Link>
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-400">{s.score}</td>
                <td className="px-4 py-3.5 text-right font-mono text-sm text-[var(--text-3)]">{s.penalty} мин</td>
                {!frozen && (
                  <td className="px-4 py-3.5 text-right text-xs text-[var(--text-3)]">
                    {(s as StandingRow & { last_solve?: string }).last_solve
                      ? formatDistanceToNow(new Date((s as StandingRow & { last_solve?: string }).last_solve!), { addSuffix: true, locale: ru })
                      : '—'}
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </LayoutGroup>
      </table>
    </div>
  );
}

// ─── Chat panel ─────────────────────────────────────────────────
function ChatPanel({ messages, userId, onSend, wsConnected }: {
  messages: ChatMsg[]; userId?: string;
  onSend: (text: string) => void; wsConnected: boolean;
}) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const canSend = !!userId;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const handleSend = () => {
    if (!input.trim() || !canSend) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-3)]">
            <MessageSquare size={28} className="opacity-20 mb-2" />
            <p className="text-sm">Сообщений пока нет</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map(m => {
            const isMe = m.user_id === userId;
            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {(m.username ?? m.user_id)[0].toUpperCase()}
                </div>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                  isMe ? 'bg-purple-600 text-white rounded-tr-none'
                  : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] rounded-tl-none'
                }`}>
                  {!isMe && m.username && <p className="text-xs text-purple-400 mb-0.5 font-medium">{m.username}</p>}
                  <p className="break-words">{m.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-purple-200' : 'text-[var(--text-3)]'}`}>
                    {formatDistanceToNow(new Date(m.created_at), { addSuffix: true, locale: ru })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
      {canSend ? (
        <div className="p-3 border-t border-[var(--border)] flex gap-2 bg-[var(--surface)]">
          <input
            className="input-theme flex-1 rounded-xl px-3 py-2 text-sm"
            placeholder="Написать сообщение…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors shrink-0 cursor-pointer"
          >
            <Send size={14} />
          </button>
        </div>
      ) : (
        <div className="p-3 border-t border-[var(--border)] flex items-center gap-2 bg-[var(--surface-2)]">
          <Lock size={14} className="text-[var(--text-3)]" />
          <span className="text-sm text-[var(--text-3)]">Войдите, чтобы писать в чат</span>
        </div>
      )}
      <div className="px-3 pb-2 flex items-center gap-1.5">
        {wsConnected
          ? <><Wifi size={10} className="text-emerald-400" /><span className="text-[10px] text-emerald-400">Подключено</span></>
          : <><WifiOff size={10} className="text-[var(--text-3)]" /><span className="text-[10px] text-[var(--text-3)]">Переподключение...</span></>}
      </div>
    </div>
  );
}

// ─── Leave dialog ────────────────────────────────────────────────
function LeaveDialog({ onStay, onLeave }: { onStay: () => void; onLeave: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[var(--surface)] border border-red-500/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
            <LogOut size={20} className="text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-1)]">Покинуть контест?</h3>
        </div>
        <p className="text-sm text-[var(--text-2)] mb-6">
          Вы будете отстранены от контеста и потеряете текущую позицию в таблице результатов.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onStay}>Остаться</Button>
          <button
            onClick={onLeave}
            className="flex-1 py-2 px-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition-all cursor-pointer"
          >
            Уйти
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main ContestDetail ─────────────────────────────────────────
export function ContestDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data: contest, isLoading: contestLoading } = useQuery({
    queryKey: ['contest', slug],
    queryFn: () => contestsApi.get(slug!),
    enabled: !!slug, retry: false,
  });

  const { data: contestProblems, isLoading: problemsLoading, error: problemsError } = useQuery({
    queryKey: ['contest-problems', contest?.id],
    queryFn: () => contestsApi.problems(contest!.id),
    enabled: !!contest?.id, retry: false,
  });

  const { data: apiStandings, isLoading: standingsLoading } = useQuery({
    queryKey: ['contest-standings', contest?.id],
    queryFn: () => contestsApi.standings(contest!.id),
    enabled: !!contest?.id, refetchInterval: 15_000, retry: false,
  });

  const { data: mySubmissions } = useQuery({
    queryKey: ['submissions', 'me', 'contest', contest?.id],
    queryFn: () => submissionsApi.me(0, 100),
    enabled: !!contest?.id && !!user, retry: false,
  });

  const { data: apiMessages } = useQuery({
    queryKey: ['chat', 'contest', contest?.id],
    queryFn: () => chatApi.contest(contest!.id, 0, 100),
    enabled: !!contest?.id, refetchInterval: 5_000, retry: false,
  });

  // State
  const [liveStandings, setLiveStandings] = useState<StandingRow[]>([]);
  const [frozenStandings, setFrozenStandings] = useState<StandingRow[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [mobileTab, setMobileTab] = useState<'problems' | 'standings' | 'chat'>('problems');
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const frozenRef = useRef(false);

  useEffect(() => {
    if (apiStandings) setLiveStandings(apiStandings as StandingRow[]);
  }, [apiStandings]);

  useEffect(() => {
    if (apiMessages?.length) {
      setChatMessages(prev => {
        const ids = new Set(prev.map(m => m.id));
        const newMsgs = (apiMessages as ChatMsg[]).filter(m => !ids.has(m.id));
        return newMsgs.length
          ? [...prev, ...newMsgs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          : prev;
      });
    }
  }, [apiMessages]);

  // Timing
  const toUtc = (s: string) => new Date(s.endsWith('Z') || s.includes('+') ? s : s + 'Z');
  const start = contest ? toUtc(contest.starts_at as unknown as string) : new Date();
  const end   = contest ? toUtc(contest.ends_at   as unknown as string) : new Date();
  const isLive = contest ? !isFuture(start) && !isPast(end) : false;
  const isOver = contest ? isPast(end) : false;
  const isFrozenNow = isLive && differenceInMinutes(end, new Date()) < 30;

  useEffect(() => {
    if (isFrozenNow && !frozenRef.current && liveStandings.length) {
      frozenRef.current = true;
      setFrozenStandings(liveStandings);
    }
    if (!isFrozenNow) frozenRef.current = false;
  }, [isFrozenNow, liveStandings]);

  const displayedStandings = isFrozenNow && frozenStandings.length ? frozenStandings : liveStandings;

  // Registration
  const { data: myReg } = useQuery({
    queryKey: ['my-registration', contest?.id],
    queryFn: () => contestsApi.myRegistration(contest!.id),
    enabled: !!contest?.id && !!user && !isOver, retry: false,
  });
  const registerSuccess = !!myReg;

  const registerMut = useMutation({
    mutationFn: () => contestsApi.register(contest!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-registration', contest?.id] }),
  });

  const unregisterMut = useMutation({
    mutationFn: () => contestsApi.unregister(contest!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-registration', contest?.id] }),
  });

  // Navigation guard — block leaving during live contest
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (!isLive || !registerSuccess) return false;
    if (currentLocation.pathname === nextLocation.pathname) return false;
    // Allow navigating to problem pages from contest
    const problemUrl = nextLocation.search.includes(`contest=${contest?.id}`);
    if (problemUrl) return false;
    return true;
  });

  useEffect(() => {
    if (blocker.state === 'blocked') setShowLeaveDialog(true);
  }, [blocker.state]);

  const handleConfirmLeave = () => {
    unregisterMut.mutate();
    setShowLeaveDialog(false);
    blocker.proceed?.();
  };

  const handleStay = () => {
    setShowLeaveDialog(false);
    blocker.reset?.();
  };

  // WebSocket — standings
  const wsToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const wsStandingsUrl = contest?.id ? `${WS_BASE}/contests/${contest.id}/ws` : null;
  const wsChatUrl      = contest?.id ? `${WS_BASE}/contests/${contest.id}/chat/ws${wsToken ? `?token=${wsToken}` : ''}` : null;

  const handleStandingsWS = useCallback((msg: unknown) => {
    const data = msg as { type?: string; data?: StandingRow[] };
    const rows = Array.isArray(data.data) ? data.data : Array.isArray(msg) ? (msg as StandingRow[]) : null;
    if (rows && !frozenRef.current) setLiveStandings(rows);
  }, []);

  const { connected: wsStandingsOk } = useContestWS(wsStandingsUrl, handleStandingsWS);

  const handleChatWS = useCallback((msg: unknown) => {
    const data = msg as { type?: string; id?: string; user_id?: string; username?: string; content?: string; created_at?: string; messages?: ChatMsg[] };
    if (data.type === 'history' && Array.isArray(data.messages)) {
      setChatMessages(data.messages);
      return;
    }
    if ((data.type === 'message' || data.id) && data.user_id && data.content) {
      const newMsg: ChatMsg = {
        id: data.id ?? `ws-${Date.now()}`,
        user_id: data.user_id,
        username: data.username,
        content: data.content,
        created_at: data.created_at ?? new Date().toISOString(),
      };
      setChatMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
    }
  }, []);

  const { connected: wsChatOk, send: sendChatWS } = useContestWS(wsChatUrl, handleChatWS);

  const sendMsgMut = useMutation({
    mutationFn: (content: string) => chatApi.send({ content, contest_id: contest!.id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chat', 'contest', contest?.id] }),
  });

  const handleSendChat = (text: string) => {
    if (!text.trim()) return;
    if (wsChatOk) sendChatWS({ content: text });
    else sendMsgMut.mutate(text);
  };

  // Solve status
  const solvedIds    = new Set<string>();
  const attemptedIds = new Set<string>();
  (mySubmissions ?? []).forEach(s => {
    if (s.contest_id === contest?.id) {
      if (s.status === 'accepted') solvedIds.add(s.problem_id);
      else attemptedIds.add(s.problem_id);
    }
  });

  const isOrganizer = user?.id === contest?.author_id || user?.role === 'admin';
  const problems = (contestProblems ?? []) as { id: string; problem?: { title: string; slug: string; difficulty: string }; label?: string }[];

  // Loading
  if (contestLoading) return (
    <div className="p-6 max-w-7xl mx-auto">
      <SkeletonLine className="w-72 h-9 mb-4" />
      <SkeletonLine className="w-full h-28 mb-6" />
      <div className="grid lg:grid-cols-[280px_1fr_320px] gap-4">
        <SkeletonLine className="h-96" /><SkeletonLine className="h-96" /><SkeletonLine className="h-96" />
      </div>
    </div>
  );

  if (!contest) return (
    <div className="p-10 text-center text-[var(--text-3)]">
      <Trophy size={48} className="mx-auto mb-4 opacity-20" />
      <p className="text-lg">Контест не найден</p>
      <Link to="/contests" className="mt-3 inline-flex items-center gap-1.5 text-purple-400 hover:underline text-sm">
        <ArrowLeft size={14} /> Все контесты
      </Link>
    </div>
  );

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* Navigation guard dialog */}
      {showLeaveDialog && <LeaveDialog onStay={handleStay} onLeave={handleConfirmLeave} />}

      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Link to="/contests" className="inline-flex items-center gap-1.5 text-[var(--text-3)] hover:text-[var(--text-1)] text-sm mb-3 transition-colors">
          <ArrowLeft size={14} /> Контесты
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {isLive && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> ИДЁТ СЕЙЧАС
                </span>
              )}
              {isFrozenNow && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                  <Snowflake size={11} /> ТАБЛИЦА ЗАМОРОЖЕНА
                </span>
              )}
              {(contest as unknown as { is_team_contest?: boolean }).is_team_contest && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 text-xs font-semibold">
                  <Users2 size={11} /> КОМАНДНЫЙ
                </span>
              )}
              {isOver && <Badge variant="gray">Завершён</Badge>}
              {isFuture(start) && <Badge variant="cyan">Предстоит</Badge>}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-1)] truncate">{contest.title}</h1>
            {contest.description && <p className="text-[var(--text-3)] text-sm mt-1">{contest.description}</p>}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!isOver && user && (
              registerSuccess ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
                  <CheckCircle size={15} /> Зарегистрирован
                </div>
              ) : (
                <Button icon={<Trophy size={15} />} onClick={() => registerMut.mutate()} loading={registerMut.isPending}>
                  Зарегистрироваться
                </Button>
              )
            )}
            {!isOver && !user && (
              <Link to="/login"><Button variant="outline" icon={<Trophy size={15} />}>Войти и зарегистрироваться</Button></Link>
            )}
          </div>
        </div>

        {/* Timer bar */}
        <div className="mt-4 flex flex-wrap gap-6 items-center p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-[var(--text-3)] uppercase tracking-widest font-semibold">
              {isLive ? 'Осталось' : isFuture(start) ? 'До начала' : 'Завершился'}
            </span>
            {isOver
              ? <span className="font-mono text-xl font-black text-[var(--text-3)]">— —:—:—</span>
              : isFuture(start) ? <CountdownTimer target={start} started={false} />
              : <CountdownTimer target={end} started={true} />}
          </div>
          <div className="w-px h-10 bg-[var(--border)]" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-[var(--text-3)] uppercase tracking-widest font-semibold">Начало</span>
            <span className="text-sm font-medium text-[var(--text-1)]">{format(start, 'd MMMM, HH:mm', { locale: ru })}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-[var(--text-3)] uppercase tracking-widest font-semibold">Конец</span>
            <span className="text-sm font-medium text-[var(--text-1)]">{format(end, 'd MMMM, HH:mm', { locale: ru })}</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[var(--text-3)] text-sm"><Users size={14} /> {liveStandings.length} участников</div>
            <div className="flex items-center gap-1.5 text-[var(--text-3)] text-sm"><Code2 size={14} /> {problems.length} задач</div>
            <div className="flex items-center gap-1.5 text-xs">
              {wsStandingsOk
                ? <><Wifi size={11} className="text-emerald-400" /><span className="text-emerald-400">Live</span></>
                : <><WifiOff size={11} className="text-[var(--text-3)]" /><span className="text-[var(--text-3)]">Offline</span></>}
            </div>
          </div>
        </div>

        {/* Frozen banner */}
        <AnimatePresence>
          {isFrozenNow && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mt-3 flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300">
              <Snowflake size={18} className="shrink-0" />
              <div>
                <p className="font-semibold text-sm">Рейтинг заморожен</p>
                <p className="text-xs text-blue-400 mt-0.5">Финальные результаты будут объявлены после окончания контеста.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Registered + live warning */}
        <AnimatePresence>
          {isLive && registerSuccess && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-orange-500/8 border border-orange-500/20 text-orange-300 text-xs">
              <AlertCircle size={14} className="shrink-0" />
              <span>Вы участвуете в контесте. Уход со страницы снимет вас с соревнования.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile tabs */}
      <div className="flex lg:hidden gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1 mb-4">
        {(['problems', 'standings', 'chat'] as const).map(t => (
          <button key={t} onClick={() => setMobileTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              mobileTab === t ? 'bg-purple-600 text-white shadow-sm' : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--hover)]'
            }`}>
            {t === 'problems' ? 'Задачи' : t === 'standings' ? 'Таблица' : '💬 Чат'}
          </button>
        ))}
      </div>

      {/* Desktop 3-column layout */}
      <div className="grid lg:grid-cols-[280px_1fr_320px] gap-4 h-[calc(100vh-340px)] min-h-[500px]">

        {/* Left: Problems */}
        <div className={`${mobileTab !== 'problems' ? 'hidden lg:flex' : 'flex'} flex-col bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden`}>
          <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
            <Code2 size={15} className="text-purple-400" />
            <span className="text-sm font-semibold text-[var(--text-1)]">Задачи</span>
            <span className="ml-auto text-xs text-[var(--text-3)]">{problems.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {problemsLoading
              ? <div className="flex flex-col gap-2">{[1,2,3].map(i => <SkeletonLine key={i} className="w-full h-14" />)}</div>
              : problemsError
              ? <div className="flex flex-col items-center justify-center h-40 text-[var(--text-3)] gap-2">
                  <Lock size={28} className="opacity-30" />
                  <p className="text-sm text-center">Задачи станут доступны<br/>после начала контеста</p>
                </div>
              : <ProblemsPanel problems={problems} solvedIds={solvedIds} attemptedIds={attemptedIds} contestId={contest.id} />}
          </div>
        </div>

        {/* Center: Standings */}
        <div className={`${mobileTab !== 'standings' ? 'hidden lg:flex' : 'flex'} flex-col bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden`}>
          <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
            <Trophy size={15} className="text-yellow-400" />
            <span className="text-sm font-semibold text-[var(--text-1)]">Таблица результатов</span>
            {isFrozenNow && <span className="ml-auto flex items-center gap-1 text-xs text-blue-400"><Snowflake size={11} /> Заморожена</span>}
            {wsStandingsOk && !isFrozenNow && <span className="ml-auto text-[10px] text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live</span>}
          </div>
          <div className="flex-1 overflow-y-auto">
            <StandingsPanel standings={displayedStandings} userId={user?.id} frozen={isFrozenNow} isLoading={standingsLoading} />
          </div>
        </div>

        {/* Right: Chat */}
        <div className={`${mobileTab !== 'chat' ? 'hidden lg:flex' : 'flex'} flex-col bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden`}>
          <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
            <MessageSquare size={15} className="text-cyan-400" />
            <span className="text-sm font-semibold text-[var(--text-1)]">Чат контеста</span>
            {isOrganizer && isLive && (
              <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
                <AlertCircle size={11} /> Организатор
              </span>
            )}
          </div>
          <div className="flex-1 min-h-0">
            <ChatPanel
              messages={chatMessages}
              userId={user?.id}
              onSend={handleSendChat}
              wsConnected={wsChatOk}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
