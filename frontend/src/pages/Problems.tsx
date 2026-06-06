import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Code2, Bookmark, BookmarkCheck, Plus, LayoutGrid,
  LayoutList, CheckCircle, Zap, Trophy, ChevronRight, Filter, X,
} from 'lucide-react';
import { problemsApi, bookmarksApi } from '../api/endpoints';
import { useAuthStore }  from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { BackgroundGraph } from '../components/BackgroundGraph';
import type { ProblemShort } from '../types';

const TOPICS = [
  'Массивы','Строки','Математика','Сортировка','Поиск',
  'Динамическое программирование','Жадные алгоритмы','Рекурсия',
  'Графы','Деревья','Стеки и очереди','Хэш-таблицы','Геометрия','Брутфорс',
];

const DIFF_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  easy:   { label: 'Easy',   color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)'   },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'  },
  hard:   { label: 'Hard',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)'   },
  expert: { label: 'Expert', color: '#a855f7', bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.3)'  },
};

function DiffBadge({ difficulty }: { difficulty: string }) {
  const cfg = DIFF_CONFIG[difficulty?.toLowerCase()] ?? { label: difficulty, color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)' };
  return (
    <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, whiteSpace: 'nowrap', letterSpacing: '0.03em' }}>
      {cfg.label}
    </span>
  );
}

export function Problems() {
  const { user }                    = useAuthStore();
  const { theme }                   = useThemeStore();
  const dark                        = theme === 'dark';
  const [search, setSearch]         = useState('');
  const [difficulty, setDiff]       = useState('');
  const [topic, setTopic]           = useState('');
  const [page, setPage]             = useState(0);
  const [viewMode, setViewMode]     = useState<'list' | 'grid'>('list');
  const [sidebarOpen, setSidebar]   = useState(false);
  const limit = 20;

  // ── tokens ──
  const pageBg    = dark ? '#04080f'                 : '#f1f5f9';
  const panelBg   = dark ? 'rgba(6,10,24,0.82)'      : 'rgba(255,255,255,0.94)';
  const panelBord = dark ? 'rgba(255,255,255,0.07)'  : 'rgba(0,0,0,0.09)';
  const cardBg    = dark ? 'rgba(6,12,28,0.7)'       : 'rgba(255,255,255,0.97)';
  const cardBord  = dark ? 'rgba(255,255,255,0.07)'  : 'rgba(0,0,0,0.08)';
  const t1        = dark ? 'rgba(255,255,255,0.9)'   : 'rgba(0,0,0,0.88)';
  const t2        = dark ? 'rgba(255,255,255,0.45)'  : 'rgba(0,0,0,0.5)';
  const t3        = dark ? 'rgba(255,255,255,0.22)'  : 'rgba(0,0,0,0.3)';
  const inputBg   = dark ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.04)';
  const inputBord = dark ? 'rgba(255,255,255,0.1)'   : 'rgba(0,0,0,0.12)';
  const hoverBg   = dark ? 'rgba(255,255,255,0.04)'  : 'rgba(0,0,0,0.03)';
  const chipBg    = dark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.05)';
  const chipBord  = dark ? 'rgba(255,255,255,0.1)'   : 'rgba(0,0,0,0.1)';

  const { data: problems, isLoading } = useQuery({
    queryKey: ['problems', difficulty, topic, page],
    queryFn: () => problemsApi.list({ skip: page * limit, limit, difficulty: difficulty || undefined, topic: topic || undefined }),
  });
  const { data: bookmarks, refetch: refetchBm } = useQuery({ queryKey: ['bookmarks'], queryFn: bookmarksApi.list });

  const bookmarkedIds = new Set(((bookmarks ?? []) as { problem_id: string }[]).map(b => b.problem_id));
  const filtered = (problems ?? []).filter((p: ProblemShort) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const total = filtered.length;

  const toggleBm = async (e: React.MouseEvent, pid: string) => {
    e.preventDefault();
    try { if (bookmarkedIds.has(pid)) await bookmarksApi.remove(pid); else await bookmarksApi.add(pid); refetchBm(); } catch {}
  };

  const DIFF_FILTERS = [
    { val: '',       label: 'Все',    color: '#6366f1' },
    { val: 'easy',   label: 'Easy',   color: '#22c55e' },
    { val: 'medium', label: 'Medium', color: '#f59e0b' },
    { val: 'hard',   label: 'Hard',   color: '#ef4444' },
    { val: 'expert', label: 'Expert', color: '#a855f7' },
  ];

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '28px 20px' }}>
      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: t2 }} />
        <input
          placeholder="Поиск задач..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', paddingLeft: 36, paddingRight: search ? 32 : 12, paddingTop: 10, paddingBottom: 10, background: inputBg, border: `1px solid ${inputBord}`, borderRadius: 12, color: t1, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: t2, cursor: 'pointer', padding: 2 }}>
            <X size={13} />
          </button>
        )}
      </div>

      {/* Difficulty */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 800, color: t3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Сложность</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {DIFF_FILTERS.map(d => (
            <button
              key={d.val}
              onClick={() => { setDiff(d.val); setPage(0); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10,
                background: difficulty === d.val ? `${d.color}18` : 'transparent',
                border: `1px solid ${difficulty === d.val ? d.color + '44' : 'transparent'}`,
                color: difficulty === d.val ? d.color : t2,
                fontSize: 13, fontWeight: difficulty === d.val ? 700 : 500, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0, opacity: difficulty === d.val ? 1 : 0.4 }} />
              {d.label}
              {difficulty === d.val && <ChevronRight size={12} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
        </div>
      </div>

      {/* Topics */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 800, color: t3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Тема</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <button
            onClick={() => { setTopic(''); setPage(0); }}
            style={{ padding: '7px 12px', borderRadius: 8, background: topic === '' ? 'rgba(99,102,241,0.14)' : 'transparent', border: `1px solid ${topic === '' ? 'rgba(99,102,241,0.35)' : 'transparent'}`, color: topic === '' ? '#818cf8' : t2, fontSize: 12, fontWeight: topic === '' ? 700 : 400, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
          >Все темы</button>
          {TOPICS.map(tp => (
            <button
              key={tp}
              onClick={() => { setTopic(tp); setPage(0); }}
              style={{ padding: '7px 12px', borderRadius: 8, background: topic === tp ? 'rgba(99,102,241,0.14)' : 'transparent', border: `1px solid ${topic === tp ? 'rgba(99,102,241,0.35)' : 'transparent'}`, color: topic === tp ? '#818cf8' : t2, fontSize: 12, fontWeight: topic === tp ? 700 : 400, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
            >
              {tp}
            </button>
          ))}
        </div>
      </div>

      {/* Stats mini */}
      <div style={{ background: inputBg, border: `1px solid ${chipBord}`, borderRadius: 14, padding: '16px 14px' }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: t3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Прогресс</p>
        {[
          { label: 'Easy',   color: '#22c55e', count: filtered.filter((p: ProblemShort) => p.difficulty === 'easy').length },
          { label: 'Medium', color: '#f59e0b', count: filtered.filter((p: ProblemShort) => p.difficulty === 'medium').length },
          { label: 'Hard',   color: '#ef4444', count: filtered.filter((p: ProblemShort) => p.difficulty === 'hard').length },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.label}</span>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: t2, fontWeight: 700 }}>{s.count}</span>
          </div>
        ))}
        <div style={{ height: 1, background: chipBord, margin: '10px 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: t2 }}>Всего задач</span>
          <span style={{ fontSize: 14, fontFamily: 'monospace', color: '#818cf8', fontWeight: 800 }}>{total}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 56px)', background: pageBg }}>
      <BackgroundGraph noSphere light={!dark} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start' }}>

        {/* ── SIDEBAR (desktop) ── */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
          style={{
            width: 270, flexShrink: 0,
            position: 'sticky', top: 56,
            height: 'calc(100vh - 56px)',
            background: panelBg,
            backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
            borderRight: `1px solid ${panelBord}`,
            overflowY: 'auto', overflowX: 'hidden',
            display: 'none',
          }}
          className="lg:block"
        >
          <SidebarContent />
        </motion.aside>

        {/* ── MAIN ── */}
        <div style={{ flex: 1, padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 30, fontWeight: 900, color: t1, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                Задачи
                <span style={{ fontSize: 16, fontWeight: 600, color: t3, fontFamily: 'monospace', marginLeft: 10 }}>
                  {total > 0 ? total : ''}
                </span>
              </h1>
              <p style={{ fontSize: 13, color: t2, margin: 0 }}>Выбери задачу и начни решать</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Mobile filter toggle */}
              <button
                onClick={() => setSidebar(!sidebarOpen)}
                className="lg:hidden"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: chipBg, border: `1px solid ${chipBord}`, borderRadius: 10, color: t1, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                <Filter size={14} /> Фильтры
              </button>
              {/* View toggle */}
              <div style={{ display: 'flex', background: inputBg, border: `1px solid ${inputBord}`, borderRadius: 10, overflow: 'hidden' }}>
                {([['list', LayoutList], ['grid', LayoutGrid]] as const).map(([m, Icon]) => (
                  <button key={m} onClick={() => setViewMode(m as 'list' | 'grid')}
                    style={{ padding: '8px 12px', background: viewMode === m ? 'rgba(99,102,241,0.2)' : 'transparent', border: 'none', color: viewMode === m ? '#818cf8' : t2, cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}>
                    <Icon size={16} />
                  </button>
                ))}
              </div>
              {(user?.role === 'admin' || user?.role === 'moderator') && (
                <Link to="/problems/create" style={{ textDecoration: 'none' }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 20px rgba(99,102,241,0.4)', transition: 'transform 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                    <Plus size={15} /> Создать
                  </button>
                </Link>
              )}
            </div>
          </motion.div>

          {/* Stats strip */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.4 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[
              { label: 'Всего',   val: total,                                                                          icon: Code2,       color: '#818cf8' },
              { label: 'Easy',    val: (problems ?? []).filter((p: ProblemShort) => p.difficulty === 'easy').length,   icon: CheckCircle, color: '#22c55e' },
              { label: 'Medium',  val: (problems ?? []).filter((p: ProblemShort) => p.difficulty === 'medium').length, icon: Zap,         color: '#f59e0b' },
              { label: 'Hard',    val: (problems ?? []).filter((p: ProblemShort) => p.difficulty === 'hard').length,   icon: Trophy,      color: '#ef4444' },
            ].map(s => (
              <div key={s.label} style={{ background: cardBg, border: `1px solid ${cardBord}`, borderRadius: 14, padding: '14px 16px', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: 10, boxShadow: dark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <s.icon size={16} color={s.color} />
                </div>
                <div>
                  <p style={{ fontSize: 20, fontWeight: 900, fontFamily: 'monospace', color: s.color, margin: 0, lineHeight: 1 }}>{s.val}</p>
                  <p style={{ fontSize: 11, color: t3, margin: '2px 0 0' }}>{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Active filters row */}
          {(difficulty || topic || search) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: t3 }}>Фильтры:</span>
              {difficulty && (
                <button onClick={() => setDiff('')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: DIFF_CONFIG[difficulty]?.bg, border: `1px solid ${DIFF_CONFIG[difficulty]?.border}`, borderRadius: 20, color: DIFF_CONFIG[difficulty]?.color, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  {DIFF_CONFIG[difficulty]?.label} <X size={11} />
                </button>
              )}
              {topic && (
                <button onClick={() => setTopic('')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, color: '#818cf8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {topic} <X size={11} />
                </button>
              )}
              {search && (
                <button onClick={() => setSearch('')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: chipBg, border: `1px solid ${chipBord}`, borderRadius: 20, color: t2, fontSize: 12, cursor: 'pointer' }}>
                  «{search}» <X size={11} />
                </button>
              )}
            </div>
          )}

          {/* Problems */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} style={{ height: 70, borderRadius: 14, background: chipBg, animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
                <Code2 size={48} style={{ color: t3, opacity: 0.4 }} />
                <p style={{ fontSize: 16, color: t2, margin: 0 }}>Задачи не найдены</p>
                <button onClick={() => { setSearch(''); setDiff(''); setTopic(''); }}
                  style={{ padding: '8px 18px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, color: '#818cf8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Сбросить фильтры
                </button>
              </motion.div>
            ) : viewMode === 'list' ? (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {/* Header row */}
                <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 100px 80px 90px 40px', gap: 8, padding: '0 18px 8px', alignItems: 'center' }}>
                  {['#', 'Задача', 'Сложность', 'Тема', 'Решений', ''].map((h, i) => (
                    <span key={i} style={{ fontSize: 10, fontWeight: 800, color: t3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: i === 4 ? 'right' : 'left' }}>{h}</span>
                  ))}
                </div>
                {filtered.map((p: ProblemShort, i: number) => {
                  const diff = p.difficulty?.toLowerCase() ?? 'easy';
                  const cfg  = DIFF_CONFIG[diff] ?? DIFF_CONFIG.easy;
                  const bm   = bookmarkedIds.has(p.id);
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025, duration: 0.3 }}
                    >
                      <Link to={`/problems/${p.slug}`} style={{ textDecoration: 'none' }}>
                        <div
                          style={{
                            display: 'grid', gridTemplateColumns: '52px 1fr 100px 80px 90px 40px',
                            gap: 8, padding: '14px 18px', alignItems: 'center',
                            background: cardBg, border: `1px solid ${cardBord}`, borderRadius: 14,
                            backdropFilter: 'blur(20px)', cursor: 'pointer',
                            position: 'relative', overflow: 'hidden',
                            transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
                            boxShadow: dark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
                          }}
                          onMouseEnter={e => {
                            const el = e.currentTarget;
                            el.style.transform = 'translateX(3px)';
                            el.style.borderColor = cfg.border;
                            el.style.boxShadow = dark ? `0 0 20px ${cfg.color}18` : `0 4px 20px rgba(0,0,0,0.08)`;
                          }}
                          onMouseLeave={e => {
                            const el = e.currentTarget;
                            el.style.transform = 'translateX(0)';
                            el.style.borderColor = cardBord;
                            el.style.boxShadow = dark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)';
                          }}
                        >
                          {/* Colored left accent */}
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: cfg.color, opacity: 0.7, borderRadius: '4px 0 0 4px' }} />

                          {/* Number */}
                          <span style={{ fontSize: 12, fontFamily: 'monospace', color: t3, fontWeight: 600 }}>
                            {page * limit + i + 1}
                          </span>

                          {/* Title */}
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: t1, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.title}
                            </p>
                            {(p as { time_limit?: number }).time_limit && (
                              <span style={{ fontSize: 11, color: t3, fontFamily: 'monospace' }}>
                                {(p as { time_limit?: number }).time_limit}s · {(p as { memory_limit?: number }).memory_limit ?? 256}MB
                              </span>
                            )}
                          </div>

                          {/* Difficulty */}
                          <div><DiffBadge difficulty={p.difficulty} /></div>

                          {/* Topic */}
                          <div>
                            {p.topic ? (
                              <span style={{ fontSize: 11, color: t2, background: chipBg, border: `1px solid ${chipBord}`, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: 76 }}>
                                {p.topic}
                              </span>
                            ) : <span style={{ color: t3, fontSize: 12 }}>—</span>}
                          </div>

                          {/* Solve count */}
                          <span style={{ fontSize: 13, fontFamily: 'monospace', color: t2, fontWeight: 600, textAlign: 'right' }}>
                            {p.solve_count.toLocaleString()}
                          </span>

                          {/* Bookmark */}
                          <button
                            onClick={e => toggleBm(e, p.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: bm ? '#f59e0b' : t3, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, transition: 'color 0.15s' }}
                            onMouseEnter={e => { if (!bm) e.currentTarget.style.color = '#f59e0b'; }}
                            onMouseLeave={e => { if (!bm) e.currentTarget.style.color = t3; }}
                          >
                            {bm ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                          </button>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              /* Grid view */
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
                {filtered.map((p: ProblemShort, i: number) => {
                  const diff = p.difficulty?.toLowerCase() ?? 'easy';
                  const cfg  = DIFF_CONFIG[diff] ?? DIFF_CONFIG.easy;
                  const bm   = bookmarkedIds.has(p.id);
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03, duration: 0.3 }}
                    >
                      <Link to={`/problems/${p.slug}`} style={{ textDecoration: 'none' }}>
                        <div
                          style={{ background: cardBg, border: `1px solid ${cardBord}`, borderRadius: 16, padding: '18px 18px 14px', backdropFilter: 'blur(20px)', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'transform 0.18s, box-shadow 0.18s', height: '100%', boxSizing: 'border-box', boxShadow: dark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = dark ? `0 12px 40px ${cfg.color}22` : '0 8px 32px rgba(0,0,0,0.1)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = dark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)'; }}
                        >
                          {/* Top gradient line */}
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${cfg.color}, transparent)` }} />

                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                            <span style={{ fontSize: 11, fontFamily: 'monospace', color: t3 }}>#{page * limit + i + 1}</span>
                            <button onClick={e => toggleBm(e, p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: bm ? '#f59e0b' : t3, padding: 0 }}>
                              {bm ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                            </button>
                          </div>

                          <p style={{ fontSize: 14, fontWeight: 800, color: t1, margin: '0 0 12px', lineHeight: 1.35 }}>{p.title}</p>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                            <DiffBadge difficulty={p.difficulty} />
                            {p.topic && (
                              <span style={{ fontSize: 11, color: t2, background: chipBg, border: `1px solid ${chipBord}`, padding: '2px 8px', borderRadius: 20 }}>{p.topic}</span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${cardBord}` }}>
                            <span style={{ fontSize: 11, color: t3 }}>Решений</span>
                            <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: cfg.color }}>{p.solve_count.toLocaleString()}</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {!isLoading && filtered.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 8 }}>
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                style={{ padding: '8px 18px', background: chipBg, border: `1px solid ${chipBord}`, borderRadius: 10, color: page === 0 ? t3 : t1, fontSize: 13, fontWeight: 600, cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1, transition: 'all 0.15s' }}
              >← Назад</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {[...Array(Math.min(5, page + 3))].map((_, idx) => {
                  const pg = Math.max(0, page - 2) + idx;
                  return (
                    <button key={pg} onClick={() => setPage(pg)}
                      style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${pg === page ? 'rgba(99,102,241,0.5)' : chipBord}`, background: pg === page ? 'rgba(99,102,241,0.2)' : chipBg, color: pg === page ? '#818cf8' : t2, fontSize: 13, fontWeight: pg === page ? 800 : 500, cursor: 'pointer', transition: 'all 0.15s' }}>
                      {pg + 1}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage(page + 1)}
                disabled={(problems?.length ?? 0) < limit}
                style={{ padding: '8px 18px', background: chipBg, border: `1px solid ${chipBord}`, borderRadius: 10, color: (problems?.length ?? 0) < limit ? t3 : t1, fontSize: 13, fontWeight: 600, cursor: (problems?.length ?? 0) < limit ? 'not-allowed' : 'pointer', opacity: (problems?.length ?? 0) < limit ? 0.4 : 1, transition: 'all 0.15s' }}
              >Вперёд →</button>
            </motion.div>
          )}

        </div>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebar(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ position: 'fixed', left: 0, top: 56, bottom: 0, width: 280, background: panelBg, backdropFilter: 'blur(32px)', borderRight: `1px solid ${panelBord}`, zIndex: 50, overflowY: 'auto' }}>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
