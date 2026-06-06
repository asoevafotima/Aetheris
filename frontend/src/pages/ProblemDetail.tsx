import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  Play, Clock, Database, BarChart2, Bot,
  ChevronDown, ChevronUp, CheckCircle, XCircle,
  Loader2, Lightbulb, RefreshCw, ShieldOff, ArrowLeft, Code2,
} from 'lucide-react';
import { problemsApi, submissionsApi, aiApi, testCasesApi } from '../api/endpoints';
import { BackgroundGraph } from '../components/BackgroundGraph';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useThemeStore } from '../store/themeStore';
import type { Submission } from '../types';

const LANGUAGES = [
  { value: 'python', label: 'Python 3' },
  { value: 'cpp',    label: 'C++ 17'   },
];
const STARTERS: Record<string, string> = {
  python: `import sys\ninput = sys.stdin.readline\n\ndef solve():\n    pass\n\nsolve()\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    return 0;\n}\n`,
};
const HINT_TYPES = [
  { value: 'algorithm',  label: '🧠 Алгоритм'  },
  { value: 'approach',   label: '📋 Подход'     },
  { value: 'complexity', label: '⚡ Сложность'  },
  { value: 'debug',      label: '🐛 Отладка'    },
];
const DIFF_CFG: Record<string, [string, string]> = {
  easy:   ['Easy',   '#22c55e'],
  medium: ['Medium', '#f59e0b'],
  hard:   ['Hard',   '#ef4444'],
  expert: ['Expert', '#a855f7'],
};
const VERDICT: Record<string, [string, string]> = {
  accepted:      ['Принято',        '#22c55e'],
  wrong_answer:  ['Неверный ответ', '#ef4444'],
  time_limit:    ['Лимит времени',  '#f59e0b'],
  memory_limit:  ['Лимит памяти',   '#f59e0b'],
  runtime_error: ['Ошибка выполн.', '#ef4444'],
  compile_error: ['Ошибка компил.', '#818cf8'],
  pending:       ['Ожидание',       '#64748b'],
  running:       ['Проверяется',    '#3b82f6'],
};

function Section({ title, children, dark }: { title: string; children: React.ReactNode; dark: boolean }) {
  const [open, setOpen] = useState(true);
  const t1   = dark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.88)';
  const t2   = dark ? 'rgba(255,255,255,0.4)'  : 'rgba(0,0,0,0.45)';
  const bord = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const hBg  = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  return (
    <div style={{ border: `1px solid ${bord}`, borderRadius: 14, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', background: hBg, border: 'none', cursor: 'pointer' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: t1 }}>{title}</span>
        {open ? <ChevronUp size={14} color={t2} /> : <ChevronDown size={14} color={t2} />}
      </button>
      {open && <div style={{ padding: '13px 16px' }}>{children}</div>}
    </div>
  );
}

export function ProblemDetail() {
  const { slug }       = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const contestId      = searchParams.get('contest') ?? undefined;
  const { theme }      = useThemeStore();
  const dark           = theme === 'dark';
  const qc             = useQueryClient();

  const [lang, setLang]           = useState('python');
  const [code, setCode]           = useState(STARTERS.python);
  const [tab, setTab]             = useState<'problem' | 'submissions' | 'ai'>('problem');
  const [hintType, setHintType]   = useState('algorithm');
  const [lastSubId, setLastSubId] = useState<string | null>(null);
  const [polling, setPolling]     = useState(false);

  // ── те же токены что везде ──
  const pageBg    = dark ? '#04080f'                 : '#f1f5f9';
  const panelBg   = dark ? 'rgba(6,12,28,0.75)'      : 'rgba(255,255,255,0.96)';
  const panelBord = dark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.09)';
  const cardBg    = dark ? 'rgba(6,12,28,0.65)'      : 'rgba(255,255,255,0.97)';
  const cardBord  = dark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.08)';
  const t1        = dark ? 'rgba(255,255,255,0.9)'   : 'rgba(0,0,0,0.88)';
  const t2        = dark ? 'rgba(255,255,255,0.45)'  : 'rgba(0,0,0,0.5)';
  const t3        = dark ? 'rgba(255,255,255,0.22)'  : 'rgba(0,0,0,0.3)';
  const chipBg    = dark ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.04)';
  const chipBord  = dark ? 'rgba(255,255,255,0.09)'  : 'rgba(0,0,0,0.08)';
  const inputBg   = dark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.04)';
  const inputBord = dark ? 'rgba(255,255,255,0.12)'  : 'rgba(0,0,0,0.12)';

  const { data: problem, isLoading } = useQuery({ queryKey: ['problem', slug], queryFn: () => problemsApi.get(slug!), enabled: !!slug });
  const { data: mySubmissions } = useQuery({ queryKey: ['submissions', 'problem', problem?.id], queryFn: () => submissionsApi.byProblem(problem!.id, 0, 10), enabled: !!problem?.id });
  const { data: latestSub } = useQuery({
    queryKey: ['submission', lastSubId], queryFn: () => submissionsApi.get(lastSubId!),
    enabled: !!lastSubId && polling,
    refetchInterval: (q) => { const d = q.state.data; if (!d || d.status === 'pending' || d.status === 'running') return 1000; setPolling(false); return false; },
  });
  const { data: sampleTests } = useQuery({
    queryKey: ['sample-tests', slug],
    queryFn: () => testCasesApi.samples(problem!.id),
    enabled: !!problem?.id,
    staleTime: 0,
    retry: 2,
  });

  const submitMut   = useMutation({
    mutationFn: () => submissionsApi.submit({ problem_id: problem!.id, language: lang, code, contest_id: contestId }),
    onSuccess: (sub) => { setLastSubId(sub.id); setPolling(true); qc.invalidateQueries({ queryKey: ['submissions', 'problem', problem?.id] }); },
  });
  const hintMut     = useMutation({ mutationFn: () => aiApi.hint({ problem_id: problem!.id, hint_type: hintType, submission_id: lastSubId ?? undefined }) });
  const analysisMut = useMutation({ mutationFn: () => aiApi.analyze({ submission_id: lastSubId!, analysis_type: 'full' }) });

  useEffect(() => { setCode(STARTERS[lang] ?? ''); }, [lang]);

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', background: pageBg }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.3)', borderTopColor: '#818cf8', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!problem) return <div style={{ padding: 40, textAlign: 'center', color: t2, background: pageBg }}>Задача не найдена</div>;

  const displaySub = latestSub ?? mySubmissions?.[0];
  const diffCfg    = DIFF_CFG[problem.difficulty?.toLowerCase()] ?? ['', '#64748b'];
  const TABS       = (['problem', 'submissions', ...(contestId ? [] : ['ai'])] as const);

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 56px)', overflow: 'hidden', background: pageBg, display: 'flex' }}>
      {/* BackgroundGraph как везде */}
      <BackgroundGraph noSphere light={!dark} />

      {/* ══ ЛЕВАЯ ПАНЕЛЬ — точно как Dashboard left panel ══ */}
      <motion.div
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
        style={{
          width: '46%', flexShrink: 0, position: 'relative', zIndex: 1,
          background: panelBg,
          backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
          borderRight: `1px solid ${panelBord}`,
          boxShadow: dark ? 'none' : '2px 0 20px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* Shimmer top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, zIndex: 2, background: dark ? 'linear-gradient(90deg,transparent,rgba(96,165,250,0.35),rgba(245,158,11,0.2),transparent)' : 'linear-gradient(90deg,transparent,rgba(99,102,241,0.2),rgba(245,158,11,0.15),transparent)' }} />

        {/* Заголовок задачи */}
        <div style={{ padding: '18px 22px 14px', borderBottom: `1px solid ${panelBord}`, flexShrink: 0 }}>
          <Link to="/problems" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: t3, textDecoration: 'none', marginBottom: 12, transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#818cf8'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = t3}>
            <ArrowLeft size={12} /> Все задачи
          </Link>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: t1, margin: 0, flex: 1, lineHeight: 1.3, letterSpacing: '-0.01em' }}>{problem.title}</h1>
            <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 11px', borderRadius: 20, background: `${diffCfg[1]}14`, color: diffCfg[1], border: `1px solid ${diffCfg[1]}44`, flexShrink: 0, marginTop: 2 }}>
              {diffCfg[0]}
            </span>
          </div>
          {/* Метрики */}
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: t3 }}><Clock size={11} /> {problem.time_limit_ms} мс</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: t3 }}><Database size={11} /> {problem.memory_limit_mb} МБ</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: t3 }}><BarChart2 size={11} /> {problem.solve_count} решений</span>
          </div>
        </div>

        {/* Табы */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${panelBord}`, flexShrink: 0, padding: '0 8px' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t as typeof tab)}
              style={{ padding: '11px 16px', fontSize: 13, fontWeight: tab === t ? 700 : 500, color: tab === t ? '#818cf8' : t2, background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? '#6366f1' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
              {t === 'problem' ? '📄 Условие' : t === 'submissions' ? '📬 Посылки' : '🤖 AI Помощник'}
            </button>
          ))}
        </div>

        {/* Содержимое */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* ── УСЛОВИЕ ── */}
          {tab === 'problem' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Section title="Условие задачи" dark={dark}>
                <p style={{ fontSize: 13, color: t2, lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>{problem.description}</p>
              </Section>
              <Section title="Формат ввода" dark={dark}>
                <p style={{ fontSize: 13, color: t2, lineHeight: 1.65, margin: 0 }}>{problem.input_format}</p>
              </Section>
              <Section title="Формат вывода" dark={dark}>
                <p style={{ fontSize: 13, color: t2, lineHeight: 1.65, margin: 0 }}>{problem.output_format}</p>
              </Section>
              <Section title="Ограничения" dark={dark}>
                <p style={{ fontSize: 12, color: t2, fontFamily: 'monospace', lineHeight: 1.65, margin: 0 }}>{problem.constraints}</p>
              </Section>
              <Section title="Примеры" dark={dark}>
                {!sampleTests ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0', color: t3, fontSize: 12 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${chipBord}`, borderTopColor: '#818cf8', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                    Загрузка примеров...
                  </div>
                ) : (sampleTests as { id: string; input_data: string; expected_output: string }[]).length === 0 ? (
                  <p style={{ fontSize: 12, color: t3, margin: 0 }}>Примеры для этой задачи не указаны</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(sampleTests as { id: string; input_data: string; expected_output: string }[]).slice(0, 3).map((tc, i) => (
                      <div key={tc.id} style={{ border: `1px solid ${cardBord}`, borderRadius: 12, overflow: 'hidden' }}>
                        <div style={{ padding: '6px 13px', fontSize: 10, fontWeight: 800, color: t3, background: chipBg, borderBottom: `1px solid ${cardBord}`, textTransform: 'uppercase' as const, letterSpacing: '0.07em' }}>
                          Пример {i + 1}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                          <div style={{ padding: '10px 13px', borderRight: `1px solid ${cardBord}` }}>
                            <p style={{ fontSize: 10, color: t3, fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Ввод</p>
                            <pre style={{ fontSize: 12, fontFamily: 'monospace', color: t1, margin: 0, whiteSpace: 'pre-wrap' }}>{tc.input_data}</pre>
                          </div>
                          <div style={{ padding: '10px 13px' }}>
                            <p style={{ fontSize: 10, color: t3, fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Вывод</p>
                            <pre style={{ fontSize: 12, fontFamily: 'monospace', color: t1, margin: 0, whiteSpace: 'pre-wrap' }}>{tc.expected_output}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </motion.div>
          )}

          {/* ── ПОСЫЛКИ ── */}
          {tab === 'submissions' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: t1, margin: '0 0 4px' }}>Мои посылки</p>
              {(mySubmissions ?? []).length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                  <Code2 size={36} style={{ color: t3, opacity: 0.3, margin: '0 auto 10px', display: 'block' }} />
                  <p style={{ fontSize: 13, color: t2, margin: 0 }}>Посылок пока нет</p>
                </div>
              ) : (mySubmissions ?? []).map((sub: Submission) => {
                const [label, color] = VERDICT[sub.status] ?? [sub.status, '#64748b'];
                return (
                  <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', background: chipBg, border: `1px solid ${chipBord}`, borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 6, background: `${color}18`, color, fontFamily: 'monospace' }}>{label}</span>
                      <span style={{ fontSize: 11, color: t3 }}>{sub.language}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {sub.time_ms && <span style={{ fontSize: 11, fontFamily: 'monospace', color: t3 }}>{sub.time_ms}мс</span>}
                      <span style={{ fontSize: 11, color: t3 }}>{formatDistanceToNow(new Date(sub.created_at), { addSuffix: true, locale: ru })}</span>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* ── AI ── */}
          {tab === 'ai' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {contestId ? (
                <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldOff size={13} /> AI недоступен во время контеста
                </div>
              ) : (
                <>
                  {/* AI header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(99,102,241,0.4)', flexShrink: 0 }}>
                      <Bot size={18} color="#fff" />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#818cf8', margin: 0 }}>AI Наставник</p>
                      <p style={{ fontSize: 11, color: t3, margin: '2px 0 0' }}>Groq · Подсказки без спойлеров</p>
                    </div>
                  </div>

                  {/* Hint type */}
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 800, color: t3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Тип подсказки</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {HINT_TYPES.map(h => (
                        <button key={h.value} onClick={() => setHintType(h.value)}
                          style={{ padding: '9px 12px', borderRadius: 10, border: `1px solid ${hintType === h.value ? 'rgba(99,102,241,0.4)' : 'transparent'}`, background: hintType === h.value ? 'rgba(99,102,241,0.1)' : 'transparent', color: hintType === h.value ? '#818cf8' : t2, fontSize: 13, fontWeight: hintType === h.value ? 700 : 400, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                          {h.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => hintMut.mutate()} disabled={hintMut.isPending}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 0 22px rgba(99,102,241,0.38)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'transform 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <Lightbulb size={14} /> {hintMut.isPending ? 'Думаю...' : 'Получить подсказку'}
                  </button>

                  {hintMut.data && (
                    <div style={{ padding: '14px 16px', borderRadius: 13, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', fontSize: 13, color: t1, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8, fontSize: 11, fontWeight: 700, color: '#818cf8' }}>
                        <Lightbulb size={11} /> Подсказка от AI
                      </div>
                      {hintMut.data.response_text}
                    </div>
                  )}

                  {lastSubId && (
                    <div style={{ paddingTop: 14, borderTop: `1px solid ${panelBord}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <button onClick={() => analysisMut.mutate()} disabled={analysisMut.isPending}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', background: chipBg, border: `1px solid ${chipBord}`, borderRadius: 12, color: t1, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        <BarChart2 size={14} /> {analysisMut.isPending ? 'Анализирую...' : 'Анализировать решение'}
                      </button>
                      {analysisMut.data && (
                        <div style={{ padding: '14px 16px', borderRadius: 13, background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.2)', fontSize: 13, color: t1, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                          {analysisMut.data.result}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ══ ПРАВАЯ ПАНЕЛЬ — редактор ══ */}
      <motion.div
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}
      >
        {/* Тулбар — такой же как в AIMentor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderBottom: `1px solid ${panelBord}`, background: panelBg, backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', flexShrink: 0 }}>
          {/* Shimmer top */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: dark ? 'linear-gradient(90deg,transparent,rgba(34,197,94,0.3),transparent)' : 'linear-gradient(90deg,transparent,rgba(34,197,94,0.2),transparent)' }} />

          <div style={{ position: 'relative' }}>
            <select value={lang} onChange={e => setLang(e.target.value)}
              style={{ padding: '7px 28px 7px 12px', background: inputBg, border: `1px solid ${inputBord}`, borderRadius: 9, color: t1, fontSize: 13, cursor: 'pointer', outline: 'none', fontFamily: 'inherit', appearance: 'none', WebkitAppearance: 'none' }}>
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: t3, pointerEvents: 'none' }} />
          </div>

          <div style={{ flex: 1 }} />

          <button onClick={() => setCode(STARTERS[lang] ?? '')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', background: chipBg, border: `1px solid ${chipBord}`, borderRadius: 9, color: t2, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = t1}
            onMouseLeave={e => e.currentTarget.style.color = t2}>
            <RefreshCw size={12} /> Сброс
          </button>

          <button onClick={() => submitMut.mutate()} disabled={submitMut.isPending || polling}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', background: submitMut.isPending || polling ? chipBg : 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: submitMut.isPending || polling ? 'none' : '0 0 22px rgba(34,197,94,0.42)', border: `1px solid ${submitMut.isPending || polling ? chipBord : 'transparent'}`, borderRadius: 11, color: submitMut.isPending || polling ? t3 : '#fff', fontSize: 13, fontWeight: 700, cursor: submitMut.isPending || polling ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { if (!submitMut.isPending && !polling) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            {polling
              ? <><Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Проверяется...</>
              : <><Play size={14} /> Отправить</>}
          </button>
        </div>

        {/* Monaco Editor */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Editor
            height="100%"
            language={lang === 'cpp' ? 'cpp' : 'python'}
            value={code}
            onChange={v => setCode(v ?? '')}
            theme={dark ? 'vs-dark' : 'vs'}
            options={{
              fontSize: 14,
              fontFamily: '"JetBrains Mono","Fira Code",monospace',
              fontLigatures: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              lineNumbers: 'on',
              tabSize: 4,
              wordWrap: 'on',
              renderLineHighlight: 'line',
            }}
          />
        </div>

        {/* Результат */}
        <AnimatePresence>
          {displaySub && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ borderTop: `1px solid ${panelBord}`, background: panelBg, backdropFilter: 'blur(32px)', padding: '12px 20px', flexShrink: 0 }}>
              {polling ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#06b6d4', fontSize: 13 }}>
                  <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Проверяется...
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {displaySub.status === 'accepted'
                    ? <CheckCircle size={16} color="#22c55e" />
                    : <XCircle size={16} color="#ef4444" />}
                  <span style={{ fontSize: 13, fontWeight: 700, color: VERDICT[displaySub.status]?.[1] ?? t1 }}>
                    {VERDICT[displaySub.status]?.[0] ?? displaySub.status}
                  </span>
                  {displaySub.time_ms && <span style={{ fontSize: 12, color: t3, fontFamily: 'monospace' }}>{displaySub.time_ms}мс</span>}
                  {displaySub.score > 0 && <span style={{ fontSize: 12, color: t3 }}>{displaySub.score}%</span>}
                </div>
              )}
              {displaySub.error_message && !polling && (
                <pre style={{ marginTop: 8, fontSize: 12, color: '#f87171', fontFamily: 'monospace', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', overflow: 'auto', maxHeight: 80, margin: '8px 0 0' }}>
                  {displaySub.error_message}
                </pre>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
