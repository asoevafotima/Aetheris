import { Component, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import {
  Code2, Trophy, Swords, TrendingUp, CheckCircle,
  Clock, ArrowRight, AlertCircle, RefreshCw, Zap, Bot,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { submissionsApi, contestsApi, ratingsApi, problemsApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';
import { StatusBadge, DifficultyBadge } from '../components/ui/Badge';
import { SkeletonLine } from '../components/ui/Spinner';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

// ── Error boundary ─────────────────────────────────────────────
class DashboardErrorBoundary extends Component<{ children: ReactNode }, { error: boolean; msg: string }> {
  constructor(p: { children: ReactNode }) { super(p); this.state = { error: false, msg: '' }; }
  static getDerivedStateFromError(e: Error) { return { error: true, msg: e.message }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle size={32} className="text-red-400" />
        </div>
        <p className="text-[var(--text-1)] font-semibold text-lg">Ошибка загрузки дашборда</p>
        <p className="text-red-400 text-sm font-mono bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20 max-w-md">{this.state.msg}</p>
        <Button icon={<RefreshCw size={14} />} onClick={() => this.setState({ error: false, msg: '' })}>
          Попробовать снова
        </Button>
      </div>
    );
  }
}

// ── CountUp ────────────────────────────────────────────────────
function CountUp({ to, delay = 0, prefix = '', suffix = '' }: { to: number; delay?: number; prefix?: string; suffix?: string }) {
  const count   = useMotionValue(0);
  const rounded = useTransform(count, v => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);

  useEffect(() => {
    const timer = setTimeout(() => {
      const ctrl = animate(count, to, { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
      return ctrl.stop;
    }, delay);
    return () => clearTimeout(timer);
  }, [to]);

  return <motion.span>{rounded}</motion.span>;
}

// ── GitHub contribution graph ──────────────────────────────────
function ContribGraph({ submissions }: { submissions?: { created_at?: string }[] }) {
  const today = new Date();
  // Build a set of active dates from submissions
  const activeDates = new Set<string>();
  (submissions ?? []).forEach(s => {
    if (s.created_at) {
      try {
        activeDates.add(new Date(s.created_at).toISOString().split('T')[0]);
      } catch {}
    }
  });

  // Generate 52 weeks × 7 days grid (like GitHub)
  const weeks: { date: string; level: number }[][] = [];
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 52 * 7 + 1);

  for (let w = 0; w < 52; w++) {
    const week: { date: string; level: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      const key = date.toISOString().split('T')[0];
      const active = activeDates.has(key);
      // Level 0-4 based on activity (mock for demo)
      const seed = (date.getDate() * 7 + date.getMonth() * 31) % 5;
      week.push({ date: key, level: active ? Math.max(2, seed) : (seed > 3 ? 1 : 0) });
    }
    weeks.push(week);
  }

  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const m = new Date(week[0].date).getMonth();
    if (m !== lastMonth) { monthLabels.push({ label: months[m], col: wi }); lastMonth = m; }
  });

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        {/* Month labels */}
        <div className="flex gap-[3px] mb-1 ml-[18px]">
          {weeks.map((_, wi) => {
            const lbl = monthLabels.find(m => m.col === wi);
            return <div key={wi} className="w-[12px] text-[9px] text-[var(--text-3)] font-mono shrink-0">{lbl?.label ?? ''}</div>;
          })}
        </div>
        <div className="flex gap-[3px]">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-1">
            {['Пн', '', 'Ср', '', 'Пт', '', 'Вс'].map((d, i) => (
              <div key={i} className="h-[12px] text-[9px] text-[var(--text-3)] leading-[12px] w-[14px] text-right">{d}</div>
            ))}
          </div>
          {/* Cells */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map(({ date, level }) => (
                <div
                  key={date}
                  className={`contrib-cell contrib-${level}`}
                  title={date}
                />
              ))}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-2 ml-[18px] text-[9px] text-[var(--text-3)]">
          <span>Меньше</span>
          {[0,1,2,3,4].map(l => <div key={l} className={`contrib-cell contrib-${l} flex-shrink-0`} />)}
          <span>Больше</span>
        </div>
      </div>
    </div>
  );
}

// ── StatCard ───────────────────────────────────────────────────
function StatCard({ value, label, icon: Icon, gradient, delay }: {
  value: number; label: string; icon: React.ElementType;
  gradient: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22,1,0.36,1] }}
      className="relative p-5 rounded-2xl border border-[var(--border)] overflow-hidden group card-glow"
      style={{ background: 'var(--surface)' }}
    >
      {/* Background glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: 'radial-gradient(circle at 50% 120%, rgba(124,58,237,0.06) 0%, transparent 70%)' }} />
      <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)' }} />

      <div className="relative flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon size={22} className="text-white" />
        </div>
        <div>
          <p className="text-2xl font-black text-[var(--text-1)] font-mono tabular-nums">
            <CountUp to={value} delay={delay * 1000 + 300} />
          </p>
          <p className="text-xs text-[var(--text-3)] mt-0.5">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Dashboard inner ─────────────────────────────────────────────
function DashboardInner() {
  const { user } = useAuthStore();

  const { data: submissions, isLoading: subsLoading, isError: subsError } = useQuery({
    queryKey: ['submissions', 'me'], queryFn: () => submissionsApi.me(0, 20), retry: false,
  });
  const { data: contests, isLoading: contestsLoading } = useQuery({
    queryKey: ['contests', 'upcoming'], queryFn: () => contestsApi.list({ limit: 3 }), retry: false,
  });
  const { data: ratings } = useQuery({
    queryKey: ['ratings', 'me'], queryFn: () => ratingsApi.me(0, 10), retry: false,
  });
  const { data: problems, isLoading: problemsLoading } = useQuery({
    queryKey: ['problems', 'list'], queryFn: () => problemsApi.list({ limit: 5 }), retry: false,
  });

  const accepted    = submissions?.filter(s => s.status === 'accepted').length ?? 0;
  const totalRating = ratings?.reduce((acc, r) => acc + (r.delta ?? 0), 1200) ?? 1200;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';

  function safeFormatDate(d?: string | null) {
    if (!d) return '—';
    try { return formatDistanceToNow(new Date(d), { addSuffix: true, locale: ru }); } catch { return '—'; }
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }} className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-[var(--text-1)]">
              {greeting},{' '}
              <span className="gradient-text">{user?.username ?? '...'}</span>{' '}👋
            </h1>
            <p className="text-[var(--text-3)] text-sm mt-1">Готов решать задачи сегодня?</p>
          </div>
          <div className="flex gap-2">
            <Link to="/problems">
              <Button icon={<Code2 size={15} />} size="sm" variant="outline">Задачи</Button>
            </Link>
            <Link to="/duels">
              <Button icon={<Swords size={15} />} size="sm">Дуэль</Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard value={accepted}               label="Решено задач"  icon={CheckCircle} gradient="from-emerald-500 to-teal-600"   delay={0}    />
        <StatCard value={totalRating}            label="Рейтинг"       icon={TrendingUp}  gradient="from-purple-500 to-violet-600"  delay={0.05} />
        <StatCard value={submissions?.length??0} label="Посылок всего" icon={Code2}       gradient="from-cyan-500 to-sky-600"       delay={0.1}  />
        <StatCard value={contests?.length??0}    label="Контестов"     icon={Trophy}      gradient="from-yellow-500 to-orange-500"  delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">

        {/* Recent submissions */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5, ease: [0.22,1,0.36,1] }}
          className="lg:col-span-2 flex flex-col gap-5"
        >
          <div className="rounded-2xl border border-[var(--border)] overflow-hidden" style={{ background: 'var(--surface)' }}>
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-1)] flex items-center gap-2">
                <Clock size={15} className="text-[var(--text-3)]" /> Последние посылки
              </h2>
              <Link to="/problems">
                <Button variant="ghost" size="sm" icon={<ArrowRight size={13} />}>Все задачи</Button>
              </Link>
            </div>
            {subsLoading ? (
              <div className="p-5 flex flex-col gap-3">{[1,2,3].map(i => <SkeletonLine key={i} className="w-full h-10" />)}</div>
            ) : subsError || !submissions?.length ? (
              <div className="py-12 text-center text-[var(--text-3)]">
                <Code2 size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">Посылок нет. <Link to="/problems" className="text-purple-400 hover:underline">Реши задачу!</Link></p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                <AnimatePresence>
                  {submissions.slice(0, 8).map((sub, i) => (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="px-5 py-3.5 flex items-center justify-between hover:bg-[var(--hover)] transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <StatusBadge status={sub.status} />
                        <div className="min-w-0">
                          <p className="text-sm text-[var(--text-1)] truncate font-mono">{(sub.problem_id ?? sub.id ?? '').slice(0, 8)}…</p>
                          <p className="text-xs text-[var(--text-3)]">{sub.language ?? '?'} · {safeFormatDate(sub.created_at)}</p>
                        </div>
                      </div>
                      {sub.time_ms != null && (
                        <span className="text-xs text-[var(--text-3)] font-mono shrink-0">{sub.time_ms}мс</span>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Contribution graph */}
          <div className="rounded-2xl border border-[var(--border)] p-5" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--text-1)] flex items-center gap-2">
                <Zap size={14} className="text-purple-400" /> Активность за год
              </h2>
              <span className="text-xs text-[var(--text-3)]">{accepted} решено</span>
            </div>
            <ContribGraph submissions={submissions} />
          </div>
        </motion.div>

        {/* Right column */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5, ease: [0.22,1,0.36,1] }}
          className="flex flex-col gap-4"
        >
          {/* Upcoming contests */}
          <div className="rounded-2xl border border-[var(--border)] overflow-hidden" style={{ background: 'var(--surface)' }}>
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-1)] flex items-center gap-2">
                <Trophy size={14} className="text-yellow-400" /> Ближайшие контесты
              </h2>
              <Link to="/contests"><Button variant="ghost" size="sm">Все</Button></Link>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {contestsLoading ? <SkeletonLine className="w-full h-14" /> :
               !contests?.length ? <p className="text-[var(--text-3)] text-sm text-center py-4">Нет контестов</p> :
               contests.map(c => (
                <Link key={c.id} to={`/contests/${c.slug ?? c.id}`}>
                  <div className="p-3 rounded-xl border border-[var(--border)] hover:border-purple-500/30 transition-all group cursor-pointer" style={{ background: 'var(--surface-2)' }}>
                    <p className="text-sm font-medium text-[var(--text-1)] group-hover:text-purple-400 transition-colors truncate">{c.title ?? 'Без названия'}</p>
                    <p className="text-xs text-[var(--text-3)] mt-0.5 font-mono">
                      {c.starts_at ? new Date(c.starts_at as unknown as string).toLocaleDateString('ru-RU') : '—'}
                    </p>
                  </div>
                </Link>
               ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-[var(--border)] overflow-hidden" style={{ background: 'var(--surface)' }}>
            <div className="p-4 border-b border-[var(--border)]">
              <h2 className="text-sm font-semibold text-[var(--text-1)]">Быстрый старт</h2>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {[
                { to: '/problems', icon: Code2, label: 'Решить задачу', color: 'text-purple-400' },
                { to: '/duels',    icon: Swords, label: 'Начать дуэль',  color: 'text-red-400'    },
                { to: '/ai-mentor',icon: Bot,    label: 'AI Наставник',  color: 'text-cyan-400'   },
                { to: '/training', icon: TrendingUp, label: 'Тренировка', color: 'text-emerald-400'},
              ].map(({ to, icon: Icon, label, color }) => (
                <Link key={to} to={to}>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--hover)] transition-colors group cursor-pointer">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color} bg-current/10`}>
                      <Icon size={14} className={color} />
                    </div>
                    <span className="text-sm text-[var(--text-2)] group-hover:text-[var(--text-1)] transition-colors">{label}</span>
                    <ArrowRight size={12} className="text-[var(--text-3)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recommended */}
          <div className="rounded-2xl border border-[var(--border)] overflow-hidden" style={{ background: 'var(--surface)' }}>
            <div className="p-4 border-b border-[var(--border)]">
              <h2 className="text-sm font-semibold text-[var(--text-1)]">Рекомендуем</h2>
            </div>
            <div className="p-4 flex flex-col gap-1.5">
              {problemsLoading ? <SkeletonLine className="w-full h-10" /> :
               !problems?.length ? <p className="text-[var(--text-3)] text-xs text-center py-3">Задач пока нет</p> :
               problems.slice(0, 4).map(p => (
                <Link key={p.id} to={`/problems/${p.slug ?? p.id}`}>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--hover)] transition-colors group cursor-pointer">
                    <p className="text-sm text-[var(--text-2)] group-hover:text-[var(--text-1)] transition-colors truncate flex-1 mr-2">{p.title ?? 'Задача'}</p>
                    <DifficultyBadge difficulty={p.difficulty ?? 'easy'} />
                  </div>
                </Link>
               ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <DashboardErrorBoundary>
      <DashboardInner />
    </DashboardErrorBoundary>
  );
}
