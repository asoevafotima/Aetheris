import { Component, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code2, Trophy, Swords, TrendingUp, CheckCircle, Clock,
  ArrowRight, AlertCircle, RefreshCw, Bot, Target,
  Users, Play,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { submissionsApi, contestsApi, ratingsApi, problemsApi } from '../api/endpoints';
import { BackgroundGraph } from '../components/BackgroundGraph';
import { formatDistanceToNow } from 'date-fns';

// ── helpers ───────────────────────────────────────────────────────
function safeFromNow(d?: string | null) {
  if (!d) return '—';
  try { const x = new Date(d); return isNaN(x.getTime()) ? '—' : formatDistanceToNow(x, { addSuffix: true }); }
  catch { return '—'; }
}
function safeDate(d?: string | null) {
  if (!d) return '—';
  try { const x = new Date(d); return isNaN(x.getTime()) ? '—' : x.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }); }
  catch { return '—'; }
}
function todayStr() {
  return new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер';
}

// ── verdict badge ─────────────────────────────────────────────────
const VERDICT: Record<string, { label: string; color: string; bg: string }> = {
  accepted:      { label: 'AC',  color: '#22c55e', bg: 'rgba(34,197,94,0.12)'   },
  wrong_answer:  { label: 'WA',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
  time_limit:    { label: 'TLE', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  memory_limit:  { label: 'MLE', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  runtime_error: { label: 'RE',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
  compile_error: { label: 'CE',  color: '#818cf8', bg: 'rgba(99,102,241,0.12)'  },
  system_error:  { label: 'SE',  color: '#ec4899', bg: 'rgba(236,72,153,0.12)'  },
  pending:       { label: '···', color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
  running:       { label: 'RUN', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
};
function VerdictBadge({ status }: { status: string }) {
  const v = VERDICT[status] ?? { label: status.slice(0, 3).toUpperCase(), color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' };
  return (
    <span style={{ fontSize: 11, fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.04em', padding: '3px 8px', borderRadius: 6, background: v.bg, color: v.color, flexShrink: 0 }}>
      {v.label}
    </span>
  );
}

// ── diff badge ────────────────────────────────────────────────────
const DIFF: Record<string, { label: string; color: string; bg: string }> = {
  easy:   { label: 'Easy',   color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  hard:   { label: 'Hard',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
};
function DiffBadge({ difficulty }: { difficulty: string }) {
  const d = DIFF[difficulty?.toLowerCase()] ?? { label: difficulty, color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: d.bg, color: d.color, whiteSpace: 'nowrap' }}>
      {d.label}
    </span>
  );
}

// ── glass card ────────────────────────────────────────────────────
const GLASS: React.CSSProperties = {
  background: 'rgba(6,12,28,0.60)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20,
  position: 'relative',
  overflow: 'hidden',
};
// top shimmer line
function GlassCard({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ ...GLASS, ...style }}>
      {/* top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(96,165,250,0.3),rgba(245,158,11,0.2),transparent)', borderRadius: '20px 20px 0 0' }} />
      {children}
    </div>
  );
}

// ── action row ────────────────────────────────────────────────────
function ActionRow({ to, icon, label, desc }: { to: string; icon: ReactNode; label: string; desc?: string }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px', borderRadius: 11, border: '1px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.background = 'rgba(37,99,235,0.07)';
          el.style.borderColor = 'rgba(59,130,246,0.18)';
          el.style.transform = 'translateX(3px)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.background = '';
          el.style.borderColor = 'transparent';
          el.style.transform = '';
        }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,0.88)', margin: 0 }}>{label}</p>
          {desc && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', margin: '1px 0 0' }}>{desc}</p>}
        </div>
        <ArrowRight size={14} style={{ color: 'rgba(255,255,255,0.16)', transition: 'color 0.2s', flexShrink: 0 }} />
      </div>
    </Link>
  );
}

// ── error boundary ────────────────────────────────────────────────
class DashboardErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  constructor(props: { children: ReactNode }) { super(props); this.state = { hasError: false, message: '' }; }
  static getDerivedStateFromError(err: Error) { return { hasError: true, message: err.message }; }
  render() {
    if (this.state.hasError) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, padding: 32, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <AlertCircle size={40} color="#ef4444" />
        <p style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: 18 }}>Ошибка загрузки дашборда</p>
        <p style={{ color: '#f87171', fontSize: 13, fontFamily: 'monospace', padding: '8px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{this.state.message}</p>
        <button onClick={() => this.setState({ hasError: false, message: '' })} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', border: 'none', borderRadius: 9, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          <RefreshCw size={14} /> Попробовать снова
        </button>
      </div>
    );
    return this.props.children;
  }
}

// ── main dashboard ────────────────────────────────────────────────
function DashboardInner() {
  const { user } = useAuthStore();

  const { data: submissions, isLoading: subsLoading, isError: subsError } = useQuery({
    queryKey: ['submissions', 'me'],
    queryFn: () => submissionsApi.me(0, 10),
    retry: false,
  });
  const { data: contests, isLoading: contestsLoading } = useQuery({
    queryKey: ['contests', 'upcoming'],
    queryFn: () => contestsApi.list({ limit: 5 }),
    retry: false,
  });
  const { data: ratings } = useQuery({
    queryKey: ['ratings', 'me'],
    queryFn: () => ratingsApi.me(0, 10),
    retry: false,
  });
  const { data: problems } = useQuery({
    queryKey: ['problems', 'list'],
    queryFn: () => problemsApi.list({ limit: 5 }),
    retry: false,
  });

  const accepted    = submissions?.filter(s => s.status === 'accepted').length ?? 0;
  const totalRating = ratings?.reduce((acc, r) => acc + (r.delta ?? 0), 1200) ?? 1200;
  const initials    = (user?.username ?? '?').charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', position: 'relative' }}>
      {/* Subtle background animation */}
      <BackgroundGraph noSphere subtle />

      {/* Layout */}
      <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '300px 1fr', minHeight: 'calc(100vh - 56px)' }}>

        {/* ── Left panel ── */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'rgba(4,8,15,0.55)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            borderRight: '1px solid rgba(255,255,255,0.07)',
            padding: '36px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
            position: 'sticky',
            top: 56,
            height: 'calc(100vh - 56px)',
            overflowY: 'auto',
          }}>

          {/* Avatar + name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg,#1d4ed8,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#fff', boxShadow: '0 0 0 3px rgba(37,99,235,0.2), 0 0 28px rgba(29,78,216,0.28)' }}>
              {initials}
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.025em', margin: 0 }}>{user?.username ?? '...'}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', fontFamily: 'monospace', marginTop: 3 }}>@{user?.username ?? '...'} · Сезон 2026</p>
            </div>
          </div>

          {/* Rating ELO card */}
          <div style={{ padding: '16px 18px', borderRadius: 16, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,rgba(245,158,11,0.5),rgba(253,230,138,0.3),transparent)' }} />
            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(253,230,138,0.4)', letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 6 }}>Рейтинг ELO</p>
            <p style={{ fontSize: 44, fontWeight: 900, color: '#fde68a', fontFamily: 'monospace', letterSpacing: '-0.04em', lineHeight: 1, margin: 0 }}>{totalRating}</p>
          </div>

          {/* Stats list */}
          <div style={{ borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            {[
              { label: 'Задач решено',  value: accepted,                color: '#93c5fd' },
              { label: 'Посылок всего', value: submissions?.length ?? 0, color: '#c4b5fd' },
              { label: 'Контестов',     value: contests?.length ?? 0,   color: '#67e8f9' },
              { label: 'Дуэлей',        value: 0,                        color: '#f87171' },
            ].map(({ label, value, color }, i, arr) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 15px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{label}</span>
                <span style={{ fontSize: 17, fontWeight: 700, fontFamily: 'monospace', color }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Link to="/problems" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif', boxShadow: '0 0 20px rgba(29,78,216,0.28)', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 32px rgba(29,78,216,0.5)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(29,78,216,0.28)'; }}>
                Решить задачу →
              </button>
            </Link>
            <Link to="/duels" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '10px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)'; }}>
                Начать дуэль
              </button>
            </Link>
            <Link to="/ai-mentor" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '10px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)'; }}>
                AI Наставник
              </button>
            </Link>
          </div>
        </motion.div>

        {/* ── Right content ── */}
        <div style={{ padding: '40px 44px', display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Greeting */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(147,197,253,0.4)', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 8 }}>
              {greeting()} · {todayStr()}
            </p>
            <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.88)' }}>Привет, </span>
              <span style={{ background: 'linear-gradient(135deg,#fde68a,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {user?.username ?? '...'}
              </span>
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.28)', lineHeight: 1.65, margin: 0 }}>Готов решать задачи и побеждать сегодня?</p>
          </motion.div>

          {/* Submissions card */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.45 }}>
            <GlassCard>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.88)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={14} color="rgba(255,255,255,0.3)" /> Последние посылки
                </span>
                <Link to="/problems" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#93c5fd'; }}>
                  Все задачи <ArrowRight size={11} />
                </Link>
              </div>

              {subsLoading ? (
                <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  ))}
                </div>
              ) : subsError || !submissions?.length ? (
                <div style={{ padding: '44px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 10 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                    <Code2 size={22} color="rgba(255,255,255,0.2)" />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)', margin: 0 }}>Нет посылок</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0 }}>Начни решать задачи — все результаты появятся здесь.</p>
                  <Link to="/problems" style={{ textDecoration: 'none', marginTop: 6 }}>
                    <button style={{ padding: '9px 22px', borderRadius: 8, background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 0 18px rgba(29,78,216,0.3)', transition: 'all 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 28px rgba(29,78,216,0.5)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 18px rgba(29,78,216,0.3)'; }}>
                      Открыть задачи
                    </button>
                  </Link>
                </div>
              ) : (
                <div>
                  {submissions.map((sub, i) => (
                    <motion.div key={sub.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.04 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 22px', borderBottom: i < submissions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.15s', cursor: 'default' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ''; }}>
                      <VerdictBadge status={sub.status} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.82)', fontFamily: 'monospace', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {(sub.problem_id ?? sub.id ?? '').slice(0, 18)}…
                        </p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '2px 0 0', fontFamily: 'monospace' }}>
                          {sub.language ?? '?'} · {safeFromNow(sub.created_at)}
                        </p>
                      </div>
                      {sub.time_ms != null && (
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', fontFamily: 'monospace', flexShrink: 0 }}>{sub.time_ms}ms</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Two-column row: Contests + Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Contests */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.45 }}>
              <GlassCard style={{ height: '100%' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.88)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Trophy size={14} color="#fbbf24" /> Контесты
                  </span>
                  <Link to="/contests" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#93c5fd'; }}>
                    Все →
                  </Link>
                </div>
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {contestsLoading ? (
                    <div style={{ height: 60, borderRadius: 10, background: 'rgba(255,255,255,0.04)' }} />
                  ) : !contests?.length ? (
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '20px 0', margin: 0 }}>Нет предстоящих контестов</p>
                  ) : contests.map(c => (
                    <Link key={c.id} to={`/contests/${c.slug ?? c.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ padding: '11px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', transition: 'all 0.15s', cursor: 'pointer' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(59,130,246,0.2)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(37,99,235,0.05)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)'; }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 8 }}>{c.title ?? 'Без названия'}</p>
                          {/* live badge if recent */}
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.18)', padding: '2px 7px', borderRadius: 5, flexShrink: 0 }}>
                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                            LIVE
                          </span>
                        </div>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', margin: 0, fontFamily: 'monospace' }}>{safeDate(c.starts_at)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Actions */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.45 }}>
              <GlassCard style={{ height: '100%' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(147,197,253,0.35)', letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: 'monospace', margin: 0 }}>Действия</p>
                </div>
                <div style={{ padding: '10px 10px', display: 'flex', flexDirection: 'column' }}>
                  <ActionRow to="/problems"  icon={<Code2 size={16} color="rgba(255,255,255,0.55)" />} label="Задачи"     desc="800+ задач на Python и C++" />
                  <ActionRow to="/duels"     icon={<Swords size={16} color="rgba(255,255,255,0.55)" />} label="Дуэль 1v1"  desc="Сразись с соперником" />
                  <ActionRow to="/ai-mentor" icon={<Bot size={16} color="rgba(255,255,255,0.55)" />}    label="AI Ментор"  desc="Подсказки и разбор кода" />
                  <ActionRow to="/training"  icon={<Play size={16} color="rgba(255,255,255,0.55)" />}   label="Тренировки" desc="Персональный план" />
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Recommended problems */}
          {(problems?.length ?? 0) > 0 && (
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.45 }}>
              <GlassCard>
                <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Target size={14} color="#818cf8" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.88)' }}>Рекомендуемые задачи</span>
                </div>
                <div style={{ padding: '10px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  {problems!.map(p => (
                    <Link key={p.id} to={`/problems/${p.slug ?? p.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 10px', borderRadius: 10, transition: 'background 0.15s', cursor: 'pointer' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ''; }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.78)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 8 }}>{p.title ?? 'Задача'}</p>
                        <DiffBadge difficulty={p.difficulty ?? 'easy'} />
                      </div>
                    </Link>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Community quick links */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44, duration: 0.45 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { to: '/leaderboard', icon: <TrendingUp size={15} color="#fbbf24" />, label: 'Рейтинг',   desc: 'Таблица лидеров',  border: 'rgba(251,191,36,0.2)', bg: 'rgba(245,158,11,0.06)' },
                { to: '/friends',     icon: <Users size={15} color="#93c5fd" />,      label: 'Друзья',    desc: 'Подписки и друзья', border: 'rgba(147,197,253,0.2)', bg: 'rgba(96,165,250,0.06)' },
                { to: '/teams',       icon: <CheckCircle size={15} color="#4ade80" />,label: 'Команды',   desc: 'Командные битвы',   border: 'rgba(74,222,128,0.2)', bg: 'rgba(34,197,94,0.06)' },
              ].map(({ to, icon, label, desc, border, bg }) => (
                <Link key={to} to={to} style={{ textDecoration: 'none', flex: 1 }}>
                  <div style={{ padding: '14px 16px', borderRadius: 14, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; }}>
                    {icon}
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.82)', margin: 0 }}>{label}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', margin: '2px 0 0' }}>{desc}</p>
                    </div>
                    <ArrowRight size={13} style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.18)' }} />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

        </div>
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
