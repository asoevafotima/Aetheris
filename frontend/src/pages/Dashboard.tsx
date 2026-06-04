import { Component, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Trophy, Swords, TrendingUp, CheckCircle, Clock, Star, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { submissionsApi, contestsApi, ratingsApi, problemsApi } from '../api/endpoints';
import { Card, CardBody } from '../components/ui/Card';
import { StatusBadge, DifficultyBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SkeletonLine } from '../components/ui/Spinner';
import { formatDistanceToNow } from 'date-fns';

// ──────────────────────────────────────────────────────────────
// Error Boundary
// ──────────────────────────────────────────────────────────────
class DashboardErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(err: Error) {
    return { hasError: true, message: err.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
          <AlertCircle size={40} className="text-red-400" />
          <p className="text-[var(--text-1)] font-semibold text-lg">Ошибка загрузки дашборда</p>
          <p className="text-red-400 text-sm font-mono bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 max-w-md">
            {this.state.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
          >
            <RefreshCw size={14} /> Попробовать снова
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
function safeFormatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '—';
  }
}

function safeLocalDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString();
  } catch {
    return '—';
  }
}

// ──────────────────────────────────────────────────────────────
// StatCard
// ──────────────────────────────────────────────────────────────
function StatCard({
  value, label, icon: Icon, color,
}: {
  value: string | number;
  label: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--text-1)]">{value}</p>
        <p className="text-[var(--text-3)] text-sm">{label}</p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Dashboard (inner)
// ──────────────────────────────────────────────────────────────
function DashboardInner() {
  const { user } = useAuthStore();

  const {
    data: submissions,
    isLoading: subsLoading,
    isError: subsError,
  } = useQuery({
    queryKey: ['submissions', 'me'],
    queryFn: () => submissionsApi.me(0, 5),
    retry: false,
  });

  const { data: contests, isLoading: contestsLoading } = useQuery({
    queryKey: ['contests', 'upcoming'],
    queryFn: () => contestsApi.list({ limit: 3 }),
    retry: false,
  });

  const { data: ratings } = useQuery({
    queryKey: ['ratings', 'me'],
    queryFn: () => ratingsApi.me(0, 10),
    retry: false,
  });

  const { data: problems, isLoading: problemsLoading } = useQuery({
    queryKey: ['problems', 'list'],
    queryFn: () => problemsApi.list({ limit: 5 }),
    retry: false,
  });

  const accepted  = submissions?.filter(s => s.status === 'accepted').length ?? 0;
  const totalRating = ratings?.reduce((acc, r) => acc + (r.delta ?? 0), 1200) ?? 1200;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-1)]">
          {greeting},{' '}
          <span className="gradient-text">{user?.username ?? '...'}</span> 👋
        </h1>
        <p className="text-[var(--text-2)] mt-1">Готов решать задачи сегодня?</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <StatCard value={accepted}                     label="Решено задач"   icon={CheckCircle} color="bg-emerald-500/15 text-emerald-400" />
        <StatCard value={totalRating}                  label="Рейтинг"        icon={TrendingUp}  color="bg-purple-500/15 text-purple-400"   />
        <StatCard value={submissions?.length ?? 0}     label="Посылок всего"  icon={Code2}       color="bg-cyan-500/15 text-cyan-400"       />
        <StatCard value={contests?.length ?? 0}        label="Контестов"      icon={Trophy}      color="bg-yellow-500/15 text-yellow-400"   />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Submissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-base font-semibold text-[var(--text-1)] flex items-center gap-2">
                <Clock size={16} className="text-[var(--text-3)]" /> Последние посылки
              </h2>
              <Link to="/problems">
                <Button variant="ghost" size="sm" icon={<ArrowRight size={14} />}>Все задачи</Button>
              </Link>
            </div>
            <CardBody className="p-0">
              {subsLoading ? (
                <div className="p-5 flex flex-col gap-3">
                  {[1, 2, 3].map(i => <SkeletonLine key={i} className="w-full h-8" />)}
                </div>
              ) : subsError || !submissions?.length ? (
                <div className="p-10 text-center text-[var(--text-3)]">
                  <Code2 size={32} className="mx-auto mb-2 opacity-30" />
                  <p>
                    Посылок нет.{' '}
                    <Link to="/problems" className="text-purple-400 hover:underline">
                      Реши задачу!
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {submissions.map(sub => (
                    <div
                      key={sub.id}
                      className="px-5 py-3 flex items-center justify-between hover:bg-[var(--hover)] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <StatusBadge status={sub.status} />
                        <div className="min-w-0">
                          <p className="text-sm text-[var(--text-1)] truncate font-mono">
                            {(sub.problem_id ?? sub.id ?? '').slice(0, 8)}…
                          </p>
                          <p className="text-xs text-[var(--text-3)]">
                            {sub.language ?? '?'} · {safeFormatDate(sub.created_at)}
                          </p>
                        </div>
                      </div>
                      {sub.time_ms != null && (
                        <span className="text-xs text-[var(--text-3)] font-mono shrink-0">
                          {sub.time_ms}ms
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Right column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex flex-col gap-4"
        >
          {/* Upcoming contests */}
          <Card>
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-1)] flex items-center gap-2">
                <Trophy size={14} className="text-yellow-400" /> Ближайшие контесты
              </h2>
              <Link to="/contests">
                <Button variant="ghost" size="sm">Все</Button>
              </Link>
            </div>
            <CardBody className="p-4 flex flex-col gap-3">
              {contestsLoading ? (
                <SkeletonLine className="w-full h-12" />
              ) : !contests?.length ? (
                <p className="text-[var(--text-3)] text-sm text-center py-4">Нет контестов</p>
              ) : (
                contests.map(c => (
                  <Link key={c.id} to={`/contests/${c.slug ?? c.id}`}>
                    <div className="p-3 rounded-lg border border-[var(--border)] hover:border-purple-500/40 transition-all bg-[var(--surface-2)] group">
                      <p className="text-sm font-medium text-[var(--text-1)] group-hover:text-purple-400 transition-colors truncate">
                        {c.title ?? 'Без названия'}
                      </p>
                      <p className="text-xs text-[var(--text-3)] mt-0.5">
                        {safeLocalDate(c.starts_at)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </CardBody>
          </Card>

          {/* Quick actions */}
          <Card>
            <div className="p-4 border-b border-[var(--border)]">
              <h2 className="text-sm font-semibold text-[var(--text-1)] flex items-center gap-2">
                <Star size={14} className="text-purple-400" /> Быстрый старт
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
                  AI Наставник
                </Button>
              </Link>
            </CardBody>
          </Card>

          {/* Recommended Problems */}
          <Card>
            <div className="p-4 border-b border-[var(--border)]">
              <h2 className="text-sm font-semibold text-[var(--text-1)]">Рекомендуем</h2>
            </div>
            <CardBody className="p-4 flex flex-col gap-2">
              {problemsLoading ? (
                <SkeletonLine className="w-full h-10" />
              ) : !problems?.length ? (
                <p className="text-[var(--text-3)] text-sm text-center py-4">Задач пока нет</p>
              ) : (
                problems.slice(0, 3).map(p => (
                  <Link key={p.id} to={`/problems/${p.slug ?? p.id}`}>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--hover)] transition-colors group">
                      <p className="text-sm text-[var(--text-2)] group-hover:text-[var(--text-1)] transition-colors truncate">
                        {p.title ?? 'Задача'}
                      </p>
                      <DifficultyBadge difficulty={p.difficulty ?? 'easy'} />
                    </div>
                  </Link>
                ))
              )}
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Export с ErrorBoundary
// ──────────────────────────────────────────────────────────────
export function Dashboard() {
  return (
    <DashboardErrorBoundary>
      <DashboardInner />
    </DashboardErrorBoundary>
  );
}
