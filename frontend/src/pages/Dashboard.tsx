import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Trophy, Swords, TrendingUp, CheckCircle, Clock, Star, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { submissionsApi, contestsApi, ratingsApi, problemsApi } from '../api/endpoints';
import { Card, CardBody } from '../components/ui/Card';
import { StatusBadge, DifficultyBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SkeletonLine } from '../components/ui/Spinner';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

function StatCard({ value, label, icon: Icon, color }: { value: string | number; label: string; icon: React.ElementType; color: string }) {
  return (
    <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-slate-500 text-sm">{label}</p>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuthStore();

  const { data: submissions, isLoading: subsLoading } = useQuery({
    queryKey: ['submissions', 'me'],
    queryFn: () => submissionsApi.me(0, 5),
  });

  const { data: contests } = useQuery({
    queryKey: ['contests', 'list'],
    queryFn: () => contestsApi.list({ limit: 3 }),
  });

  const { data: ratings } = useQuery({
    queryKey: ['ratings', 'me'],
    queryFn: () => ratingsApi.me(0, 50),
  });

  const { data: problems } = useQuery({
    queryKey: ['problems', 'list'],
    queryFn: () => problemsApi.list({ limit: 5 }),
  });

  const accepted    = submissions?.filter(s => s.status === 'accepted').length ?? 0;
  // Рейтинг: базовое значение 0, растёт только от контестов
  const ratingDelta = ratings?.reduce((acc: number, r: { delta: number }) => acc + r.delta, 0) ?? 0;
  const displayRating = Math.max(0, ratingDelta);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {greeting}, <span className="gradient-text">{user?.username}</span> 👋
        </h1>
        <p className="text-slate-500 mt-1">Готов решать задачи сегодня?</p>
      </motion.div>

      {/* Статистика */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <StatCard value={accepted}                       label="Решено задач"    icon={CheckCircle} color="bg-emerald-100 text-emerald-600" />
        <StatCard value={displayRating}                  label="Рейтинг"         icon={TrendingUp}  color="bg-purple-100 text-purple-600"   />
        <StatCard value={submissions?.length ?? 0}       label="Посылок всего"   icon={Code2}       color="bg-cyan-100 text-cyan-600"       />
        <StatCard value={contests?.length ?? 0}          label="Контестов"       icon={Trophy}      color="bg-yellow-100 text-yellow-600"   />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Последние посылки */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Clock size={16} className="text-slate-400" /> Последние посылки
              </h2>
              <Link to="/problems">
                <Button variant="ghost" size="sm" icon={<ArrowRight size={14} />}>Все задачи</Button>
              </Link>
            </div>
            <CardBody className="p-0">
              {subsLoading ? (
                <div className="p-5 flex flex-col gap-3">
                  {[1,2,3].map(i => <SkeletonLine key={i} className="w-full h-8" />)}
                </div>
              ) : (submissions?.length ?? 0) === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  <Code2 size={32} className="mx-auto mb-2 opacity-30" />
                  <p>Нет посылок. <Link to="/problems" className="text-purple-600 hover:underline">Реши задачу!</Link></p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {submissions?.map(sub => (
                    <div key={sub.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <StatusBadge status={sub.status} />
                        <div className="min-w-0">
                          <p className="text-sm text-slate-600 font-mono truncate">{sub.problem_id.slice(0, 8)}…</p>
                          <p className="text-xs text-slate-400">{sub.language} · {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true, locale: ru })}</p>
                        </div>
                      </div>
                      {sub.time_ms && <span className="text-xs text-slate-400 font-mono shrink-0">{sub.time_ms}мс</span>}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Правая колонка */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex flex-col gap-4"
        >
          {/* Контесты */}
          <Card>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Trophy size={14} className="text-yellow-500" /> Контесты
              </h2>
              <Link to="/contests"><Button variant="ghost" size="sm">Все</Button></Link>
            </div>
            <CardBody className="p-4 flex flex-col gap-3">
              {(contests?.length ?? 0) === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">Нет предстоящих контестов</p>
              )}
              {contests?.map(c => (
                <Link key={c.id} to={`/contests/${c.slug}`}>
                  <div className="p-3 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all group">
                    <p className="text-sm font-medium text-slate-800 group-hover:text-purple-700 truncate">{c.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(c.starts_at).toLocaleDateString('ru-RU')}</p>
                  </div>
                </Link>
              ))}
            </CardBody>
          </Card>

          {/* Быстрый старт */}
          <Card>
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Star size={14} className="text-purple-500" /> Быстрый старт
              </h2>
            </div>
            <CardBody className="p-4 flex flex-col gap-2">
              <Link to="/problems">
                <Button variant="outline" size="sm" icon={<Code2 size={14} />} className="w-full justify-start">
                  Решить задачу
                </Button>
              </Link>
              <Link to="/duels">
                <Button variant="outline" size="sm" icon={<Swords size={14} />} className="w-full justify-start">
                  Начать дуэль
                </Button>
              </Link>
              <Link to="/ai-mentor">
                <Button variant="outline" size="sm" icon={<TrendingUp size={14} />} className="w-full justify-start">
                  Спросить AI
                </Button>
              </Link>
            </CardBody>
          </Card>

          {/* Рекомендуемые задачи */}
          <Card>
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Рекомендуем</h2>
            </div>
            <CardBody className="p-4 flex flex-col gap-1">
              {problems?.slice(0, 4).map(p => (
                <Link key={p.id} to={`/problems/${p.slug}`}>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors group">
                    <p className="text-sm text-slate-700 group-hover:text-purple-700 transition-colors truncate">{p.title}</p>
                    <DifficultyBadge difficulty={p.difficulty} />
                  </div>
                </Link>
              ))}
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
