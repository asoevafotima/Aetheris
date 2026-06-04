import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Code2, Bookmark, BookmarkCheck, Plus } from 'lucide-react';
import { problemsApi, tagsApi, bookmarksApi } from '../api/endpoints';
import { Input, Select } from '../components/ui/Input';
import { DifficultyBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SkeletonLine } from '../components/ui/Spinner';
import { useT } from '../i18n';
import { useAuthStore } from '../store/authStore';
import type { ProblemShort } from '../types';

const TOPICS = [
  'Массивы', 'Строки', 'Математика', 'Ввод/вывод',
  'Сортировка', 'Поиск', 'Динамическое программирование',
  'Жадные алгоритмы', 'Рекурсия', 'Графы', 'Деревья',
  'Стеки и очереди', 'Хэш-таблицы', 'Геометрия', 'Брутфорс',
];

export function Problems() {
  const t                             = useT();
  const { user }                      = useAuthStore();
  const [search, setSearch]           = useState('');
  const [difficulty, setDiff]         = useState('');
  const [topic, setTopic]             = useState('');
  const [page, setPage]               = useState(0);
  const limit = 20;

  const DIFFICULTIES = [
    { value: '',       label: t.problems.all_diff },
    { value: 'easy',   label: t.problems.easy     },
    { value: 'medium', label: t.problems.medium   },
    { value: 'hard',   label: t.problems.hard     },
    { value: 'expert', label: t.problems.expert   },
  ];

  const { data: problems, isLoading } = useQuery({
    queryKey: ['problems', difficulty, topic, page],
    queryFn: () => problemsApi.list({
      skip: page * limit,
      limit,
      difficulty: difficulty || undefined,
      topic: topic || undefined,
    }),
  });
  const { data: tags }      = useQuery({ queryKey: ['tags'], queryFn: tagsApi.list });
  const { data: bookmarks, refetch: refetchBm } = useQuery({ queryKey: ['bookmarks'], queryFn: bookmarksApi.list });

  const bookmarkedIds = new Set(((bookmarks ?? []) as { problem_id: string }[]).map(b => b.problem_id));
  const filtered = (problems ?? []).filter((p: ProblemShort) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBm = async (e: React.MouseEvent, pid: string) => {
    e.preventDefault();
    try {
      if (bookmarkedIds.has(pid)) await bookmarksApi.remove(pid);
      else await bookmarksApi.add(pid);
      refetchBm();
    } catch {}
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-app-1 mb-1">{t.problems.title}</h1>
            <p className="text-app-2">{t.problems.subtitle}</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'moderator') && (
            <Link to="/problems/create">
              <Button icon={<Plus size={15} />}>Создать задачу</Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Фильтры */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <Input
            placeholder={t.common.search + '…'}
            icon={<Search size={16} />}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            options={DIFFICULTIES}
            value={difficulty}
            onChange={e => { setDiff(e.target.value); setPage(0); }}
          />
        </div>
        <div className="w-full sm:w-52">
          <Select
            options={[{ value: '', label: 'Все темы' }, ...TOPICS.map(t => ({ value: t, label: t }))]}
            value={topic}
            onChange={e => { setTopic(e.target.value); setPage(0); }}
          />
        </div>
      </div>

      {/* Теги */}
      {tags && (tags as { id: string; name: string }[]).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {(tags as { id: string; name: string }[]).slice(0, 15).map(tag => (
            <button
              key={tag.id}
              className="px-3 py-1 text-xs rounded-full border border-[var(--border)] bg-[var(--surface)] text-app-3 hover:border-purple-400 hover:text-purple-600 hover:bg-[var(--accent-light)] transition-all cursor-pointer"
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Таблица */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-app overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-app-3 uppercase tracking-wider w-12">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-app-3 uppercase tracking-wider">Задача</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-app-3 uppercase tracking-wider hidden sm:table-cell">Код</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-app-3 uppercase tracking-wider">{t.problems.difficulty}</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-app-3 uppercase tracking-wider hidden md:table-cell">Тема</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-app-3 uppercase tracking-wider">{t.problems.solved}</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array(12).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--border)]">
                    <td colSpan={7} className="px-4 py-4"><SkeletonLine className="w-full" /></td>
                  </tr>
                ))
              : filtered.map((p: ProblemShort, i: number) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-[var(--border)] hover:bg-[var(--hover)] transition-colors group"
                  >
                    <td className="px-4 py-4 text-app-3 text-sm font-mono">{page * limit + i + 1}</td>
                    <td className="px-4 py-4">
                      <Link
                        to={`/problems/${p.slug}`}
                        className="text-app-1 hover:text-purple-600 dark:hover:text-purple-400 font-medium text-sm transition-colors flex items-center gap-2"
                      >
                        <Code2 size={14} className="text-app-3 shrink-0" />
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-3 py-4 hidden sm:table-cell">
                      {p.difficulty_code ? (
                        <span className="font-mono text-xs font-bold text-purple-400 uppercase bg-purple-500/10 px-2 py-0.5 rounded">
                          {p.difficulty_code.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-[var(--text-3)] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-3 py-4"><DifficultyBadge difficulty={p.difficulty} /></td>
                    <td className="px-3 py-4 hidden md:table-cell">
                      {p.topic ? (
                        <span className="text-xs text-[var(--text-2)] bg-[var(--surface-2)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                          {p.topic}
                        </span>
                      ) : (
                        <span className="text-[var(--text-3)] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-app-3 font-mono">
                      {p.solve_count.toLocaleString()}
                    </td>
                    <td className="px-3 py-4 text-right">
                      <button
                        onClick={e => toggleBm(e, p.id)}
                        className="text-app-3 hover:text-yellow-500 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        {bookmarkedIds.has(p.id)
                          ? <BookmarkCheck size={16} className="text-yellow-500" />
                          : <Bookmark size={16} />}
                      </button>
                    </td>
                  </motion.tr>
                ))
            }
          </tbody>
        </table>
        {!isLoading && filtered.length === 0 && (
          <div className="py-16 text-center text-app-3">
            <Code2 size={40} className="mx-auto mb-3 opacity-20" />
            <p>{t.problems.not_found}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button variant="outline" size="sm" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
          ← {t.common.back}
        </Button>
        <span className="text-app-3 text-sm">{page + 1}</span>
        <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={(problems?.length ?? 0) < limit}>
          {t.common.next} →
        </Button>
      </div>
    </div>
  );
}
