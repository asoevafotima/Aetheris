import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Users, Code2, Send, MessageSquare, Crown } from 'lucide-react';
import { contestsApi, chatApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { DifficultyBadge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { formatDistanceToNow, isPast, isFuture, intervalToDuration, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuthStore } from '../store/authStore';

function CountdownTimer({ target }: { target: Date }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  if (isPast(target)) return <span className="text-red-500 font-mono text-2xl font-bold">Завершён</span>;
  const dur = intervalToDuration({ start: now, end: target });
  const pad = (n?: number) => String(n ?? 0).padStart(2, '0');
  return <span className="font-mono text-3xl font-black text-slate-900 tabular-nums">{pad(dur.hours)}:{pad(dur.minutes)}:{pad(dur.seconds)}</span>;
}

export function ContestDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const [chatMsg, setChatMsg] = useState('');
  const [tab, setTab] = useState<'problems' | 'standings' | 'chat'>('problems');

  const { data: contest, isLoading } = useQuery({ queryKey: ['contest', slug], queryFn: () => contestsApi.get(slug!), enabled: !!slug });
  const { data: problems } = useQuery({ queryKey: ['contest-problems', contest?.id], queryFn: () => contestsApi.problems(contest!.id), enabled: !!contest?.id, refetchInterval: 30_000 });
  const { data: standings } = useQuery({ queryKey: ['contest-standings', contest?.id], queryFn: () => contestsApi.standings(contest!.id), enabled: !!contest?.id, refetchInterval: tab === 'standings' ? 5_000 : false });
  const { data: messages, refetch: refetchChat } = useQuery({ queryKey: ['chat', 'contest', contest?.id], queryFn: () => chatApi.contest(contest!.id, 0, 50), enabled: !!contest?.id && tab === 'chat', refetchInterval: tab === 'chat' ? 3_000 : false });

  const registerMut = useMutation({ mutationFn: () => contestsApi.register(contest!.id) });
  const sendMsgMut  = useMutation({ mutationFn: () => chatApi.send({ content: chatMsg, contest_id: contest!.id }), onSuccess: () => { setChatMsg(''); refetchChat(); } });

  if (isLoading) return <PageLoader />;
  if (!contest)  return <div className="p-10 text-center text-slate-500">Контест не найден</div>;

  const start  = new Date(contest.starts_at), end = new Date(contest.ends_at);
  const isLive = !isFuture(start) && !isPast(end);
  const isOver = isPast(end);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Шапка */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {isLive && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> ИДЁТ СЕЙЧАС
                </span>
              )}
              {isOver && <span className="text-slate-400 text-sm">Завершён</span>}
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">{contest.title}</h1>
            {contest.description && <p className="text-slate-500">{contest.description}</p>}
          </div>
          {!isOver && (
            <Button onClick={() => registerMut.mutate()} loading={registerMut.isPending} icon={<Trophy size={16} />}>
              Зарегистрироваться
            </Button>
          )}
        </div>

        {/* Таймер */}
        <div className="mt-5 flex flex-wrap gap-6 items-center p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              {isLive ? 'Осталось времени' : isFuture(start) ? 'До начала' : 'Завершился'}
            </span>
            {isLive ? <CountdownTimer target={end} />
              : isFuture(start) ? <CountdownTimer target={start} />
              : <span className="text-slate-500 text-lg font-mono">{formatDistanceToNow(end, { addSuffix: true, locale: ru })}</span>
            }
          </div>
          <div className="h-12 w-px bg-slate-200" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-slate-400">Начало</span>
            <span className="text-sm font-medium text-slate-700">{format(start, 'd MMMM, HH:mm', { locale: ru })}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-slate-400">Конец</span>
            <span className="text-sm font-medium text-slate-700">{format(end, 'd MMMM, HH:mm', { locale: ru })}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-sm ml-auto">
            <Users size={14} /> {standings?.length ?? 0} участников
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <Code2 size={14} /> {(problems as unknown[])?.length ?? 0} задач
          </div>
        </div>
      </motion.div>

      {/* Табы */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit mb-6 shadow-sm">
        {(['problems', 'standings', 'chat'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              tab === t ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t === 'problems' ? 'Задачи' : t === 'standings' ? 'Таблица' : '💬 Чат'}
          </button>
        ))}
      </div>

      {/* Задачи */}
      {tab === 'problems' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {((problems ?? []) as { id: string; problem?: { title: string; slug: string; difficulty: string }; label?: string }[]).map((cp, i) => (
            <Link key={cp.id} to={`/problems/${cp.problem?.slug ?? ''}`}>
              <Card hover className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-sm font-bold text-purple-700">
                    {cp.label ?? String.fromCharCode(65 + i)}
                  </span>
                  {cp.problem?.difficulty && <DifficultyBadge difficulty={cp.problem.difficulty} />}
                </div>
                <p className="text-slate-800 font-semibold">{cp.problem?.title ?? 'Задача'}</p>
              </Card>
            </Link>
          ))}
          {(problems as unknown[])?.length === 0 && (
            <div className="col-span-3 py-16 text-center text-slate-400">
              <Code2 size={40} className="mx-auto mb-3 opacity-20" /> <p>Задачи ещё не добавлены</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Таблица результатов */}
      {tab === 'standings' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Место</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Участник</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Очки</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Штраф</th>
                  </tr>
                </thead>
                <tbody>
                  {(standings ?? []).map((s, i) => (
                    <tr key={s.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${s.user_id === user?.id ? 'bg-purple-50/60' : ''}`}>
                      <td className="px-5 py-4 text-sm">
                        {i === 0 ? <Crown size={18} className="text-yellow-500" />
                          : i === 1 ? <Crown size={18} className="text-slate-400" />
                          : i === 2 ? <Crown size={18} className="text-amber-600" />
                          : <span className="text-slate-500 font-mono">{s.rank}</span>}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-800">
                        <Link to={`/profile/${s.user_id}`} className="hover:text-purple-700 transition-colors">
                          {s.user_id.slice(0, 8)}…
                          {s.user_id === user?.id && <span className="ml-2 text-xs text-purple-500">(вы)</span>}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-emerald-600">{s.score}</td>
                      <td className="px-5 py-4 text-right font-mono text-slate-400">{s.penalty} мин</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(standings ?? []).length === 0 && (
                <div className="py-16 text-center text-slate-400">
                  <Trophy size={40} className="mx-auto mb-3 opacity-20" /><p>Результатов пока нет</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Чат */}
      {tab === 'chat' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="flex flex-col h-[500px]">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <MessageSquare size={16} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-900">Чат контеста</span>
              {isLive && <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-slate-50/40">
              {((messages ?? []) as { id: string; user_id: string; content: string; created_at: string }[]).map(m => (
                <div key={m.id} className={`flex gap-2 ${m.user_id === user?.id ? 'flex-row-reverse' : ''}`}>
                  <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {m.user_id[0].toUpperCase()}
                  </div>
                  <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                    m.user_id === user?.id ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}>
                    <p>{m.content}</p>
                    <p className={`text-[10px] mt-1 ${m.user_id === user?.id ? 'text-purple-200' : 'text-slate-400'}`}>
                      {formatDistanceToNow(new Date(m.created_at), { addSuffix: true, locale: ru })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-200 flex gap-2 bg-white">
              <input
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                placeholder="Написать сообщение…"
                value={chatMsg}
                onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && chatMsg.trim() && sendMsgMut.mutate()}
              />
              <Button size="sm" icon={<Send size={14} />} onClick={() => chatMsg.trim() && sendMsgMut.mutate()} loading={sendMsgMut.isPending}>
                Отправить
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
