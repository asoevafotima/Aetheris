import { Component, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import {
  Code2, Trophy, Swords, TrendingUp, CheckCircle2,
  Clock, ArrowUpRight, AlertCircle, RefreshCw,
  Zap, Bot, Flame, Target,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { submissionsApi, contestsApi, ratingsApi, problemsApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';
import { StatusBadge, DifficultyBadge } from '../components/ui/Badge';
import { SkeletonLine } from '../components/ui/Spinner';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

class ErrBound extends Component<{ children: ReactNode }, { err: boolean; msg: string }> {
  constructor(p: { children: ReactNode }) { super(p); this.state = { err: false, msg: '' }; }
  static getDerivedStateFromError(e: Error) { return { err: true, msg: e.message }; }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <AlertCircle size={40} className="text-red-400" />
        <Button icon={<RefreshCw size={13} />} onClick={() => this.setState({ err: false, msg: '' })}>Retry</Button>
      </div>
    );
  }
}

function CountUp({ to, delay = 0 }: { to: number; delay?: number }) {
  const v = useMotionValue(0);
  const d = useTransform(v, n => Math.round(n).toLocaleString());
  useEffect(() => {
    const t = setTimeout(() => animate(v, to, { duration: 1.4, ease: 'easeOut' }), delay);
    return () => clearTimeout(t);
  }, [to]);
  return <motion.span>{d}</motion.span>;
}

function ContribGraph({ submissions }: { submissions?: { created_at?: string; status?: string }[] }) {
  const active = new Set<string>();
  (submissions ?? []).forEach(s => {
    if (s.created_at) try { active.add(new Date(s.created_at).toISOString().split('T')[0]); } catch { /* */ }
  });
  const weeks: { date: string; level: number }[][] = [];
  const start = new Date(); start.setDate(start.getDate() - 52 * 7 + 1);
  for (let w = 0; w < 52; w++) {
    const wk: typeof weeks[0] = [];
    for (let d2 = 0; d2 < 7; d2++) {
      const dt = new Date(start); dt.setDate(start.getDate() + w * 7 + d2);
      const key = dt.toISOString().split('T')[0];
      const seed = (dt.getDate() * 7 + dt.getMonth() * 31) % 5;
      wk.push({ date: key, level: active.has(key) ? Math.max(2, seed) : seed > 3 ? 1 : 0 });
    }
    weeks.push(wk);
  }
  const MN = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
  const labels: { l: string; c: number }[] = []; let last = -1;
  weeks.forEach((wk, wi) => { const m = new Date(wk[0].date).getMonth(); if (m !== last) { labels.push({ l: MN[m], c: wi }); last = m; } });
  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        <div className="flex gap-[3px] mb-1 ml-5">
          {weeks.map((_, wi) => { const lb = labels.find(l => l.c === wi); return <div key={wi} className="w-[11px] text-[8px] shrink-0" style={{ color: 'var(--t3)' }}>{lb?.l ?? ''}</div>; })}
        </div>
        <div className="flex gap-[3px]">
          <div className="flex flex-col gap-[3px] mr-1.5">
            {['Пн','','Ср','','Пт','','Вс'].map((d3, i) => <div key={i} className="h-[11px] text-[8px] leading-[11px] w-[14px] text-right" style={{ color: 'var(--t3)' }}>{d3}</div>)}
          </div>
          {weeks.map((wk, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {wk.map(({ date, level }) => (
                <motion.div key={date} whileHover={{ scale: 1.5 }} transition={{ duration: 0.1 }}
                  className={`cg-cell cg-${level}`} title={date} />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 mt-2 ml-5 text-[8px]" style={{ color: 'var(--t3)' }}>
          <span>Меньше</span>
          {[0,1,2,3,4].map(l => <div key={l} className={`cg-cell cg-${l} shrink-0`} />)}
          <span>Больше</span>
        </div>
      </div>
    </div>
  );
}

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.5, ease: 'easeOut' as const } }),
};

function Inner() {
  const { user } = useAuthStore();
  const { data: subs, isLoading: sl, isError: se } = useQuery({ queryKey: ['submissions','me'], queryFn: () => submissionsApi.me(0, 20), retry: false });
  const { data: contests } = useQuery({ queryKey: ['contests','upcoming'], queryFn: () => contestsApi.list({ limit: 4 }), retry: false });
  const { data: ratings } = useQuery({ queryKey: ['ratings','me'], queryFn: () => ratingsApi.me(0, 10), retry: false });
  const { data: problems } = useQuery({ queryKey: ['problems','list'], queryFn: () => problemsApi.list({ limit: 5 }), retry: false });

  const accepted = subs?.filter(s => s.status === 'accepted').length ?? 0;
  const rating   = ratings?.reduce((a, r) => a + (r.delta ?? 0), 1200) ?? 1200;
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер';

  function fmtDate(d?: string | null) {
    if (!d) return '—';
    try { return formatDistanceToNow(new Date(d), { addSuffix: true, locale: ru }); } catch { return '—'; }
  }

  const STATS = [
    { value: accepted,        label: 'Решено задач',  Icon: CheckCircle2, from: '#10b981', to: '#059669' },
    { value: rating,          label: 'Рейтинг',       Icon: TrendingUp,   from: '#6366f1', to: '#8b5cf6' },
    { value: subs?.length ?? 0, label: 'Посылок',     Icon: Code2,        from: '#06b6d4', to: '#0284c7' },
    { value: contests?.length ?? 0, label: 'Контестов', Icon: Trophy,     from: '#f59e0b', to: '#d97706' },
  ];

  const QUICK = [
    { to: '/problems',  Icon: Code2,   label: 'Решить задачу', sub: 'Новая задача',   color: '#818cf8' },
    { to: '/duels',     Icon: Swords,  label: 'Дуэль',        sub: '1 на 1',         color: '#f87171' },
    { to: '/contests',  Icon: Trophy,  label: 'Контесты',     sub: 'Соревнования',   color: '#fbbf24' },
    { to: '/ai-mentor', Icon: Bot,     label: 'AI Ментор',    sub: 'Помощь AI',      color: '#22d3ee' },
    { to: '/training',  Icon: Target,  label: 'Тренировка',   sub: 'Практика',       color: '#86efac' },
    { to: '/leaderboard',Icon: Flame,  label: 'Рейтинг',      sub: 'Лидерборд',      color: '#fb923c' },
  ];

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Background accent */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', zIndex: 0 }} />

      <div className="relative max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mb-9">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-1.5" style={{ color: 'var(--t3)' }}>
                {greeting}
              </p>
              <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--t1)', letterSpacing: '-0.03em' }}>
                {user?.username ?? '...'} 👋
              </h1>
              <p className="text-sm mt-1.5" style={{ color: 'var(--t3)' }}>Готов к новым достижениям?</p>
            </div>
          </div>
        </motion.div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map(({ value, label, Icon, from, to: toColor }, i) => (
            <motion.div key={label} custom={i} variants={CARD_VARIANTS} initial="hidden" animate="show"
              className="relative rounded-2xl p-5 overflow-hidden cursor-default group"
              style={{ background: 'var(--s0)', border: '1px solid var(--b0)' }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              {/* Gradient bg glow */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-15 group-hover:opacity-25 transition-opacity blur-2xl"
                style={{ background: `radial-gradient(circle, ${from}, ${toColor})` }} />
              <div className="relative flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${from}, ${toColor})`, boxShadow: `0 4px 12px ${from}40` }}>
                  <Icon size={17} className="text-white" />
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--t3)' }}>{label}</span>
              </div>
              <div className="text-3xl font-black tracking-tight" style={{ color: 'var(--t1)', letterSpacing: '-0.02em' }}>
                <CountUp to={value} delay={i * 100 + 400} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Main grid ── */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">

          {/* Left */}
          <div className="flex flex-col gap-6">

            {/* Quick actions */}
            <motion.div custom={4} variants={CARD_VARIANTS} initial="hidden" animate="show"
              className="rounded-2xl overflow-hidden" style={{ background: 'var(--s0)', border: '1px solid var(--b0)' }}>
              <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--b0)' }}>
                <Zap size={14} style={{ color: '#818cf8' }} />
                <span className="text-[13px] font-semibold" style={{ color: 'var(--t1)' }}>Быстрый старт</span>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {QUICK.map(({ to, Icon, label, sub, color }) => (
                  <Link key={to} to={to}>
                    <motion.div
                      whileHover={{ y: -3, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col gap-2.5 p-4 rounded-2xl cursor-pointer group"
                      style={{ background: 'var(--s1)', border: '1px solid var(--b0)' }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                        <Icon size={18} style={{ color }} />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold" style={{ color: 'var(--t1)' }}>{label}</p>
                        <p className="text-[11px]" style={{ color: 'var(--t3)' }}>{sub}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Recent submissions */}
            <motion.div custom={5} variants={CARD_VARIANTS} initial="hidden" animate="show"
              className="rounded-2xl overflow-hidden" style={{ background: 'var(--s0)', border: '1px solid var(--b0)' }}>
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--b0)' }}>
                <div className="flex items-center gap-2">
                  <Clock size={14} style={{ color: 'var(--t3)' }} />
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--t1)' }}>Последние посылки</span>
                </div>
                <Link to="/problems">
                  <button className="flex items-center gap-1 text-[12px] font-medium transition-colors cursor-pointer"
                    style={{ color: 'var(--ac)' }}>
                    Все задачи <ArrowUpRight size={12} />
                  </button>
                </Link>
              </div>
              {sl ? (
                <div className="p-5 flex flex-col gap-3">{[1,2,3].map(i => <SkeletonLine key={i} className="w-full h-12" />)}</div>
              ) : se || !subs?.length ? (
                <div className="py-14 text-center" style={{ color: 'var(--t3)' }}>
                  <Code2 size={28} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Посылок нет. <Link to="/problems" className="text-indigo-400 hover:underline">Реши задачу!</Link></p>
                </div>
              ) : (
                <div>
                  <AnimatePresence>
                    {subs.slice(0, 7).map((sub, i) => (
                      <motion.div key={sub.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center justify-between px-5 py-3.5 border-b last:border-0 transition-colors"
                        style={{ borderColor: 'var(--b0)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--hv)')}
                        onMouseLeave={e => (e.currentTarget.style.background = '')}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <StatusBadge status={sub.status} />
                          <div className="min-w-0">
                            <p className="text-[13px] font-mono truncate" style={{ color: 'var(--t1)' }}>
                              {(sub.problem_id ?? sub.id ?? '').slice(0, 8)}…
                            </p>
                            <p className="text-[11px]" style={{ color: 'var(--t3)' }}>
                              {sub.language ?? '?'} · {fmtDate(sub.created_at)}
                            </p>
                          </div>
                        </div>
                        {sub.time_ms != null && (
                          <span className="text-[11px] font-mono shrink-0" style={{ color: 'var(--t3)' }}>{sub.time_ms}мс</span>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>

            {/* Contribution graph */}
            <motion.div custom={6} variants={CARD_VARIANTS} initial="hidden" animate="show"
              className="rounded-2xl overflow-hidden" style={{ background: 'var(--s0)', border: '1px solid var(--b0)' }}>
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--b0)' }}>
                <div className="flex items-center gap-2">
                  <Zap size={14} style={{ color: '#818cf8' }} />
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--t1)' }}>Активность за год</span>
                </div>
                <span className="text-[12px]" style={{ color: 'var(--t3)' }}>{accepted} решено</span>
              </div>
              <div className="p-5"><ContribGraph submissions={subs} /></div>
            </motion.div>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-5">

            {/* Upcoming contests */}
            <motion.div custom={7} variants={CARD_VARIANTS} initial="hidden" animate="show"
              className="rounded-2xl overflow-hidden" style={{ background: 'var(--s0)', border: '1px solid var(--b0)' }}>
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--b0)' }}>
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-amber-400" />
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--t1)' }}>Контесты</span>
                </div>
                <Link to="/contests">
                  <button className="text-[12px] font-medium transition-colors cursor-pointer" style={{ color: 'var(--ac)' }}>Все</button>
                </Link>
              </div>
              <div className="p-4 flex flex-col gap-2">
                {!contests?.length ? (
                  <p className="text-[13px] text-center py-5" style={{ color: 'var(--t3)' }}>Нет контестов</p>
                ) : contests.map(c => (
                  <Link key={c.id} to={`/contests/${c.slug ?? c.id}`}>
                    <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.15 }}
                      className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all"
                      style={{ background: 'var(--s1)', border: '1px solid var(--b0)' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(129,140,248,0.3)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--b0)')}>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium truncate" style={{ color: 'var(--t1)' }}>{c.title}</p>
                        <p className="text-[11px] font-mono" style={{ color: 'var(--t3)' }}>
                          {c.starts_at ? new Date(c.starts_at as unknown as string).toLocaleDateString('ru-RU') : '—'}
                        </p>
                      </div>
                      <ArrowUpRight size={14} style={{ color: 'var(--t3)' }} className="shrink-0 ml-2" />
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Recommended problems */}
            <motion.div custom={8} variants={CARD_VARIANTS} initial="hidden" animate="show"
              className="rounded-2xl overflow-hidden" style={{ background: 'var(--s0)', border: '1px solid var(--b0)' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--b0)' }}>
                <span className="text-[13px] font-semibold" style={{ color: 'var(--t1)' }}>Рекомендуем</span>
              </div>
              <div className="p-4 flex flex-col gap-1.5">
                {!problems?.length ? (
                  <p className="text-[13px] text-center py-4" style={{ color: 'var(--t3)' }}>Задач нет</p>
                ) : problems.slice(0, 5).map(p => (
                  <Link key={p.id} to={`/problems/${p.slug ?? p.id}`}>
                    <div className="flex items-center justify-between p-2.5 rounded-xl transition-colors cursor-pointer"
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--hv)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      <p className="text-[13px] truncate flex-1 mr-2" style={{ color: 'var(--t2)' }}>{p.title}</p>
                      <DifficultyBadge difficulty={p.difficulty ?? 'easy'} />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() { return <ErrBound><Inner /></ErrBound>; }
