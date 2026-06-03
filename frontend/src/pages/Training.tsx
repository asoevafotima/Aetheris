import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Play, CheckCircle, Circle, Trophy,
  ArrowLeft, ArrowRight, Flame, Target,
  ChevronRight, Loader2, Star,
} from 'lucide-react';
import { trainingApi, problemsApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';
import { SkeletonLine } from '../components/ui/Spinner';
import { DifficultyBadge } from '../components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { TrainingPlan, ProblemShort } from '../types';

// ── Константы ────────────────────────────────────────────────────
const TOPICS = [
  { id: 'Массивы',                    icon: '📊', color: 'border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10'   },
  { id: 'Строки',                     icon: '🔤', color: 'border-green-500/40 bg-green-500/5 hover:bg-green-500/10' },
  { id: 'Математика',                  icon: '🔢', color: 'border-yellow-500/40 bg-yellow-500/5 hover:bg-yellow-500/10' },
  { id: 'Ввод/вывод',                  icon: '📥', color: 'border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/10'   },
  { id: 'Сортировка',                  icon: '↕️', color: 'border-orange-500/40 bg-orange-500/5 hover:bg-orange-500/10' },
  { id: 'Поиск',                      icon: '🔍', color: 'border-pink-500/40 bg-pink-500/5 hover:bg-pink-500/10'   },
  { id: 'Динамическое программирование', icon: '🧩', color: 'border-purple-500/40 bg-purple-500/5 hover:bg-purple-500/10' },
  { id: 'Жадные алгоритмы',            icon: '⚡', color: 'border-red-500/40 bg-red-500/5 hover:bg-red-500/10'     },
  { id: 'Рекурсия',                   icon: '🔄', color: 'border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10' },
  { id: 'Графы',                      icon: '🕸️', color: 'border-teal-500/40 bg-teal-500/5 hover:bg-teal-500/10'   },
  { id: 'Деревья',                    icon: '🌳', color: 'border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10' },
  { id: 'Брутфорс',                   icon: '💪', color: 'border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10'   },
];

const DIFFICULTIES = [
  { value: '',       label: 'Любая',   color: 'text-[var(--text-2)]' },
  { value: 'easy',   label: 'Лёгкая',  color: 'text-emerald-400' },
  { value: 'medium', label: 'Средняя', color: 'text-yellow-400' },
  { value: 'hard',   label: 'Сложная', color: 'text-orange-400' },
  { value: 'expert', label: 'Эксперт', color: 'text-red-400' },
];

const MODULE_SIZE = 5;

// ── Типы ─────────────────────────────────────────────────────────
interface PlanItem {
  id: string;
  plan_id: string;
  problem_id: string;
  problem?: { id: string; title: string; slug: string; difficulty: string };
  order_num: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completed_at?: string;
}

// ── Карточка модуля ───────────────────────────────────────────────
function ModuleCard({ plan, onOpen }: { plan: TrainingPlan; onOpen: () => void }) {
  const { data: items } = useQuery({
    queryKey: ['training-items', plan.id],
    queryFn: () => trainingApi.items(plan.id),
  });

  const list = (items ?? []) as PlanItem[];
  const total = list.length;
  const done  = list.filter(i => i.status === 'completed').length;
  const pct   = total > 0 ? Math.round(done / total * 100) : 0;
  const isComplete = total > 0 && done === total;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-[var(--surface)] border rounded-2xl p-5 flex flex-col gap-4 cursor-pointer transition-all ${
        isComplete ? 'border-emerald-500/40' : 'border-[var(--border)] hover:border-purple-500/40'
      }`}
      onClick={onOpen}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
            isComplete ? 'bg-emerald-500/15' : 'bg-purple-500/15'
          }`}>
            {isComplete ? '✅' : '📚'}
          </div>
          <div>
            <p className="font-semibold text-[var(--text-1)] text-sm">{plan.title}</p>
            <p className="text-xs text-[var(--text-3)]">
              {formatDistanceToNow(new Date(plan.created_at), { addSuffix: true, locale: ru })}
            </p>
          </div>
        </div>
        {isComplete ? (
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
            Завершён
          </span>
        ) : (
          <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-full font-medium">
            {done}/{total}
          </span>
        )}
      </div>

      {/* Прогресс бар */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-[var(--text-3)]">
          <span>Прогресс</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete ? 'bg-emerald-400' : 'bg-purple-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        {plan.description && (
          <p className="text-xs text-[var(--text-3)] truncate flex-1 mr-2">{plan.description}</p>
        )}
        <span className="text-xs text-purple-400 flex items-center gap-1 shrink-0">
          {isComplete ? 'Результаты' : 'Продолжить'} <ChevronRight size={12} />
        </span>
      </div>
    </motion.div>
  );
}

// ── Экран настройки ───────────────────────────────────────────────
function SetupScreen({ onStart, onBack }: {
  onStart: (topic: string, difficulty: string, concern: string) => void;
  onBack: () => void;
}) {
  const [topic, setTopic]       = useState('');
  const [difficulty, setDiff]   = useState('');
  const [concern, setConcern]   = useState('');

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[var(--text-3)] hover:text-[var(--text-1)] mb-6 transition-colors cursor-pointer">
        <ArrowLeft size={14} /> Назад
      </button>

      <h2 className="text-xl font-bold text-[var(--text-1)] mb-1">Новый модуль тренировки</h2>
      <p className="text-[var(--text-3)] text-sm mb-6">Выбери тему и мы подберём задачи специально для тебя</p>

      {/* Темы */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-[var(--text-2)] mb-3">Тема <span className="text-red-400">*</span></p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TOPICS.map(t => (
            <button
              key={t.id}
              onClick={() => setTopic(t.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                topic === t.id
                  ? 'border-purple-500 bg-purple-500/15 text-purple-300'
                  : `${t.color} text-[var(--text-2)]`
              }`}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              <span className="text-sm font-medium truncate">{t.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Сложность */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-[var(--text-2)] mb-3">Сложность задач</p>
        <div className="flex gap-2 flex-wrap">
          {DIFFICULTIES.map(d => (
            <button
              key={d.value}
              onClick={() => setDiff(d.value)}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                difficulty === d.value
                  ? 'border-purple-500 bg-purple-500/15 text-purple-300'
                  : 'border-[var(--border)] hover:border-[var(--border-hover)] text-[var(--text-2)]'
              } ${d.color}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Что беспокоит */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-[var(--text-2)] mb-1">Что вызывает затруднения?</p>
        <p className="text-xs text-[var(--text-3)] mb-2">Необязательно — поможет подобрать нужные задачи</p>
        <textarea
          rows={3}
          className="input-theme w-full rounded-xl px-3 py-2.5 text-sm resize-none"
          placeholder="Например: не понимаю как обходить двумерные массивы, путаюсь с индексами..."
          value={concern}
          onChange={e => setConcern(e.target.value)}
        />
      </div>

      <Button
        icon={<Play size={16} />}
        size="lg"
        className="w-full"
        disabled={!topic}
        onClick={() => onStart(topic, difficulty, concern)}
      >
        Создать модуль ({MODULE_SIZE} задач)
      </Button>
      {/* Ошибка «нет задач по теме» передаётся снаружи через onStart */}
    </motion.div>
  );
}

// ── Экран практики ────────────────────────────────────────────────
function PracticeScreen({ planId, onBack, onComplete }: {
  planId: string;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  const { data: planData } = useQuery({
    queryKey: ['training-plan', planId],
    queryFn: () => trainingApi.get(planId),
  });

  const { data: itemsData, isLoading } = useQuery({
    queryKey: ['training-items', planId],
    queryFn: () => trainingApi.items(planId),
    refetchInterval: 5000, // автообновление каждые 5 секунд
  });

  const items = (itemsData ?? []) as PlanItem[];
  const total = items.length;
  const done  = items.filter(i => i.status === 'completed').length;
  const pct   = total > 0 ? Math.round(done / total * 100) : 0;
  const activeItem = items[activeIdx];

  // Проверяем завершение
  if (total > 0 && done === total) {
    onComplete();
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1,2,3].map(i => <SkeletonLine key={i} className="w-full h-16" />)}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
      {/* Шапка */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors cursor-pointer">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--text-1)] truncate">{planData?.title}</p>
          <p className="text-xs text-[var(--text-3)]">{done} из {total} выполнено</p>
        </div>
        <span className="text-sm font-bold text-purple-400">{pct}%</span>
      </div>

      {/* Прогресс бар */}
      <div className="w-full h-2.5 bg-[var(--surface-2)] rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-5">
        {/* Список задач */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="p-3 border-b border-[var(--border)]">
            <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wide">Задачи модуля</p>
          </div>
          <div className="flex flex-col divide-y divide-[var(--border)]">
            {items.map((item, i) => {
              const isActive = i === activeIdx;
              const isDone = item.status === 'completed';
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveIdx(i)}
                  className={`flex items-center gap-3 px-4 py-3.5 text-left transition-all cursor-pointer ${
                    isActive ? 'bg-purple-500/10 border-l-2 border-purple-500' : 'hover:bg-[var(--hover)] border-l-2 border-transparent'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                  ) : isActive ? (
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-purple-500 bg-purple-500/20 shrink-0" />
                  ) : (
                    <Circle size={18} className="text-[var(--text-3)] shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      isDone ? 'text-[var(--text-3)] line-through' : 'text-[var(--text-1)]'
                    }`}>
                      {i + 1}. {item.problem?.title ?? 'Загрузка...'}
                    </p>
                    {item.problem?.difficulty && (
                      <p className={`text-xs mt-0.5 ${
                        item.problem.difficulty === 'easy'   ? 'text-emerald-400' :
                        item.problem.difficulty === 'medium' ? 'text-yellow-400'  :
                        item.problem.difficulty === 'hard'   ? 'text-orange-400'  : 'text-red-400'
                      }`}>
                        {item.problem.difficulty === 'easy'   ? 'Лёгкая'  :
                         item.problem.difficulty === 'medium' ? 'Средняя' :
                         item.problem.difficulty === 'hard'   ? 'Сложная' : 'Эксперт'}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Активная задача */}
        {activeItem && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4">
            {activeItem.status === 'completed' ? (
              <div className="flex flex-col items-center justify-center h-full py-10 gap-3 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle size={32} className="text-emerald-400" />
                </div>
                <p className="font-semibold text-[var(--text-1)]">Задача решена!</p>
                <p className="text-sm text-[var(--text-3)]">{activeItem.problem?.title}</p>
                {activeIdx < items.length - 1 && (
                  <Button size="sm" icon={<ArrowRight size={14} />} onClick={() => setActiveIdx(activeIdx + 1)}>
                    Следующая задача
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-[var(--text-1)]">
                      {activeItem.problem?.title ?? 'Загрузка...'}
                    </h3>
                    {activeItem.problem?.difficulty && (
                      <DifficultyBadge difficulty={activeItem.problem.difficulty as 'easy' | 'medium' | 'hard' | 'expert'} />
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-3)]">Задача {activeIdx + 1} из {total}</p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text-2)]">
                  💡 Открой задачу, реши её, затем вернись и отметь как выполненную
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-3)] flex items-center gap-2">
                  <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                  Реши задачу — прогресс обновится автоматически
                </div>

                <div className="flex flex-col gap-3 mt-auto">
                  {activeItem.problem?.slug && (
                    <Link to={`/problems/${activeItem.problem.slug}`} target="_blank" rel="noopener noreferrer">
                      <Button icon={<Play size={15} />} className="w-full" size="lg">
                        Открыть задачу
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Навигация */}
                <div className="flex justify-between pt-2 border-t border-[var(--border)]">
                  <button
                    onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
                    disabled={activeIdx === 0}
                    className="text-sm text-[var(--text-3)] hover:text-[var(--text-1)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ArrowLeft size={14} /> Предыдущая
                  </button>
                  <button
                    onClick={() => setActiveIdx(Math.min(items.length - 1, activeIdx + 1))}
                    disabled={activeIdx === items.length - 1}
                    className="text-sm text-[var(--text-3)] hover:text-[var(--text-1)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    Следующая <ArrowRight size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Экран завершения ─────────────────────────────────────────────
function CompleteScreen({ plan, onNewModule, onBack }: {
  plan: TrainingPlan | null;
  onNewModule: () => void;
  onBack: () => void;
}) {
  const { data: items } = useQuery({
    queryKey: ['training-items', plan?.id],
    queryFn: () => trainingApi.items(plan!.id),
    enabled: !!plan,
  });

  const list = (items ?? []) as PlanItem[];
  const completed = list.filter(i => i.status === 'completed');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
        className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border-2 border-yellow-400/40 flex items-center justify-center mb-6"
      >
        <Trophy size={52} className="text-yellow-400" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-3xl font-black text-[var(--text-1)] mb-2">Модуль завершён! 🎉</h2>
        <p className="text-[var(--text-3)] text-lg mb-2">{plan?.title}</p>
        <p className="text-[var(--text-2)] text-sm mb-8">
          Ты решил {completed.length} из {list.length} задач. Отличная работа!
        </p>

        {/* Звёзды */}
        <div className="flex justify-center gap-2 mb-8">
          {Array(Math.min(5, Math.round(completed.length / list.length * 5))).fill(0).map((_, i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }}>
              <Star size={28} className="text-yellow-400 fill-yellow-400" />
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button icon={<Flame size={16} />} size="lg" onClick={onNewModule}>
            Начать новый модуль
          </Button>
          <Button variant="outline" icon={<ArrowLeft size={16} />} size="lg" onClick={onBack}>
            Мои тренировки
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Главная страница ─────────────────────────────────────────────
export function Training() {
  const qc = useQueryClient();
  const [mode, setMode] = useState<'home' | 'setup' | 'practice' | 'complete'>('home');
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [noProblemsError, setNoProblemsError] = useState<string | null>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['training-plans'],
    queryFn: trainingApi.list,
  });

  const activePlan = activePlanId
    ? (plans as TrainingPlan[] ?? []).find(p => p.id === activePlanId) ?? null
    : null;

  const handleStart = async (topic: string, difficulty: string, concern: string) => {
    setCreating(true);
    setNoProblemsError(null);
    try {
      // Сначала проверяем — есть ли задачи по этой теме
      const params: Record<string, string | number> = { limit: MODULE_SIZE * 3, topic };
      if (difficulty) params.difficulty = difficulty;

      const allProblems = await problemsApi.list(params as Parameters<typeof problemsApi.list>[0]);
      const problems = allProblems as ProblemShort[];

      if (problems.length === 0) {
        setNoProblemsError(`По теме "${topic}" задач пока нет.`);
        return;
      }

      // Создаём план
      const desc = concern.trim()
        ? `${topic} · ${concern.trim().slice(0, 100)}`
        : topic;

      const plan = await trainingApi.create({
        title: `${topic} — Модуль`,
        description: desc,
      });

      // Перемешиваем и берём MODULE_SIZE задач
      const shuffled = [...problems].sort(() => Math.random() - 0.5).slice(0, MODULE_SIZE);
      for (let i = 0; i < shuffled.length; i++) {
        await trainingApi.addItem({ plan_id: plan.id, problem_id: shuffled[i].id, order_num: i });
      }

      await qc.invalidateQueries({ queryKey: ['training-plans'] });
      setActivePlanId(plan.id);
      setMode('practice');
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const openPlan = (planId: string) => {
    setActivePlanId(planId);
    setMode('practice');
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      {/* Шапка — показываем только на home */}
      {mode === 'home' && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-1)] flex items-center gap-3 mb-1">
                <BookOpen size={26} className="text-emerald-400" /> Тренировки
              </h1>
              <p className="text-[var(--text-3)] text-sm">Выбери тему — и мы подберём задачи для практики</p>
            </div>
            <Button icon={<Target size={16} />} size="lg" onClick={() => setMode('setup')}>
              Начать тренировку
            </Button>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {mode === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Быстрый старт по теме */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-[var(--text-2)] uppercase tracking-wide mb-4">
                Быстрый старт по теме
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {TOPICS.slice(0, 8).map(t => (
                  <motion.button
                    key={t.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleStart(t.id, '', '')}
                    disabled={creating}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${t.color}`}
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <span className="text-sm font-semibold text-[var(--text-1)]">{t.id}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Мои модули */}
            <div>
              <p className="text-sm font-semibold text-[var(--text-2)] uppercase tracking-wide mb-4">
                Мои модули
              </p>
              {isLoading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[1,2].map(i => <SkeletonLine key={i} className="h-32 w-full" />)}
                </div>
              ) : (plans as TrainingPlan[] ?? []).length === 0 ? (
                <div className="py-12 text-center text-[var(--text-3)] border border-dashed border-[var(--border)] rounded-2xl">
                  <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Ещё нет модулей — начни первую тренировку</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {(plans as TrainingPlan[]).map(p => (
                    <ModuleCard key={p.id} plan={p} onOpen={() => openPlan(p.id)} />
                  ))}
                </div>
              )}
            </div>

            {noProblemsError && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                {noProblemsError}
              </div>
            )}
            {creating && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 flex flex-col items-center gap-4">
                  <Loader2 size={32} className="animate-spin text-purple-500" />
                  <p className="font-semibold text-[var(--text-1)]">Создаём модуль...</p>
                  <p className="text-sm text-[var(--text-3)]">Подбираем задачи по теме</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {mode === 'setup' && (
          <motion.div key="setup">
            <SetupScreen
              onStart={(topic, diff, concern) => handleStart(topic, diff, concern)}
              onBack={() => { setMode('home'); setNoProblemsError(null); }}
            />
            {noProblemsError && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                {noProblemsError}
              </div>
            )}
            {creating && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 flex flex-col items-center gap-4">
                  <Loader2 size={32} className="animate-spin text-purple-500" />
                  <p className="font-semibold text-[var(--text-1)]">Создаём модуль...</p>
                  <p className="text-sm text-[var(--text-3)]">Подбираем задачи по теме</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {mode === 'practice' && activePlanId && (
          <motion.div key="practice">
            <PracticeScreen
              planId={activePlanId}
              onBack={() => setMode('home')}
              onComplete={() => setMode('complete')}
            />
          </motion.div>
        )}

        {mode === 'complete' && (
          <motion.div key="complete">
            <CompleteScreen
              plan={activePlan}
              onNewModule={() => { setActivePlanId(null); setMode('setup'); }}
              onBack={() => setMode('home')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
