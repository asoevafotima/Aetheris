import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Calendar, ArrowRight, Clock, Plus, X,
  Lock, Globe, Search, CheckSquare, Square, AlertCircle,
} from 'lucide-react';
import { contestsApi, problemsApi, testCasesApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardBody } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { SkeletonLine } from '../components/ui/Spinner';
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuthStore } from '../store/authStore';
import type { Contest, ProblemShort } from '../types';

// ─── Status badge ──────────────────────────────────────────────
function ContestStatusBadge({ contest }: { contest: Contest }) {
  const start = new Date(contest.starts_at), end = new Date(contest.ends_at);
  if (isFuture(start)) return <Badge variant="cyan">Предстоит</Badge>;
  if (isPast(end))     return <Badge variant="gray">Завершён</Badge>;
  return <Badge variant="green">🔴 Идёт</Badge>;
}

// ─── Contest card ──────────────────────────────────────────────
function ContestCard({ contest }: { contest: Contest }) {
  const start = new Date(contest.starts_at), end = new Date(contest.ends_at);
  const isLive = !isFuture(start) && !isPast(end);
  const { isAuthenticated } = useAuthStore();
  const qc = useQueryClient();

  const { data: regData } = useQuery({
    queryKey: ['my-registration', contest.id],
    queryFn: () => contestsApi.myRegistration(contest.id),
    enabled: isAuthenticated && !isPast(end),
    retry: false,
  });
  const registered = !!regData;

  const registerMut = useMutation({
    mutationFn: () => contestsApi.register(contest.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-registration', contest.id] }),
  });

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Card className={`overflow-hidden ${isLive ? 'border-emerald-500/40' : ''}`}>
        <CardBody className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <ContestStatusBadge contest={contest} />
                {isLive && (
                  <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> В процессе
                  </span>
                )}
                {!contest.is_public && (
                  <span className="flex items-center gap-1 text-xs text-[var(--text-3)]">
                    <Lock size={10} /> Приватный
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold text-[var(--text-1)] truncate mt-1">{contest.title}</h3>
              {contest.description && (
                <p className="text-sm text-[var(--text-3)] mt-1 line-clamp-2">{contest.description}</p>
              )}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isLive ? 'bg-emerald-500/15' : 'bg-yellow-500/15'
            }`}>
              <Trophy size={22} className={isLive ? 'text-emerald-400' : 'text-yellow-400'} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-[var(--text-3)]">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} />
              <span>{format(start, 'd MMM, HH:mm', { locale: ru })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={12} />
              {isFuture(start)
                ? <span>Через {formatDistanceToNow(start, { locale: ru })}</span>
                : isPast(end)
                ? <span>Завершился {formatDistanceToNow(end, { addSuffix: true, locale: ru })}</span>
                : <span>Осталось {formatDistanceToNow(end, { locale: ru })}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/contests/${contest.slug}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full" icon={<ArrowRight size={14} />}>
                {isLive ? 'Войти в контест' : isPast(end) ? 'Результаты' : 'Подробнее'}
              </Button>
            </Link>
            {!isPast(end) && (
              registered ? (
                <span className="text-xs text-emerald-400 font-medium px-2">✓ Записан</span>
              ) : (
                <Button
                  size="sm"
                  onClick={() => registerMut.mutate()}
                  loading={registerMut.isPending}
                  variant={isLive ? 'primary' : 'secondary'}
                >
                  Участвовать
                </Button>
              )
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────
function toInputDT(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth()+1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
}

function defaultDates() {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(12, 0, 0, 0);
  const end = new Date(start);
  end.setHours(end.getHours() + 2);
  return { starts_at: toInputDT(start), ends_at: toInputDT(end) };
}

// ─── Inline new problem form ────────────────────────────────────
interface NewProblemForm {
  title: string; description: string; input_format: string;
  output_format: string; constraints: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  topic: string;
  tests: { input: string; output: string }[];
  [key: string]: string | { input: string; output: string }[];
}

const PROBLEM_TOPICS = [
  'Массивы', 'Строки', 'Математика', 'Ввод/вывод', 'Сортировка',
  'Поиск', 'Динамическое программирование', 'Жадные алгоритмы',
  'Рекурсия', 'Графы', 'Деревья', 'Брутфорс',
];

const EMPTY_PROBLEM: NewProblemForm = {
  title: '', description: '', input_format: '', output_format: '',
  constraints: '', difficulty: 'easy', topic: '',
  tests: [{ input: '', output: '' }],
};

// ─── Create contest modal ──────────────────────────────────────
function CreateContestModal({ onClose }: { onClose: () => void }) {
  const navigate   = useNavigate();
  const qc         = useQueryClient();
  const [error, setError] = useState('');
  const [problemSearch, setProblemSearch] = useState('');
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [showNewProblem, setShowNewProblem] = useState(false);
  const [newProblem, setNewProblem] = useState<NewProblemForm>(EMPTY_PROBLEM);
  const [form, setForm] = useState({
    title: '',
    description: '',
    ...defaultDates(),
    is_public: true,
    max_participants: '',
  });

  const { data: allProblems, refetch: refetchProblems } = useQuery({
    queryKey: ['problems', 'all-for-select'],
    queryFn: () => problemsApi.list({ limit: 200 }),
  });

  const createProblemMut = useMutation({
    mutationFn: async () => {
      if (!newProblem.title.trim()) throw new Error('Введите название задачи');
      if (!newProblem.description.trim()) throw new Error('Введите условие задачи');
      if (!newProblem.input_format.trim()) throw new Error('Введите формат ввода');
      if (!newProblem.output_format.trim()) throw new Error('Введите формат вывода');
      if (!newProblem.constraints.trim()) throw new Error('Введите ограничения');
      const validTests = newProblem.tests.filter(t => t.input.trim() && t.output.trim());
      if (!validTests.length) throw new Error('Добавьте хотя бы один тест');

      const problem = await problemsApi.create({
        title: newProblem.title.trim(),
        description: newProblem.description.trim(),
        input_format: newProblem.input_format.trim(),
        output_format: newProblem.output_format.trim(),
        constraints: newProblem.constraints.trim(),
        difficulty: newProblem.difficulty,
        topic: newProblem.topic || undefined,
        is_public: false, // скрыта пока контест не завершён
      });
      for (let i = 0; i < validTests.length; i++) {
        await testCasesApi.create({
          problem_id: problem.id,
          input_data: validTests[i].input,
          expected_output: validTests[i].output,
          is_sample: i < 2,
          order_num: i,
          score: 1,
        });
      }
      return problem;
    },
    onSuccess: (problem) => {
      setSelectedProblems(prev => [...prev, problem.id]);
      setNewProblem(EMPTY_PROBLEM);
      setShowNewProblem(false);
      refetchProblems();
    },
    onError: (e: unknown) => {
      const msg = (e as { message?: string })?.message;
      setError(msg ?? 'Ошибка создания задачи');
    },
  });

  const filtered = (allProblems ?? []).filter((p: ProblemShort) =>
    p.title.toLowerCase().includes(problemSearch.toLowerCase())
  );

  const toggleProblem = (id: string) =>
    setSelectedProblems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const createMut = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) throw new Error('Введите название');
      if (!form.starts_at)    throw new Error('Укажите дату начала');
      if (!form.ends_at)      throw new Error('Укажите дату конца');
      // Append :00 to make it unambiguous for Date parsing across all browsers
      const s = new Date(form.starts_at + ':00');
      const e = new Date(form.ends_at   + ':00');
      if (isNaN(s.getTime())) throw new Error('Неверный формат даты начала');
      if (isNaN(e.getTime())) throw new Error('Неверный формат даты конца');
      if (e <= s)             throw new Error('Дата и время конца должны быть позже даты начала');

      const contest = await contestsApi.create({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        // Send as local ISO string without timezone — backend stores as-is
        starts_at: form.starts_at + ':00',
        ends_at:   form.ends_at   + ':00',
        is_public: form.is_public,
        max_participants: form.max_participants ? parseInt(form.max_participants) : undefined,
      });

      // Добавляем задачи к контесту
      for (let i = 0; i < selectedProblems.length; i++) {
        const label = String.fromCharCode(65 + i); // A, B, C, ...
        await contestsApi.addProblem(contest.id, selectedProblems[i], label).catch(() => {});
      }
      return contest;
    },
    onSuccess: (contest) => {
      qc.invalidateQueries({ queryKey: ['contests'] });
      navigate(`/contests/${contest.slug}`);
      onClose();
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string; response?: { data?: { detail?: string } } });
      setError(msg?.response?.data?.detail ?? msg?.message ?? 'Ошибка создания контеста');
    },
  });

  const f = (k: keyof typeof form, v: string | boolean) =>
    setForm(prev => {
      const next = { ...prev, [k]: v };
      // Auto-push ends_at forward if it would be <= new starts_at
      if (k === 'starts_at' && typeof v === 'string' && v) {
        const s = new Date(v + ':00');
        const e = new Date(next.ends_at + ':00');
        if (!isNaN(s.getTime()) && (isNaN(e.getTime()) || e <= s)) {
          const autoEnd = new Date(s);
          autoEnd.setHours(autoEnd.getHours() + 2);
          next.ends_at = toInputDT(autoEnd);
        }
      }
      return next;
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--text-1)] flex items-center gap-2">
            <Trophy size={20} className="text-yellow-400" /> Создать контест
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-3)] hover:bg-[var(--hover)] hover:text-[var(--text-1)] transition-all cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Title */}
          <Input
            label="Название контеста *"
            placeholder="Codeforces Round #999"
            value={form.title}
            onChange={e => f('title', e.target.value)}
          />

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-2)]">Описание</label>
            <textarea
              className="input-theme w-full rounded-lg px-3 py-2.5 text-sm resize-none h-20"
              placeholder="Краткое описание контеста..."
              value={form.description}
              onChange={e => f('description', e.target.value)}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-2)]">Начало *</label>
              <input
                type="datetime-local"
                className="input-theme w-full rounded-lg px-3 py-2.5 text-sm"
                value={form.starts_at}
                onChange={e => f('starts_at', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-2)]">Конец *</label>
              <input
                type="datetime-local"
                className="input-theme w-full rounded-lg px-3 py-2.5 text-sm"
                value={form.ends_at}
                min={form.starts_at || undefined}
                onChange={e => f('ends_at', e.target.value)}
              />
            </div>
          </div>

          {/* Type + Max participants */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-2)]">Тип</label>
              <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
                {[{ val: true, label: 'Публичный', icon: Globe }, { val: false, label: 'Приватный', icon: Lock }].map(opt => (
                  <button
                    key={String(opt.val)}
                    type="button"
                    onClick={() => f('is_public', opt.val)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                      form.is_public === opt.val
                        ? 'bg-purple-600 text-white'
                        : 'text-[var(--text-2)] hover:bg-[var(--hover)]'
                    }`}
                  >
                    <opt.icon size={13} /> {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <Input
              label="Макс. участников"
              type="number"
              placeholder="Без ограничений"
              value={form.max_participants}
              onChange={e => f('max_participants', e.target.value)}
            />
          </div>

          {/* Problems */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--text-2)]">
                Задачи{' '}
                {selectedProblems.length > 0 && (
                  <span className="text-purple-400">({selectedProblems.length} выбрано)</span>
                )}
              </label>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
              <input
                className="input-theme w-full rounded-lg pl-9 pr-3 py-2.5 text-sm"
                placeholder="Поиск задач..."
                value={problemSearch}
                onChange={e => setProblemSearch(e.target.value)}
              />
            </div>
            {/* Кнопка создания новой задачи */}
            <button
              type="button"
              onClick={() => setShowNewProblem(v => !v)}
              className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              {showNewProblem ? 'Скрыть форму' : 'Создать новую задачу для этого контеста'}
            </button>

            {/* Inline форма создания задачи */}
            {showNewProblem && (
              <div className="border border-purple-500/30 rounded-xl p-4 bg-purple-500/5 flex flex-col gap-3">
                <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide">Новая задача</p>
                {[
                  { key: 'title',         label: 'Название *',              rows: 1  },
                  { key: 'description',   label: 'Условие *',               rows: 3  },
                  { key: 'input_format',  label: 'Формат входных данных *',  rows: 2  },
                  { key: 'output_format', label: 'Формат выходных данных *', rows: 2  },
                  { key: 'constraints',   label: 'Ограничения *',            rows: 1  },
                ].map(({ key, label, rows }) => (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-xs text-[var(--text-2)] font-medium">{label}</label>
                    {rows === 1 ? (
                      <input
                        className="input-theme w-full rounded-lg px-3 py-2 text-sm"
                        value={(newProblem as Record<string, string>)[key]}
                        onChange={e => setNewProblem(p => ({ ...p, [key]: e.target.value }))}
                      />
                    ) : (
                      <textarea
                        rows={rows}
                        className="input-theme w-full rounded-lg px-3 py-2 text-sm resize-none font-mono"
                        value={(newProblem as Record<string, string>)[key]}
                        onChange={e => setNewProblem(p => ({ ...p, [key]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[var(--text-2)] font-medium">Сложность</label>
                    <select
                      className="input-theme w-full rounded-lg px-3 py-2 text-sm"
                      value={newProblem.difficulty}
                      onChange={e => setNewProblem(p => ({ ...p, difficulty: e.target.value as 'easy' | 'medium' | 'hard' | 'expert' }))}
                    >
                      <option value="easy">Лёгкая</option>
                      <option value="medium">Средняя</option>
                      <option value="hard">Сложная</option>
                      <option value="expert">Эксперт</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[var(--text-2)] font-medium">Тема</label>
                    <select
                      className="input-theme w-full rounded-lg px-3 py-2 text-sm"
                      value={newProblem.topic}
                      onChange={e => setNewProblem(p => ({ ...p, topic: e.target.value }))}
                    >
                      <option value="">— Без темы —</option>
                      {PROBLEM_TOPICS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Тесты */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-[var(--text-2)] font-medium">Тест-кейсы *</label>
                    <button
                      type="button"
                      onClick={() => setNewProblem(p => ({ ...p, tests: [...p.tests, { input: '', output: '' }] }))}
                      className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={11} /> Добавить тест
                    </button>
                  </div>
                  {newProblem.tests.map((tc, i) => (
                    <div key={i} className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] text-[var(--text-3)] mb-1">Вход #{i+1}</p>
                        <textarea rows={2} className="input-theme w-full rounded-lg px-2 py-1.5 text-xs font-mono resize-none"
                          value={tc.input} onChange={e => setNewProblem(p => ({ ...p, tests: p.tests.map((t, j) => j === i ? { ...t, input: e.target.value } : t) }))} />
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-3)] mb-1">Выход #{i+1}</p>
                        <textarea rows={2} className="input-theme w-full rounded-lg px-2 py-1.5 text-xs font-mono resize-none"
                          value={tc.output} onChange={e => setNewProblem(p => ({ ...p, tests: p.tests.map((t, j) => j === i ? { ...t, output: e.target.value } : t) }))} />
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  onClick={() => createProblemMut.mutate()}
                  loading={createProblemMut.isPending}
                  icon={<Plus size={13} />}
                >
                  Создать и добавить в контест
                </Button>
              </div>
            )}

            <div className="border border-[var(--border)] rounded-xl overflow-hidden max-h-52 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="p-4 text-center text-[var(--text-3)] text-sm">Задачи не найдены</p>
              ) : (
                filtered.map((p: ProblemShort) => {
                  const selected = selectedProblems.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProblem(p.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors cursor-pointer border-b border-[var(--border)] last:border-0 ${
                        selected ? 'bg-purple-500/10' : 'hover:bg-[var(--hover)]'
                      }`}
                    >
                      {selected
                        ? <CheckSquare size={16} className="text-purple-400 shrink-0" />
                        : <Square size={16} className="text-[var(--text-3)] shrink-0" />}
                      <span className={`flex-1 truncate ${selected ? 'text-[var(--text-1)]' : 'text-[var(--text-2)]'}`}>
                        {p.title}
                      </span>
                      <span className="text-[var(--text-3)] text-xs shrink-0">{p.difficulty}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border)]">
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
          <Button
            onClick={() => createMut.mutate()}
            loading={createMut.isPending}
            icon={<Trophy size={15} />}
          >
            Создать контест
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Status filter tabs ────────────────────────────────────────
const STATUS_TABS = [
  { value: '',         label: 'Все'          },
  { value: 'upcoming', label: 'Предстоящие'  },
  { value: 'running',  label: '🔴 Идут сейчас'},
  { value: 'finished', label: 'Завершённые'  },
];

// ─── Main page ─────────────────────────────────────────────────
export function Contests() {
  const { isAuthenticated } = useAuthStore();
  const [statusFilter, setStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data: contests, isLoading } = useQuery({
    queryKey: ['contests', statusFilter],
    queryFn: () => contestsApi.list({ limit: 50, status: statusFilter || undefined }),
    retry: false,
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-1)] flex items-center gap-3">
              <Trophy size={28} className="text-yellow-400" /> Контесты
            </h1>
            <p className="text-[var(--text-3)] mt-1">Участвуй в соревнованиях и поднимайся в рейтинге</p>
          </div>
          {isAuthenticated && (
            <Button icon={<Plus size={16} />} onClick={() => setShowCreate(true)}>
              Создать контест
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1 w-fit mb-6 shadow-sm">
        {STATUS_TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setStatus(t.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              statusFilter === t.value
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--hover)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i}><CardBody><SkeletonLine className="w-full h-40" /></CardBody></Card>
          ))}
        </div>
      ) : (contests ?? []).length === 0 ? (
        <div className="py-20 text-center text-[var(--text-3)]">
          <Trophy size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg">Контестов не найдено</p>
          {isAuthenticated && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 text-purple-400 hover:text-purple-300 text-sm underline cursor-pointer"
            >
              Создать первый контест
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(contests as Contest[]).map(c => <ContestCard key={c.id} contest={c} />)}
        </div>
      )}

      <AnimatePresence>
        {showCreate && <CreateContestModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>
    </div>
  );
}
