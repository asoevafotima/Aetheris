import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { problemsApi, testCasesApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const DIFFICULTY_OPTIONS = [
  { value: 'easy',   label: 'Легко'     },
  { value: 'medium', label: 'Средне'    },
  { value: 'hard',   label: 'Сложно'    },
  { value: 'expert', label: 'Эксперт'   },
];

const TOPICS = [
  'Массивы', 'Строки', 'Математика', 'Ввод/вывод',
  'Сортировка', 'Поиск', 'Динамическое программирование',
  'Жадные алгоритмы', 'Рекурсия', 'Графы', 'Деревья',
  'Стеки и очереди', 'Хэш-таблицы', 'Геометрия', 'Брутфорс',
];

interface TestCaseRow {
  input_data: string;
  expected_output: string;
  is_sample: boolean;
  score: number;
}

function Textarea({ label, value, onChange, placeholder, rows = 4, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--text-2)]">{label}</label>
      {hint && <p className="text-xs text-[var(--text-3)]">{hint}</p>}
      <textarea
        className="input-theme w-full rounded-xl px-3 py-2.5 text-sm resize-y font-mono"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--text-2)]">{label}</label>
      {hint && <p className="text-xs text-[var(--text-3)]">{hint}</p>}
      {children}
    </div>
  );
}

export function CreateProblem() {
  const navigate = useNavigate();

  const [title, setTitle]             = useState('');
  const [description, setDesc]        = useState('');
  const [inputFmt, setInputFmt]       = useState('');
  const [outputFmt, setOutputFmt]     = useState('');
  const [constraints, setConstraints] = useState('');
  const [difficulty, setDifficulty]   = useState<'easy' | 'medium' | 'hard' | 'expert'>('easy');
  const [diffCode, setDiffCode]       = useState('');
  const [topic, setTopic]             = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [timeLimitMs, setTimeLimit]   = useState(2000);
  const [memLimitMb, setMemLimit]     = useState(256);
  const [testCases, setTestCases]     = useState<TestCaseRow[]>([
    { input_data: '', expected_output: '', is_sample: true, score: 1 },
  ]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError]             = useState('');

  const createProblemMut = useMutation({
    mutationFn: (data: Parameters<typeof problemsApi.create>[0]) =>
      problemsApi.create(data),
  });

  const handleSubmit = async () => {
    setError('');
    if (!title.trim()) { setError('Введите название задачи'); return; }
    if (!description.trim()) { setError('Введите условие задачи'); return; }
    if (!inputFmt.trim()) { setError('Опишите формат входных данных'); return; }
    if (!outputFmt.trim()) { setError('Опишите формат выходных данных'); return; }
    if (!constraints.trim()) { setError('Укажите ограничения'); return; }
    if (testCases.length === 0) { setError('Добавьте хотя бы один тест'); return; }
    if (testCases.some(tc => !tc.input_data.trim() || !tc.expected_output.trim())) {
      setError('Заполните все поля тест-кейсов'); return;
    }

    const finalTopic = topic === '__custom__' ? customTopic.trim() : topic || undefined;
    const finalCode = diffCode.trim().toLowerCase() || undefined;

    try {
      const problem = await createProblemMut.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        input_format: inputFmt.trim(),
        output_format: outputFmt.trim(),
        constraints: constraints.trim(),
        difficulty,
        difficulty_code: finalCode,
        topic: finalTopic,
        time_limit_ms: timeLimitMs,
        memory_limit_mb: memLimitMb,
        is_public: true,
      });

      // Create test cases sequentially
      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        await testCasesApi.create({
          problem_id: problem.id,
          input_data: tc.input_data,
          expected_output: tc.expected_output,
          is_sample: tc.is_sample,
          order_num: i,
          score: tc.score,
        });
      }

      navigate(`/problems/${problem.slug}`);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? 'Ошибка при создании задачи');
    }
  };

  const addTestCase = () => setTestCases(prev => [
    ...prev,
    { input_data: '', expected_output: '', is_sample: false, score: 1 },
  ]);

  const removeTestCase = (i: number) =>
    setTestCases(prev => prev.filter((_, idx) => idx !== i));

  const updateTestCase = (i: number, patch: Partial<TestCaseRow>) =>
    setTestCases(prev => prev.map((tc, idx) => idx === i ? { ...tc, ...patch } : tc));

  const loading = createProblemMut.isPending;

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => navigate('/problems')}
          className="inline-flex items-center gap-1.5 text-[var(--text-3)] hover:text-[var(--text-1)] text-sm mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Задачи
        </button>
        <h1 className="text-2xl font-bold text-[var(--text-1)] mb-6">Создать задачу</h1>
      </motion.div>

      <div className="flex flex-col gap-5">
        {/* Основная информация */}
        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-[var(--text-2)] uppercase tracking-wide">Основное</h2>

          <Field label="Название задачи">
            <Input
              placeholder="Например: Сумма двух чисел"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </Field>

          <Textarea
            label="Условие задачи"
            value={description}
            onChange={setDesc}
            placeholder="Подробно опишите задачу..."
            rows={5}
          />

          <Textarea
            label="Формат входных данных"
            value={inputFmt}
            onChange={setInputFmt}
            placeholder="Первая строка содержит..."
            rows={3}
          />

          <Textarea
            label="Формат выходных данных"
            value={outputFmt}
            onChange={setOutputFmt}
            placeholder="Выведите..."
            rows={3}
          />

          <Textarea
            label="Ограничения"
            value={constraints}
            onChange={setConstraints}
            placeholder="1 ≤ n ≤ 10^5, 1 ≤ a_i ≤ 10^9"
            rows={2}
          />
        </section>

        {/* Сложность и тема */}
        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-[var(--text-2)] uppercase tracking-wide">Сложность и тема</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Уровень сложности">
              <select
                className="input-theme w-full rounded-xl px-3 py-2.5 text-sm"
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard' | 'expert')}
              >
                {DIFFICULTY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>

            <Field
              label="Код сложности"
              hint="A = самая лёгкая, A1 = чуть сложнее, B, ..., Z, Z1"
            >
              <Input
                placeholder="a, a1, b, c, z, z1..."
                value={diffCode}
                onChange={e => setDiffCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
              />
            </Field>
          </div>

          <Field label="Тема задачи">
            <select
              className="input-theme w-full rounded-xl px-3 py-2.5 text-sm"
              value={topic}
              onChange={e => setTopic(e.target.value)}
            >
              <option value="">— Без темы —</option>
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              <option value="__custom__">Другая тема...</option>
            </select>
          </Field>

          {topic === '__custom__' && (
            <Field label="Своя тема">
              <Input
                placeholder="Введите название темы"
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
              />
            </Field>
          )}
        </section>

        {/* Тест-кейсы */}
        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-2)] uppercase tracking-wide">
              Тест-кейсы
              <span className="ml-2 text-xs font-normal text-[var(--text-3)] normal-case">
                ({testCases.length})
              </span>
            </h2>
            <Button size="sm" variant="outline" icon={<Plus size={13} />} onClick={addTestCase}>
              Добавить тест
            </Button>
          </div>

          <p className="text-xs text-[var(--text-3)]">
            Отметьте "Показывать" для примеров, которые будут видны участникам в условии задачи.
          </p>

          {testCases.map((tc, i) => (
            <div key={i} className="border border-[var(--border)] rounded-xl p-4 flex flex-col gap-3 bg-[var(--surface-2)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-3)]">Тест #{i + 1}</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-[var(--text-2)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tc.is_sample}
                      onChange={e => updateTestCase(i, { is_sample: e.target.checked })}
                      className="accent-purple-500"
                    />
                    Показывать участникам
                  </label>
                  {testCases.length > 1 && (
                    <button
                      onClick={() => removeTestCase(i)}
                      className="text-[var(--text-3)] hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[var(--text-3)] mb-1">Входные данные</p>
                  <textarea
                    className="input-theme w-full rounded-lg px-2.5 py-2 text-xs font-mono resize-y"
                    rows={4}
                    placeholder="Входные данные..."
                    value={tc.input_data}
                    onChange={e => updateTestCase(i, { input_data: e.target.value })}
                  />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-3)] mb-1">Ожидаемый вывод</p>
                  <textarea
                    className="input-theme w-full rounded-lg px-2.5 py-2 text-xs font-mono resize-y"
                    rows={4}
                    placeholder="Правильный ответ..."
                    value={tc.expected_output}
                    onChange={e => updateTestCase(i, { expected_output: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Дополнительно */}
        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-5 text-sm font-semibold text-[var(--text-2)] uppercase tracking-wide cursor-pointer hover:bg-[var(--hover)] transition-colors"
            onClick={() => setShowAdvanced(v => !v)}
          >
            Дополнительно (лимиты)
            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showAdvanced && (
            <div className="px-5 pb-5 grid sm:grid-cols-2 gap-4">
              <Field label="Лимит времени (мс)">
                <Input
                  type="number"
                  value={String(timeLimitMs)}
                  onChange={e => setTimeLimit(Number(e.target.value))}
                  placeholder="2000"
                />
              </Field>
              <Field label="Лимит памяти (МБ)">
                <Input
                  type="number"
                  value={String(memLimitMb)}
                  onChange={e => setMemLimit(Number(e.target.value))}
                  placeholder="256"
                />
              </Field>
            </div>
          )}
        </section>

        {/* Ошибка */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Кнопки */}
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => navigate('/problems')} disabled={loading}>
            Отмена
          </Button>
          <Button icon={<Save size={15} />} onClick={handleSubmit} loading={loading}>
            Опубликовать задачу
          </Button>
        </div>
      </div>
    </div>
  );
}
