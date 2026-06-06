import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

// ── шаги алгоритмов (описания на русском) ────────────────────────

type BubbleStep  = { array: number[]; comparing: number[]; swapped: boolean; done: number[]; description: string };
type BinaryStep  = { array: number[]; low: number; high: number; mid: number; found: boolean; description: string };
type MergeStep   = { array: number[]; highlight: number[]; description: string };
type Step        = BubbleStep | BinaryStep | MergeStep;

function genBubble(arr: number[]): BubbleStep[] {
  const steps: BubbleStep[] = [];
  const a = [...arr];
  const n = a.length;
  const done: number[] = [];
  steps.push({ array: [...a], comparing: [], swapped: false, done: [], description: 'Исходный массив. Будем сравнивать соседние элементы.' });
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ array: [...a], comparing: [j, j+1], swapped: false, done: [...done], description: `Сравниваем ${a[j]} и ${a[j+1]} — который больше?` });
      if (a[j] > a[j+1]) {
        [a[j], a[j+1]] = [a[j+1], a[j]];
        steps.push({ array: [...a], comparing: [j, j+1], swapped: true, done: [...done], description: `${a[j+1]} > ${a[j]} — меняем местами! ↔` });
      } else {
        steps.push({ array: [...a], comparing: [j, j+1], swapped: false, done: [...done], description: `${a[j]} ≤ ${a[j+1]} — всё в порядке, не меняем.` });
      }
    }
    done.push(n - 1 - i);
  }
  done.push(0);
  steps.push({ array: [...a], comparing: [], swapped: false, done: Array.from({ length: n }, (_, i) => i), description: '✓ Готово! Массив полностью отсортирован.' });
  return steps;
}

function genBinary(arr: number[], target: number): BinaryStep[] {
  const steps: BinaryStep[] = [];
  let low = 0, high = arr.length - 1;
  steps.push({ array: arr, low, high, mid: -1, found: false, description: `Ищем число ${target}. Весь массив — наш диапазон поиска (синие элементы).` });
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    steps.push({ array: arr, low, high, mid, found: arr[mid] === target, description: `Смотрим на середину: позиция ${mid}, значение ${arr[mid]}.` });
    if (arr[mid] === target) {
      steps.push({ array: arr, low, high, mid, found: true, description: `✓ Нашли! Число ${target} находится на позиции ${mid}.` });
      break;
    } else if (arr[mid] < target) {
      low = mid + 1;
      steps.push({ array: arr, low, high, mid: -1, found: false, description: `${arr[mid]} < ${target} — ищем в правой половине, сдвигаем левую границу.` });
    } else {
      high = mid - 1;
      steps.push({ array: arr, low, high, mid: -1, found: false, description: `${arr[mid]} > ${target} — ищем в левой половине, сдвигаем правую границу.` });
    }
  }
  return steps;
}

function genMerge(arr: number[]): MergeStep[] {
  const steps: MergeStep[] = [];
  const sorted = [...arr].sort((a, b) => a - b);
  steps.push({ array: [...arr], highlight: [], description: 'Исходный массив. Алгоритм делит его на части и сливает обратно.' });
  for (let i = 0; i < arr.length; i++) {
    steps.push({ array: [...sorted.slice(0, i+1), ...arr.slice(i+1)], highlight: [i], description: `Ставим ${sorted[i]} на правильное место (позиция ${i}).` });
  }
  steps.push({ array: sorted, highlight: [], description: '✓ Готово! Все элементы расставлены по порядку.' });
  return steps;
}

// ── данные алгоритмов ─────────────────────────────────────────────

const ALGOS = [
  {
    id: 'bubble',
    title: 'Сортировка пузырьком',
    complexity: 'O(n²)',
    complexityColor: '#ef4444',
    emoji: '🫧',
    about: 'Проходит по массиву снова и снова, сравнивая соседние элементы и меняя их местами. Большие элементы "всплывают" вверх, как пузырьки.',
    steps: genBubble([64, 34, 25, 12, 22, 11, 90]),
    legend: [
      { color: '#6366f1', label: 'Обычный элемент' },
      { color: '#f59e0b', label: 'Сравниваются' },
      { color: '#22c55e', label: 'Поменяли местами' },
      { color: '#334155', label: 'Уже на месте' },
    ],
  },
  {
    id: 'binary',
    title: 'Двоичный поиск',
    complexity: 'O(log n)',
    complexityColor: '#22c55e',
    emoji: '🔍',
    about: 'Ищет элемент в отсортированном массиве. Каждый раз смотрит на середину и выбрасывает половину диапазона — поэтому очень быстро.',
    steps: genBinary([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 13),
    legend: [
      { color: '#6366f1', label: 'В диапазоне поиска' },
      { color: '#f59e0b', label: 'Середина (M)' },
      { color: '#22c55e', label: 'Найден!' },
      { color: 'rgba(255,255,255,0.1)', label: 'Отброшен' },
    ],
  },
  {
    id: 'merge',
    title: 'Сортировка слиянием',
    complexity: 'O(n log n)',
    complexityColor: '#f59e0b',
    emoji: '🔀',
    about: 'Делит массив пополам, сортирует каждую половину отдельно, затем сливает их вместе. Гораздо быстрее пузырька на больших данных.',
    steps: genMerge([38, 27, 43, 3, 9, 82, 10]),
    legend: [
      { color: '#6366f1', label: 'Ещё не отсортирован' },
      { color: '#22c55e', label: 'Поставлен на место' },
    ],
  },
] as const;

type AlgoId = typeof ALGOS[number]['id'];

// ── визуализаторы ─────────────────────────────────────────────────

function BubbleViz({ step }: { step: BubbleStep }) {
  const max = Math.max(...step.array);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10, height: 220, padding: '0 8px' }}>
      {step.array.map((val, i) => {
        const comparing = step.comparing.includes(i);
        const isDone = step.done.includes(i);
        const color = isDone ? '#1e293b'
          : comparing ? (step.swapped ? '#22c55e' : '#f59e0b')
          : '#6366f1';
        const glow = comparing
          ? (step.swapped ? 'rgba(34,197,94,0.6)' : 'rgba(245,158,11,0.6)')
          : isDone ? 'none' : 'rgba(99,102,241,0.25)';
        return (
          <motion.div
            key={i} layout
            animate={{ scaleY: 1 }}
            style={{
              flex: 1, maxWidth: 56,
              height: `${Math.max(18, (val / max) * 100)}%`,
              background: color,
              boxShadow: glow !== 'none' ? `0 0 18px ${glow}` : 'none',
              borderRadius: '7px 7px 0 0',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-start',
              paddingTop: 6, transition: 'background 0.25s, box-shadow 0.25s',
              position: 'relative',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>{val}</span>
            {comparing && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                style={{ position: 'absolute', top: -24, fontSize: 16 }}
              >
                {step.swapped ? '✓' : '↕'}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function BinaryViz({ step }: { step: BinaryStep }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap', padding: '20px 12px' }}>
      {step.array.map((val, i) => {
        const isFound = step.found && i === step.mid;
        const isMid   = i === step.mid && !step.found;
        const inRange = i >= step.low && i <= step.high;
        const borderColor = isFound ? '#22c55e' : isMid ? '#f59e0b' : inRange ? '#6366f1' : 'rgba(255,255,255,0.07)';
        const bg          = isFound ? 'rgba(34,197,94,0.18)' : isMid ? 'rgba(245,158,11,0.18)' : inRange ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.02)';
        const textColor   = inRange ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)';
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <motion.div
              animate={{ scale: (isMid || isFound) ? 1.12 : 1 }}
              transition={{ duration: 0.2 }}
              style={{
                width: 52, height: 52, borderRadius: 12,
                border: `2px solid ${borderColor}`,
                background: bg, color: textColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 800, fontFamily: 'monospace',
                boxShadow: (isFound || isMid) ? `0 0 22px ${borderColor}66` : 'none',
                transition: 'all 0.25s',
              }}
            >
              {val}
            </motion.div>
            <div style={{ height: 14, display: 'flex', gap: 2, fontSize: 10, fontFamily: 'monospace', fontWeight: 800 }}>
              {i === step.low  && <span style={{ color: '#3b82f6' }}>L</span>}
              {i === step.mid  && <span style={{ color: '#f59e0b' }}>M</span>}
              {i === step.high && <span style={{ color: '#3b82f6' }}>H</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MergeViz({ step }: { step: MergeStep }) {
  const max = Math.max(...step.array);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10, height: 220, padding: '0 8px' }}>
      {step.array.map((val, i) => {
        const isHL = step.highlight.includes(i);
        const isDone = step.highlight.length > 0 && i < step.highlight[0];
        const color = isHL ? '#22c55e' : isDone ? '#22c55e' : '#6366f1';
        const glow  = isHL ? 'rgba(34,197,94,0.6)' : isDone ? 'rgba(34,197,94,0.2)' : 'rgba(99,102,241,0.25)';
        return (
          <motion.div
            key={i} layout
            style={{
              flex: 1, maxWidth: 56,
              height: `${Math.max(18, (val / max) * 100)}%`,
              background: color, boxShadow: `0 0 14px ${glow}`,
              borderRadius: '7px 7px 0 0',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              paddingTop: 6, transition: 'background 0.3s',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>{val}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── плеер ─────────────────────────────────────────────────────────

const SPEEDS = [{ label: 'Медленно', ms: 900 }, { label: 'Нормально', ms: 500 }, { label: 'Быстро', ms: 200 }];

function Player({ algo }: { algo: typeof ALGOS[number] }) {
  const [idx, setIdx]       = useState(0);
  const [playing, setPlay]  = useState(false);
  const [speed, setSpeed]   = useState(1);

  const steps  = algo.steps as Step[];
  const step   = steps[idx];
  const isLast = idx >= steps.length - 1;

  useEffect(() => { setIdx(0); setPlay(false); }, [algo.id]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setIdx(prev => {
        if (prev >= steps.length - 1) { setPlay(false); return prev; }
        return prev + 1;
      });
    }, SPEEDS[speed].ms);
    return () => clearInterval(id);
  }, [playing, speed, steps.length]);

  const ctl: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '8px 14px', color: '#fff', cursor: 'pointer',
    fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
    transition: 'background 0.15s',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Визуализация */}
      <div style={{
        background: 'rgba(255,255,255,0.02)', borderRadius: '0 0 0 0',
        minHeight: 280, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '24px 20px 8px',
      }}>
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ width: '100%' }}>
            {algo.id === 'bubble' && <BubbleViz step={step as BubbleStep} />}
            {algo.id === 'binary' && <BinaryViz step={step as BinaryStep} />}
            {algo.id === 'merge'  && <MergeViz  step={step as MergeStep}  />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Описание шага */}
      <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', minHeight: 54, display: 'flex', alignItems: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.p key={idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', margin: 0, fontWeight: 500 }}>
            {(step as BubbleStep | BinaryStep | MergeStep).description}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Прогресс-бар */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}>
        <motion.div animate={{ width: `${((idx + 1) / steps.length) * 100}%` }} transition={{ duration: 0.2 }}
          style={{ height: '100%', background: 'linear-gradient(90deg,#6366f1,#a5b4fc)', borderRadius: 2 }} />
      </div>

      {/* Контролы */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <button style={ctl} onClick={() => { setIdx(0); setPlay(false); }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
          <SkipBack size={14} /> Сначала
        </button>
        <button style={ctl} onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
          <ChevronLeft size={14} /> Назад
        </button>
        <button
          onClick={() => setPlay(p => !p)}
          style={{ ...ctl, background: playing ? 'rgba(239,68,68,0.2)' : 'linear-gradient(135deg,#6366f1,#4f46e5)', border: 'none', padding: '8px 20px', boxShadow: playing ? 'none' : '0 0 20px rgba(99,102,241,0.4)' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
          {playing ? <><Pause size={14} /> Пауза</> : <><Play size={14} /> Играть</>}
        </button>
        <button style={ctl} onClick={() => setIdx(i => Math.min(steps.length - 1, i + 1))} disabled={isLast}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
          Вперёд <ChevronRight size={14} />
        </button>

        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
          {idx + 1} / {steps.length}
        </span>

        {/* Скорость */}
        <div style={{ display: 'flex', gap: 4 }}>
          {SPEEDS.map((s, i) => (
            <button key={i} onClick={() => setSpeed(i)} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 7, border: '1px solid', cursor: 'pointer', transition: 'all 0.15s', borderColor: speed === i ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.1)', background: speed === i ? 'rgba(99,102,241,0.2)' : 'transparent', color: speed === i ? '#a5b4fc' : 'rgba(255,255,255,0.35)' }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── страница ──────────────────────────────────────────────────────

export function Visualizations() {
  const [activeId, setActiveId] = useState<AlgoId>('bubble');
  const algo = ALGOS.find(a => a.id === activeId)!;

  return (
    <div style={{ background: '#04080f', minHeight: 'calc(100vh - 56px)', padding: '32px 28px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Заголовок */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Zap size={24} color="#fbbf24" />
            Визуализация алгоритмов
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Смотри как работают алгоритмы по шагам — жми Играть или переключайся вручную
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>

          {/* Список алгоритмов */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ALGOS.map((a, i) => (
              <motion.button
                key={a.id}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }}
                onClick={() => setActiveId(a.id as AlgoId)}
                style={{
                  textAlign: 'left', padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                  border: `1px solid ${activeId === a.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.07)'}`,
                  background: activeId === a.id ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.025)',
                  boxShadow: activeId === a.id ? '0 0 24px rgba(99,102,241,0.2)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{a.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, fontFamily: 'monospace', padding: '2px 8px', borderRadius: 6, background: `${a.complexityColor}22`, color: a.complexityColor }}>
                    {a.complexity}
                  </span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: activeId === a.id ? '#a5b4fc' : 'rgba(255,255,255,0.8)', margin: '0 0 4px' }}>{a.title}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.5 }}>{a.about}</p>
              </motion.button>
            ))}

            {/* Легенда цветов */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.4 }}
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px', marginTop: 4 }}
            >
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Цвета</p>
              <AnimatePresence mode="wait">
                <motion.div key={activeId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {algo.legend.map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 14, height: 14, borderRadius: 4, background: l.color, flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }} />
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{l.label}</span>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Плеер */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.45 }}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}
          >
            {/* Шапка карточки */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>{algo.emoji}</span>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>{algo.title}</h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{algo.about}</p>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 800, fontFamily: 'monospace', padding: '4px 12px', borderRadius: 8, background: `${algo.complexityColor}22`, color: algo.complexityColor, flexShrink: 0 }}>
                {algo.complexity}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <Player algo={algo} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
