import { Component, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code2, Trophy, Swords, TrendingUp, CheckCircle, Clock,
  ArrowRight, AlertCircle, RefreshCw, Bot, BookOpen,
  Users, ChevronRight, Zap, Star,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { submissionsApi, contestsApi, ratingsApi, problemsApi, duelsApi } from '../api/endpoints';
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isLive(c: any) {
  const now = Date.now();
  const s = c.starts_at ? new Date(c.starts_at).getTime() : 0;
  const e = c.ends_at   ? new Date(c.ends_at).getTime()   : 0;
  return s > 0 && e > 0 && now >= s && now <= e;
}

// ── glass card ────────────────────────────────────────────────────
function GCard({ children, style, dark }: { children: ReactNode; style?: React.CSSProperties; dark: boolean }) {
  return (
    <div style={{
      background: dark ? 'rgba(6,12,28,0.65)' : 'rgba(255,255,255,0.96)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      borderRadius: 20, overflow: 'hidden', position: 'relative',
      transition: 'transform 0.2s', boxShadow: dark ? 'none' : '0 4px 24px rgba(0,0,0,0.07)',
      ...style,
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1, zIndex: 1,
        background: dark
          ? 'linear-gradient(90deg,transparent,rgba(96,165,250,0.35),rgba(245,158,11,0.2),transparent)'
          : 'linear-gradient(90deg,transparent,rgba(99,102,241,0.2),rgba(245,158,11,0.15),transparent)',
      }} />
      {children}
    </div>
  );
}

// ── verdict badge ─────────────────────────────────────────────────
const VERDICT: Record<string, [string, string, string]> = {
  accepted:      ['AC',  '#22c55e', 'rgba(34,197,94,0.14)'  ],
  wrong_answer:  ['WA',  '#ef4444', 'rgba(239,68,68,0.14)'  ],
  time_limit:    ['TLE', '#f59e0b', 'rgba(245,158,11,0.14)' ],
  memory_limit:  ['MLE', '#f59e0b', 'rgba(245,158,11,0.14)' ],
  runtime_error: ['RE',  '#ef4444', 'rgba(239,68,68,0.14)'  ],
  compile_error: ['CE',  '#818cf8', 'rgba(129,140,248,0.14)'],
  system_error:  ['SE',  '#ec4899', 'rgba(236,72,153,0.14)' ],
  pending:       ['···', '#64748b', 'rgba(100,116,139,0.12)'],
  running:       ['RUN', '#3b82f6', 'rgba(59,130,246,0.14)' ],
};
function VBadge({ status }: { status: string }) {
  const [label, color, bg] = VERDICT[status] ?? [status.slice(0,3).toUpperCase(), '#64748b', 'rgba(100,116,139,0.12)'];
  return <span style={{ fontSize: 11, fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.04em', padding: '3px 9px', borderRadius: 6, background: bg, color }}>{label}</span>;
}

// ── difficulty badge ──────────────────────────────────────────────
function DiffBadge({ difficulty }: { difficulty: string }) {
  const map: Record<string, [string, string]> = {
    easy:   ['#22c55e', 'rgba(34,197,94,0.12)'  ],
    medium: ['#f59e0b', 'rgba(245,158,11,0.12)' ],
    hard:   ['#ef4444', 'rgba(239,68,68,0.12)'  ],
  };
  const [color, bg] = map[difficulty?.toLowerCase()] ?? ['#64748b', 'rgba(100,116,139,0.1)'];
  const labels: Record<string, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: bg, color, whiteSpace: 'nowrap' }}>{labels[difficulty?.toLowerCase()] ?? difficulty}</span>;
}

// ── error boundary ────────────────────────────────────────────────
class ErrBound extends Component<{ children: ReactNode }, { err: boolean; msg: string }> {
  constructor(p: { children: ReactNode }) { super(p); this.state = { err: false, msg: '' }; }
  static getDerivedStateFromError(e: Error) { return { err: true, msg: e.message }; }
  render() {
    if (this.state.err) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, textAlign: 'center', padding: 32 }}>
        <AlertCircle size={40} color="#ef4444" />
        <p style={{ fontSize: 18, fontWeight: 600 }}>Ошибка загрузки</p>
        <p style={{ fontSize: 13, color: '#f87171', fontFamily: 'monospace', padding: '8px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{this.state.msg}</p>
        <button onClick={() => this.setState({ err: false, msg: '' })} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          <RefreshCw size={14} /> Попробовать снова
        </button>
      </div>
    );
    return this.props.children;
  }
}

// ── dashboard inner ───────────────────────────────────────────────
function DashboardInner() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const dark = theme === 'dark';

  // ── theme tokens ──
  const pageBg    = dark ? '#04080f'                : '#f1f5f9';
  const panelBg   = dark ? 'rgba(4,8,15,0.75)'     : 'rgba(255,255,255,0.94)';
  const panelBord = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)';
  const divBord   = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const t1        = dark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.88)';
  const t2        = dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
  const t3        = dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.32)';
  const itemBg    = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
  const itemBord  = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
  const rowHover  = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
  const skelBg    = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const eloCardBg = dark ? 'rgba(245,158,11,0.08)'  : 'rgba(245,158,11,0.07)';
  const ghostBg   = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const ghostBord = dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.1)';
  const accentLink = '#818cf8';

  const { data: submissions, isLoading: subsLoading, isError: subsError } = useQuery({
    queryKey: ['submissions', 'me'], queryFn: () => submissionsApi.me(0, 7), retry: false,
  });
  const { data: contests, isLoading: contestsLoading } = useQuery({
    queryKey: ['contests', 'list'], queryFn: () => contestsApi.list({ limit: 4 }), retry: false,
  });
  const { data: ratings } = useQuery({
    queryKey: ['ratings', 'me'], queryFn: () => ratingsApi.me(0, 20), retry: false,
  });
  const { data: problems, isLoading: problemsLoading } = useQuery({
    queryKey: ['problems', 'list'], queryFn: () => problemsApi.list({ limit: 6 }), retry: false,
  });
  const { data: myDuels } = useQuery({
    queryKey: ['duels', 'mine'], queryFn: () => duelsApi.mine(0, 50), retry: false,
  });

  const accepted    = submissions?.filter(s => s.status === 'accepted').length ?? 0;
  const totalRating = ratings?.reduce((acc, r) => acc + (r.delta ?? 0), 1200) ?? 1200;

  const now   = new Date();
  const hour  = now.getHours();
  const DAYS  = ['ВС','ПН','ВТ','СР','ЧТ','ПТ','СБ'];
  const MONS  = ['ЯНВ','ФЕВ','МАР','АПР','МАЙ','ИЮН','ИЮЛ','АВГ','СЕН','ОКТ','НОЯ','ДЕК'];
  const greet = hour < 12 ? 'ДОБРОЕ УТРО' : hour < 18 ? 'ДОБРЫЙ ДЕНЬ' : 'ДОБРЫЙ ВЕЧЕР';
  const dateLabel = `${greet} · ${DAYS[now.getDay()]}, ${now.getDate()} ${MONS[now.getMonth()]} ${now.getFullYear()}`;

  const STATS = [
    { label: 'Задач решено',  val: accepted,                 color: '#22c55e' },
    { label: 'Посылок всего', val: submissions?.length ?? 0,  color: '#818cf8' },
    { label: 'Контестов',     val: contests?.length ?? 0,     color: '#3b82f6' },
    { label: 'Дуэлей',        val: myDuels?.length ?? 0,      color: '#f59e0b' },
  ];

  const ACTIONS = [
    { to: '/problems',  icon: Code2,    grad: 'linear-gradient(135deg,#1d4ed8,#2563eb)', glow: 'rgba(29,78,216,0.45)', title: 'Задачи',     desc: 'Реши задачи и набирай очки'      },
    { to: '/duels',     icon: Swords,   grad: 'linear-gradient(135deg,#ef4444,#dc2626)', glow: 'rgba(239,68,68,0.45)',title: 'Дуэль 1v1',  desc: 'Сразись с соперником вживую'     },
    { to: '/ai-mentor', icon: Bot,      grad: 'linear-gradient(135deg,#f59e0b,#d97706)', glow: 'rgba(245,158,11,0.45)',title: 'AI Ментор',  desc: 'Получи подсказку от ИИ'          },
    { to: '/training',  icon: BookOpen, grad: 'linear-gradient(135deg,#22c55e,#16a34a)', glow: 'rgba(34,197,94,0.45)', title: 'Тренировки', desc: 'Планомерная прокачка навыков'    },
  ];

  const COMMUNITY = [
    { to: '/leaderboard', icon: TrendingUp, title: 'Рейтинг', desc: 'Посмотри своё место в таблице', color: '#f59e0b' },
    { to: '/friends',     icon: Users,      title: 'Друзья',   desc: 'Добавь друзей и соревнуйся',   color: '#22c55e' },
    { to: '/teams',       icon: Zap,        title: 'Команды',  desc: 'Вступи в команду или создай',  color: '#818cf8' },
  ];

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 56px)', background: pageBg }}>
      <BackgroundGraph noSphere light={!dark} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start' }}>

        {/* ── LEFT PANEL ── */}
        <motion.div
          initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          style={{
            width: 400, flexShrink: 0,
            position: 'sticky', top: 56,
            height: 'calc(100vh - 56px)',
            background: panelBg,
            backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
            borderRight: `1px solid ${panelBord}`,
            boxShadow: dark ? 'none' : '2px 0 20px rgba(0,0,0,0.06)',
            overflowY: 'auto', overflowX: 'hidden',
            display: 'flex', flexDirection: 'column',
            padding: '36px 28px',
          }}
        >
          {/* Avatar + name */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: 28, borderBottom: `1px solid ${divBord}`, marginBottom: 24 }}>
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              style={{
                width: 88, height: 88, borderRadius: '50%',
                background: 'linear-gradient(135deg,#1d4ed8,#f59e0b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, fontWeight: 900, color: '#fff',
                boxShadow: '0 0 40px rgba(99,102,241,0.45)',
                marginBottom: 16,
              }}
            >
              {user?.username?.[0]?.toUpperCase() ?? '?'}
            </motion.div>
            <p style={{ fontSize: 22, fontWeight: 900, color: t1, margin: '0 0 5px' }}>{user?.username ?? '...'}</p>
            <p style={{ fontSize: 12, color: t3, fontFamily: 'monospace', margin: 0 }}>@{user?.username ?? '...'} · Season 2026</p>
          </div>

          {/* ELO card */}
          <div style={{ background: eloCardBg, border: '1px solid rgba(245,158,11,0.22)', borderRadius: 16, padding: '18px 22px', marginBottom: 18 }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>Рейтинг ELO</p>
            <p style={{ fontSize: 42, fontWeight: 900, margin: 0, lineHeight: 1, background: 'linear-gradient(90deg,#fde68a,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{totalRating}</p>
          </div>

          {/* Stats list */}
          <div style={{ border: `1px solid ${divBord}`, borderRadius: 16, overflow: 'hidden', marginBottom: 22 }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderBottom: i < STATS.length - 1 ? `1px solid ${divBord}` : 'none' }}>
                <span style={{ fontSize: 13, color: t2 }}>{s.label}</span>
                <span style={{ fontSize: 17, fontWeight: 800, fontFamily: 'monospace', color: s.color }}>{s.val}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
            <Link to="/problems" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', boxShadow: '0 0 24px rgba(29,78,216,0.4)', border: 'none', borderRadius: 13, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 32px rgba(29,78,216,0.6)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(29,78,216,0.4)'; }}
              >Решить задачу <ArrowRight size={15} /></button>
            </Link>
            <Link to="/duels" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '11px', background: ghostBg, border: `1px solid ${ghostBord}`, borderRadius: 13, color: t1, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ghostBg; }}
              >Начать дуэль</button>
            </Link>
            <Link to="/ai-mentor" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '11px', background: ghostBg, border: `1px solid ${ghostBord}`, borderRadius: 13, color: t1, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ghostBg; }}
              >AI Наставник</button>
            </Link>
          </div>
        </motion.div>

        {/* ── RIGHT CONTENT ── */}
        <div style={{ flex: 1, padding: '40px 44px', minHeight: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Greeting */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.45 }}>
            <p style={{ fontSize: 11, fontFamily: 'monospace', color: t3, marginBottom: 8, letterSpacing: '0.06em' }}>{dateLabel}</p>
            <h1 style={{ fontSize: 34, fontWeight: 900, color: t1, margin: 0, lineHeight: 1.1 }}>
              Привет,{' '}
              <span style={{ background: 'linear-gradient(90deg,#f59e0b,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {user?.username ?? '...'}
              </span>
              {' '}👋
            </h1>
          </motion.div>

          {/* Submissions */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.45 }}>
            <GCard dark={dark}>
              <div style={{ padding: '18px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${divBord}` }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: t1 }}><Clock size={15} color={t3} /> Последние посылки</span>
                <Link to="/problems" style={{ fontSize: 12, fontWeight: 600, color: accentLink, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>Все задачи <ArrowRight size={11} /></Link>
              </div>
              {subsLoading ? (
                <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[1,2,3].map(i => <div key={i} style={{ height: 38, borderRadius: 10, background: skelBg }} />)}
                </div>
              ) : subsError || !submissions?.length ? (
                <div style={{ padding: '40px 22px', textAlign: 'center' }}>
                  <CheckCircle size={36} style={{ color: t3, margin: '0 auto 10px', display: 'block', opacity: 0.4 }} />
                  <p style={{ color: t3, fontSize: 14, marginBottom: 14 }}>Посылок пока нет</p>
                  <Link to="/problems" style={{ textDecoration: 'none' }}>
                    <button style={{ padding: '9px 20px', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Открыть задачи</button>
                  </Link>
                </div>
              ) : (
                <div>
                  {submissions.map((sub, i) => (
                    <motion.div key={sub.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.04 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 22px', borderBottom: i < submissions.length - 1 ? `1px solid ${divBord}` : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = rowHover; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                    >
                      <VBadge status={sub.status} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: t1, fontFamily: 'monospace', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {(sub.problem_id ?? sub.id ?? '').slice(0, 14)}…
                        </p>
                        <p style={{ fontSize: 11, color: t3, margin: '2px 0 0' }}>{sub.language ?? '?'} · {safeFromNow(sub.created_at)}</p>
                      </div>
                      {sub.time_ms != null && <span style={{ fontSize: 11, color: t3, fontFamily: 'monospace', flexShrink: 0 }}>{sub.time_ms}ms</span>}
                    </motion.div>
                  ))}
                </div>
              )}
            </GCard>
          </motion.div>

          {/* Two-column: Contests + Actions */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26, duration: 0.45 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

            <GCard dark={dark}>
              <div style={{ padding: '18px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${divBord}` }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: t1 }}><Trophy size={14} color="#fbbf24" /> Контесты</span>
                <Link to="/contests" style={{ fontSize: 12, fontWeight: 600, color: accentLink, textDecoration: 'none' }}>Все</Link>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {contestsLoading ? <div style={{ height: 60, borderRadius: 10, background: skelBg }} /> : !contests?.length ? (
                  <p style={{ fontSize: 13, color: t3, textAlign: 'center', padding: '16px 0' }}>Нет контестов</p>
                ) : contests.map(c => (
                  <Link key={c.id} to={`/contests/${c.slug ?? c.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ padding: '10px 12px', borderRadius: 11, background: itemBg, border: `1px solid ${itemBord}`, transition: 'background 0.2s, border-color 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.35)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = itemBord; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: t1, margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title ?? 'Контест'}</p>
                        {isLive(c) && <span style={{ fontSize: 9, fontWeight: 800, color: '#22c55e', background: 'rgba(34,197,94,0.12)', padding: '2px 7px', borderRadius: 4, letterSpacing: '0.06em', flexShrink: 0 }}>LIVE</span>}
                      </div>
                      <p style={{ fontSize: 11, color: t3, margin: 0, fontFamily: 'monospace' }}>{safeDate(c.starts_at)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </GCard>

            <GCard dark={dark}>
              <div style={{ padding: '18px 22px 14px', borderBottom: `1px solid ${divBord}` }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: t1 }}><Star size={14} color="#818cf8" /> Действия</span>
              </div>
              <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column' }}>
                {ACTIONS.map(a => (
                  <Link key={a.to} to={a.to} style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, transition: 'background 0.15s, transform 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = rowHover; (e.currentTarget as HTMLDivElement).style.transform = 'translateX(4px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; (e.currentTarget as HTMLDivElement).style.transform = 'translateX(0)'; }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: a.grad, boxShadow: `0 0 14px ${a.glow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <a.icon size={16} color="#fff" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: t1, margin: 0 }}>{a.title}</p>
                        <p style={{ fontSize: 11, color: t3, margin: '2px 0 0' }}>{a.desc}</p>
                      </div>
                      <ChevronRight size={14} color={t3} />
                    </div>
                  </Link>
                ))}
              </div>
            </GCard>
          </motion.div>

          {/* Recommended problems */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34, duration: 0.45 }}>
            <GCard dark={dark}>
              <div style={{ padding: '18px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${divBord}` }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: t1 }}><Code2 size={14} color="#818cf8" /> Рекомендуемые задачи</span>
                <Link to="/problems" style={{ fontSize: 12, fontWeight: 600, color: accentLink, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>Все задачи <ArrowRight size={11} /></Link>
              </div>
              <div style={{ padding: '14px 18px' }}>
                {problemsLoading ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[1,2,3,4].map(i => <div key={i} style={{ height: 60, borderRadius: 12, background: skelBg }} />)}
                  </div>
                ) : !problems?.length ? (
                  <p style={{ fontSize: 13, color: t3, textAlign: 'center', padding: '16px 0' }}>Задач пока нет</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {problems.slice(0, 6).map(p => (
                      <Link key={p.id} to={`/problems/${p.slug ?? p.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{ padding: '12px 14px', borderRadius: 13, background: itemBg, border: `1px solid ${itemBord}`, transition: 'background 0.2s, transform 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = rowHover; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = itemBg; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: t1, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{p.title ?? 'Задача'}</p>
                            <DiffBadge difficulty={p.difficulty ?? 'easy'} />
                          </div>
                          <p style={{ fontSize: 11, color: t3, margin: 0 }}>{(p as { topic?: string }).topic ?? 'Алгоритмы'}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </GCard>
          </motion.div>

          {/* Community strip */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42, duration: 0.45 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {COMMUNITY.map(c => (
              <Link key={c.to} to={c.to} style={{ textDecoration: 'none' }}>
                <GCard dark={dark} style={{ cursor: 'pointer' }}>
                  <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}
                    onMouseEnter={e => { (e.currentTarget.parentElement as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
                    onMouseLeave={e => { (e.currentTarget.parentElement as HTMLDivElement).style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c.color}1a`, border: `1px solid ${c.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <c.icon size={20} color={c.color} />
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: t1, margin: '0 0 4px' }}>{c.title}</p>
                      <p style={{ fontSize: 12, color: t3, margin: 0, lineHeight: 1.5 }}>{c.desc}</p>
                    </div>
                    <ArrowRight size={14} color={t3} />
                  </div>
                </GCard>
              </Link>
            ))}
          </motion.div>

        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  return <ErrBound><DashboardInner /></ErrBound>;
}
