import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Send, MessageSquare, ArrowLeft, Star,
  Shield, Crown, UserPlus, Wifi, WifiOff, Trophy,
} from 'lucide-react';
import { teamsApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';
import { SkeletonLine } from '../components/ui/Spinner';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuthStore } from '../store/authStore';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const WS_BASE  = API_BASE.replace(/^http/, 'ws');

interface ChatMsg {
  id: string; user_id: string; username?: string; content: string; created_at: string;
}

interface TeamMember {
  id: string; user_id: string; role: string;
  user?: { id: string; username: string; email?: string };
}

// ── WebSocket hook ─────────────────────────────────────────────
function useTeamWS(url: string | null, onMessage: (msg: unknown) => void) {
  const wsRef   = useRef<WebSocket | null>(null);
  const cbRef   = useRef(onMessage);
  cbRef.current = onMessage;
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!url) return;
    let dead = false;
    let timer: ReturnType<typeof setTimeout>;
    const connect = () => {
      if (dead) return;
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;
        ws.onopen    = () => !dead && setConnected(true);
        ws.onmessage = (e) => { try { cbRef.current(JSON.parse(e.data)); } catch {} };
        ws.onerror   = () => ws.close();
        ws.onclose   = () => { if (!dead) { setConnected(false); timer = setTimeout(connect, 3000); } };
      } catch {}
    };
    connect();
    return () => { dead = true; clearTimeout(timer); wsRef.current?.close(); };
  }, [url]);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN)
      wsRef.current.send(JSON.stringify(data));
  }, []);

  return { connected, send };
}

export function TeamDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const wsToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', slug],
    queryFn: () => teamsApi.get(slug!),
    enabled: !!slug,
  });

  const { data: members } = useQuery({
    queryKey: ['team-members', team?.id],
    queryFn: () => teamsApi.members(team!.id),
    enabled: !!team?.id,
  });

  const joinMut = useMutation({
    mutationFn: () => teamsApi.addMember(team!.id, user!.id),
  });

  // Chat
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const wsUrl = team?.id ? `${WS_BASE}/teams/${team.id}/chat/ws${wsToken ? `?token=${wsToken}` : ''}` : null;

  const handleWS = useCallback((msg: unknown) => {
    const data = msg as { type?: string; messages?: ChatMsg[]; id?: string; user_id?: string; username?: string; content?: string; created_at?: string };
    if (data.type === 'history' && Array.isArray(data.messages)) {
      setMessages(data.messages);
      return;
    }
    if ((data.type === 'message' || data.id) && data.user_id && data.content) {
      const m: ChatMsg = {
        id: data.id ?? `ws-${Date.now()}`,
        user_id: data.user_id,
        username: data.username,
        content: data.content,
        created_at: data.created_at ?? new Date().toISOString(),
      };
      setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m]);
    }
  }, []);

  const { connected, send } = useTeamWS(wsUrl, handleWS);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const handleSend = () => {
    if (!input.trim() || !user) return;
    send({ content: input.trim() });
    setInput('');
  };

  const memberList = (members ?? []) as TeamMember[];
  const isMember = memberList.some(m => m.user_id === user?.id);
  const isOwner  = team && user && String(team.owner_id) === String(user.id);

  if (isLoading) return (
    <div className="p-6 max-w-5xl mx-auto">
      <SkeletonLine className="w-60 h-8 mb-6" />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <SkeletonLine className="h-80" />
        <SkeletonLine className="h-80" />
      </div>
    </div>
  );

  if (!team) return (
    <div className="p-10 text-center text-[var(--text-3)]">
      <Users size={48} className="mx-auto mb-4 opacity-20" />
      <p className="text-lg">Команда не найдена</p>
      <Link to="/teams" className="mt-3 inline-flex items-center gap-1.5 text-purple-400 hover:underline text-sm">
        <ArrowLeft size={14} /> Все команды
      </Link>
    </div>
  );

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <Link to="/teams" className="inline-flex items-center gap-1.5 text-[var(--text-3)] hover:text-[var(--text-1)] text-sm mb-5 transition-colors">
        <ArrowLeft size={14} /> Команды
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-2xl font-bold text-purple-400">
            {team.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-[var(--text-1)]">{team.name}</h1>
              <span className="flex items-center gap-1 text-sm text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                <Star size={12} className="fill-yellow-400" /> {Math.round((team as unknown as { rating: number }).rating ?? 1000)}
              </span>
              {(team as unknown as { is_public: boolean }).is_public
                ? <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Публичная</span>
                : <span className="text-xs text-slate-400 bg-slate-400/10 px-2 py-0.5 rounded-full">Приватная</span>}
            </div>
            {(team as unknown as { description?: string }).description && (
              <p className="text-sm text-[var(--text-3)]">{(team as unknown as { description: string }).description}</p>
            )}
          </div>
          {user && !isMember && !isOwner && (
            <Button icon={<UserPlus size={15} />} onClick={() => joinMut.mutate()} loading={joinMut.isPending}>
              Вступить
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        {/* Members */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
            <Shield size={15} className="text-purple-400" />
            <span className="text-sm font-semibold text-[var(--text-1)]">Участники команды</span>
            <span className="ml-auto text-xs text-[var(--text-3)]">{memberList.length} / {(team as unknown as { max_members: number }).max_members ?? 5}</span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {memberList.length === 0 ? (
              <div className="p-6 text-center text-[var(--text-3)] text-sm">Пока нет участников</div>
            ) : memberList.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-4 hover:bg-[var(--hover)] transition-colors">
                <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-400">
                  {(m.user?.username ?? 'U')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-1)] truncate">{m.user?.username ?? m.user_id.slice(0, 8)}</p>
                  <p className="text-xs text-[var(--text-3)] capitalize">{m.role}</p>
                </div>
                {m.role === 'owner' && <Crown size={14} className="text-yellow-400" />}
                {m.user_id === user?.id && <span className="text-xs text-purple-400">(вы)</span>}
              </div>
            ))}
          </div>

          {/* Stats placeholder */}
          <div className="p-4 border-t border-[var(--border)] grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-xl bg-[var(--surface-2)]">
              <p className="text-xl font-black text-purple-400">{Math.round((team as unknown as { rating: number }).rating ?? 1000)}</p>
              <p className="text-xs text-[var(--text-3)] mt-0.5">Рейтинг</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-[var(--surface-2)]">
              <p className="text-xl font-black text-emerald-400">{memberList.length}</p>
              <p className="text-xs text-[var(--text-3)] mt-0.5">Участников</p>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden flex flex-col h-[520px]">
          <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
            <MessageSquare size={15} className="text-cyan-400" />
            <span className="text-sm font-semibold text-[var(--text-1)]">Командный чат</span>
            <span className="ml-auto flex items-center gap-1.5 text-[10px]">
              {connected
                ? <><Wifi size={10} className="text-emerald-400" /><span className="text-emerald-400">Live</span></>
                : <><WifiOff size={10} className="text-[var(--text-3)]" /><span className="text-[var(--text-3)]">Оффлайн</span></>}
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-3)]">
                <MessageSquare size={28} className="opacity-20 mb-2" />
                <p className="text-sm">Начни общение с командой</p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {messages.map(m => {
                const isMe = m.user_id === user?.id;
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

          {/* Input */}
          {isMember || isOwner ? (
            <div className="p-3 border-t border-[var(--border)] flex gap-2 bg-[var(--surface)]">
              <input
                className="input-theme flex-1 rounded-xl px-3 py-2 text-sm"
                placeholder="Написать команде…"
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
            <div className="p-3 border-t border-[var(--border)] text-xs text-[var(--text-3)] text-center">
              {user ? 'Вступите в команду, чтобы писать в чат' : 'Войдите в аккаунт, чтобы писать'}
            </div>
          )}
        </div>
      </div>

      {/* Team contests hint */}
      <div className="mt-5 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center gap-3">
        <Trophy size={18} className="text-yellow-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-[var(--text-1)]">Командные олимпиады</p>
          <p className="text-xs text-[var(--text-3)] mt-0.5">
            Участвуйте в командных контестах вместе. Перейдите на страницу{' '}
            <Link to="/contests" className="text-purple-400 hover:underline">Контестов</Link>{' '}
            и ищите контесты с пометкой «Командный».
          </p>
        </div>
      </div>
    </div>
  );
}
