import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { Play, Clock, Database, BarChart2, Bot, ChevronDown, ChevronUp, CheckCircle, XCircle, Loader2, Lightbulb, RefreshCw, ShieldOff } from 'lucide-react';
import { problemsApi, submissionsApi, aiApi, testCasesApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { DifficultyBadge, StatusBadge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Submission } from '../types';

const LANGUAGES = [
  { value: 'python', label: 'Python 3' },
  { value: 'cpp',    label: 'C++ 17'   },
];

const STARTERS: Record<string, string> = {
  python: `import sys\ninput = sys.stdin.readline\n\ndef solve():\n    # Ваше решение здесь\n    pass\n\nsolve()\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    // Ваше решение здесь\n\n    return 0;\n}\n`,
};

const HINT_TYPES = [
  { value: 'algorithm',  label: '🧠 Подсказка по алгоритму' },
  { value: 'approach',   label: '📋 Подход к решению'        },
  { value: 'complexity', label: '⚡ Сложность'               },
  { value: 'debug',      label: '🐛 Помощь с отладкой'       },
];

export function ProblemDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get('contest') ?? undefined;
  const qc = useQueryClient();
  const [lang, setLang]           = useState('python');
  const [code, setCode]           = useState(STARTERS.python);
  const [tab, setTab]             = useState<'problem' | 'submissions' | 'ai'>('problem');
  const [hintType, setHintType]   = useState('algorithm');
  const [lastSubId, setLastSubId] = useState<string | null>(null);
  const [polling, setPolling]     = useState(false);

  const { data: problem, isLoading } = useQuery({
    queryKey: ['problem', slug],
    queryFn: () => problemsApi.get(slug!),
    enabled: !!slug,
  });

  const { data: mySubmissions } = useQuery({
    queryKey: ['submissions', 'problem', problem?.id],
    queryFn: () => submissionsApi.byProblem(problem!.id, 0, 10),
    enabled: !!problem?.id,
  });

  const { data: latestSub } = useQuery({
    queryKey: ['submission', lastSubId],
    queryFn: () => submissionsApi.get(lastSubId!),
    enabled: !!lastSubId && polling,
    refetchInterval: (query) => {
      const d = query.state.data;
      if (!d || d.status === 'pending' || d.status === 'running') return 1000;
      setPolling(false);
      return false;
    },
  });

  const submitMut = useMutation({
    mutationFn: () => submissionsApi.submit({ problem_id: problem!.id, language: lang, code, contest_id: contestId }),
    onSuccess: (sub) => {
      setLastSubId(sub.id);
      setPolling(true);
      qc.invalidateQueries({ queryKey: ['submissions', 'problem', problem?.id] });
    },
  });

  const { data: sampleTests } = useQuery({
    queryKey: ['sample-tests', problem?.id],
    queryFn: () => testCasesApi.samples(problem!.id),
    enabled: !!problem?.id,
  });

  const hintMut     = useMutation({ mutationFn: () => aiApi.hint({ problem_id: problem!.id, hint_type: hintType, submission_id: lastSubId ?? undefined }) });
  const analysisMut = useMutation({ mutationFn: () => aiApi.analyze({ submission_id: lastSubId!, analysis_type: 'full' }) });

  useEffect(() => { setCode(STARTERS[lang] ?? ''); }, [lang]);

  if (isLoading) return <PageLoader />;
  if (!problem)  return <div className="p-10 text-center text-slate-500">Задача не найдена</div>;

  const displaySub = latestSub ?? mySubmissions?.[0];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Левая панель */}
      <div className="w-[45%] flex flex-col border-r border-slate-200 overflow-hidden bg-white">
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
          {(['problem', 'submissions', ...(contestId ? [] : ['ai'])] as const).map(t => (
            <button key={t} onClick={() => setTab(t as typeof tab)}
              className={`px-5 py-3 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                tab === t ? 'border-purple-500 text-purple-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t === 'problem' ? 'Задача' : t === 'submissions' ? 'Посылки' : 'AI Помощник'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'problem' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-900">{problem.title}</h1>
                  <DifficultyBadge difficulty={problem.difficulty} />
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Clock size={12} /> {problem.time_limit_ms} мс</span>
                  <span className="flex items-center gap-1"><Database size={12} /> {problem.memory_limit_mb} МБ</span>
                  <span className="flex items-center gap-1"><BarChart2 size={12} /> {problem.solve_count} решений</span>
                </div>
              </div>
              <Section title="Условие задачи"><p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{problem.description}</p></Section>
              <Section title="Формат ввода"><p className="text-slate-700 text-sm leading-relaxed">{problem.input_format}</p></Section>
              <Section title="Формат вывода"><p className="text-slate-700 text-sm leading-relaxed">{problem.output_format}</p></Section>
              <Section title="Ограничения"><p className="text-slate-700 text-sm font-mono leading-relaxed">{problem.constraints}</p></Section>
              {sampleTests && (sampleTests as { id: string; input_data: string; expected_output: string }[]).length > 0 && (
                <Section title="Примеры">
                  <div className="flex flex-col gap-3">
                    {(sampleTests as { id: string; input_data: string; expected_output: string }[]).slice(0, 3).map((tc, i) => (
                      <div key={tc.id} className="rounded-lg border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 border-b border-slate-200">
                          Пример {i + 1}
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-slate-200">
                          <div className="p-3">
                            <p className="text-xs text-slate-400 mb-1 font-medium">Входные данные</p>
                            <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap">{tc.input_data}</pre>
                          </div>
                          <div className="p-3">
                            <p className="text-xs text-slate-400 mb-1 font-medium">Выходные данные</p>
                            <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap">{tc.expected_output}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </motion.div>
          )}

          {tab === 'submissions' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Мои посылки</h2>
              {(mySubmissions ?? []).length === 0
                ? <p className="text-slate-400 text-sm text-center py-10">Посылок пока нет</p>
                : mySubmissions?.map(sub => <SubmissionRow key={sub.id} sub={sub} />)
              }
            </motion.div>
          )}

          {contestId && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs">
              <ShieldOff size={13} /> AI-помощник недоступен во время контеста
            </div>
          )}

          {tab === 'ai' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center">
                  <Bot size={16} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">AI Наставник</p>
                  <p className="text-xs text-slate-400">Отвечает на русском языке</p>
                </div>
              </div>
              <Select label="Тип подсказки" options={HINT_TYPES} value={hintType} onChange={e => setHintType(e.target.value)} />
              <Button onClick={() => hintMut.mutate()} loading={hintMut.isPending} icon={<Lightbulb size={16} />} className="w-full">
                Получить подсказку
              </Button>
              {hintMut.data && (
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  <div className="flex items-center gap-1.5 mb-2 text-purple-600 text-xs font-semibold"><Lightbulb size={12} /> Подсказка от AI</div>
                  {hintMut.data.response_text}
                </div>
              )}
              {lastSubId && (
                <div className="border-t border-slate-200 pt-4">
                  <Button variant="secondary" onClick={() => analysisMut.mutate()} loading={analysisMut.isPending} icon={<BarChart2 size={16} />} className="w-full">
                    Анализировать моё решение
                  </Button>
                  {analysisMut.data && (
                    <div className="mt-3 p-4 rounded-xl bg-cyan-50 border border-cyan-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {analysisMut.data.result}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Правая панель — редактор */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-200 bg-white shrink-0">
          <Select options={LANGUAGES} value={lang} onChange={e => setLang(e.target.value)} className="w-36" />
          <div className="flex-1" />
          <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={() => setCode(STARTERS[lang] ?? '')}>Сброс</Button>
          <Button onClick={() => submitMut.mutate()} loading={submitMut.isPending || polling} icon={<Play size={14} />} size="sm">
            {polling ? 'Проверяется…' : 'Отправить'}
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={lang === 'cpp' ? 'cpp' : 'python'}
            value={code}
            onChange={v => setCode(v ?? '')}
            theme="vs"
            options={{
              fontSize: 14,
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              fontLigatures: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              lineNumbers: 'on',
              renderLineHighlight: 'line',
              tabSize: 4,
              wordWrap: 'on',
            }}
          />
        </div>

        {displaySub && (
          <div className="border-t border-slate-200 bg-white p-4 shrink-0">
            <div className="flex items-center gap-3 mb-2">
              {polling ? (
                <div className="flex items-center gap-2 text-cyan-600 text-sm"><Loader2 size={14} className="animate-spin" /> Проверяется…</div>
              ) : (
                <>
                  {displaySub.status === 'accepted' ? <CheckCircle size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-red-500" />}
                  <StatusBadge status={displaySub.status} />
                  {displaySub.time_ms && <span className="text-xs text-slate-400 font-mono">{displaySub.time_ms} мс</span>}
                  {displaySub.score > 0 && <span className="text-xs text-slate-400">Очки: {displaySub.score}%</span>}
                </>
              )}
            </div>
            {displaySub.error_message && !polling && (
              <pre className="text-xs text-red-600 font-mono bg-red-50 border border-red-200 rounded-lg p-3 overflow-x-auto max-h-24">
                {displaySub.error_message}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
        {title}
        {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>
      {open && <div className="px-4 py-3 bg-white">{children}</div>}
    </div>
  );
}

function SubmissionRow({ sub }: { sub: Submission }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-colors">
      <div className="flex items-center gap-3">
        <StatusBadge status={sub.status} />
        <span className="text-xs text-slate-400">{sub.language}</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-400">
        {sub.time_ms && <span className="font-mono">{sub.time_ms} мс</span>}
        <span>{formatDistanceToNow(new Date(sub.created_at), { addSuffix: true, locale: ru })}</span>
      </div>
    </div>
  );
}
