import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Calendar, ArrowRight, Clock } from 'lucide-react';
import { contestsApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardBody } from '../components/ui/Card';
import { SkeletonLine } from '../components/ui/Spinner';
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Contest } from '../types';

const STATUS_TABS = [
  { value: '',          label: 'Все'          },
  { value: 'upcoming',  label: 'Предстоящие'  },
  { value: 'running',   label: '🔴 Идут сейчас'},
  { value: 'finished',  label: 'Завершённые'  },
];

function ContestStatusBadge({ contest }: { contest: Contest }) {
  const start = new Date(contest.starts_at), end = new Date(contest.ends_at);
  if (isFuture(start))  return <Badge variant="cyan">Предстоит</Badge>;
  if (isPast(end))      return <Badge variant="gray">Завершён</Badge>;
  return <Badge variant="green">🔴 Идёт</Badge>;
}

function ContestCard({ contest }: { contest: Contest }) {
  const start = new Date(contest.starts_at), end = new Date(contest.ends_at);
  const isLive = !isFuture(start) && !isPast(end);

  const registerMut = useMutation({ mutationFn: () => contestsApi.register(contest.id) });

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Card className={`overflow-hidden ${isLive ? 'border-emerald-300 shadow-emerald-100 shadow-md' : ''}`}>
        <CardBody className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <ContestStatusBadge contest={contest} />
                {isLive && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> В процессе
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold text-slate-900 truncate mt-1">{contest.title}</h3>
              {contest.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{contest.description}</p>}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isLive ? 'bg-emerald-100' : 'bg-yellow-100'}`}>
              <Trophy size={22} className={isLive ? 'text-emerald-600' : 'text-yellow-600'} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5"><Calendar size={12} /><span>{format(start, 'd MMM, HH:mm', { locale: ru })}</span></div>
            <div className="flex items-center gap-1.5"><Clock size={12} />
              {isFuture(start) ? <span>Начнётся {formatDistanceToNow(start, { addSuffix: true, locale: ru })}</span>
                : isPast(end)  ? <span>Завершился {formatDistanceToNow(end, { addSuffix: true, locale: ru })}</span>
                : <span>Завершится {formatDistanceToNow(end, { addSuffix: true, locale: ru })}</span>
              }
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/contests/${contest.slug}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full" icon={<ArrowRight size={14} />}>
                {isLive ? 'Войти в контест' : isPast(end) ? 'Посмотреть результаты' : 'Подробнее'}
              </Button>
            </Link>
            {!isPast(end) && (
              <Button size="sm" onClick={() => registerMut.mutate()} loading={registerMut.isPending}
                variant={isLive ? 'primary' : 'secondary'}>
                Регистрация
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

export function Contests() {
  const [statusFilter, setStatus] = useState('');

  const { data: contests, isLoading } = useQuery({
    queryKey: ['contests', statusFilter],
    queryFn: () => contestsApi.list({ limit: 50, status: statusFilter || undefined }),
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-1 flex items-center gap-3">
          <Trophy size={28} className="text-yellow-500" /> Контесты
        </h1>
        <p className="text-slate-500">Участвуй в соревнованиях и поднимайся в рейтинге</p>
      </motion.div>

      <div className="flex gap-1 mb-6 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
        {STATUS_TABS.map(t => (
          <button key={t.value} onClick={() => setStatus(t.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              statusFilter === t.value ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <Card key={i}><CardBody><SkeletonLine className="w-full h-40" /></CardBody></Card>)}
        </div>
      ) : (contests ?? []).length === 0 ? (
        <div className="py-20 text-center text-slate-400">
          <Trophy size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg">Контесты не найдены</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(contests as Contest[]).map(c => <ContestCard key={c.id} contest={c} />)}
        </div>
      )}
    </div>
  );
}
