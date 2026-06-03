import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Code2, Bookmark, BookmarkCheck, Plus,
  ChevronLeft, ChevronRight, SlidersHorizontal,
} from 'lucide-react';
import { problemsApi, bookmarksApi } from '../api/endpoints';
import { DifficultyBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SkeletonLine } from '../components/ui/Spinner';
import { useT } from '../i18n';
import { useAuthStore } from '../store/authStore';
import type { ProblemShort } from '../types';

const TOPICS = [
  'Массивы', 'Строки', 'Математика', 'Ввод/вывод',
  'Сортировка', 'Поиск', 'Динамическое программирование',
  'Жадные алгоритмы', 'Рекурсия', 'Графы', 'Деревья', 'Брутфорс',
];

const DIFF_OPTIONS = [
  { value: '', label: 'Все',     dot: 'bg-[var(--text-3)]'  },
  { value: 'easy',   label: 'Лёгкая',  dot: 'bg-emerald-400' },
  { value: 'medium', label: 'Средняя', dot: 'bg-yellow-400'  },
  { value: 'hard',   label: 'Сложная', dot: 'bg-orange-400'  },
  { value: 'expert', label: 'Эксперт', dot: 'bg-red-400'     },
];

export function Problems() {
  const t               = useT();
  const { user }        = useAuthStore();
  const [search, setSearch]   = useState('');
  const [difficulty, setDiff] = useState('');
  const [topic, setTopic]     = useState('');
  const [page, setPage]       = useState(0);
  const limit = 20;

  const { data: problems, isLoading } = useQuery({
    queryKey: ['problems', difficulty, topic, page],
    queryFn: () => problemsApi.list({ skip: page * limit, limit, difficulty: difficulty || undefined, topic: topic || undefined }),
  });
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
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }} className="mb-7">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-[var(--text-1)] flex items-center gap-3">
              <Code2 size={26} className="text-purple-400" /> {t.problems.title}
            </h1>
            <p className="text-[var(--text-3)] text-sm mt-1">{t.problems.subtitle}</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'moderator') && (
            <Link to="/problems/create">
              <Button icon={<Plus size={15} />}>Создать задачу</Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Search + difficulty segmented control */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
          <input
            className="input-theme w-full rounded-xl pl-9 pr-3 py-2.5 text-sm"
            placeholder={t.common.search + '…'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Difficulty segmented */}
        <div className="flex rounded-xl border border-[var(--border)] overflow-hidden shrink-0" style={{ background: 'var(--surface-2)' }}>
          {DIFF_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setDiff(opt.value); setPage(0); }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                difficulty === opt.value
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--hover)]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${difficulty === opt.value ? 'bg-white' : opt.dot}`} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topic pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => { setTopic(''); setPage(0); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
            topic === ''
              ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
              : 'border-[var(--border)] text-[var(--text-3)] hover:border-[var(--border-2)] hover:text-[var(--text-2)]'
          }`}
        >
          <SlidersHorizontal size={10} /> Все темы
        </button>
        {TOPICS.map(t => (
          <button
            key={t}
            onClick={() => { setTopic(topic === t ? '' : t); setPage(0); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
              topic === t
                ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                : 'border-[var(--border)] text-[var(--text-3)] hover:border-[var(--border-2)] hover:text-[var(--text-2)]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[var(--border)] overflow-hidden" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-md)' }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]" style={{ background: 'var(--surface-2)' }}>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-wider w-14">#</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-wider">Задача</th>
              <th className="text-left px-3 py-3 text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-wider hidden sm:table-cell">Код</th>
              <th className="text-left px-3 py-3 text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-wider">Сложность</th>
              <th className="text-left px-3 py-3 text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-wider hidden md:table-cell">Тема</th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-wider">{t.problems.solved}</th>
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array(10).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--border)]">
                    <td colSpan={7} className="px-4 py-4"><SkeletonLine className="w-full h-8" /></td>
                  </tr>
                ))
              : (
                <AnimatePresence>
                  {filtered.map((p: ProblemShort, i: number) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.025 }}
                      className="border-b border-[var(--border)] group relative cursor-pointer"
                      style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}
                    >
                      {/* Left accent line on hover */}
                      <td className="px-4 py-4 text-[var(--text-3)] text-xs font-mono w-14">
                        <span className="group-hover:opacity-0 transition-opacity">{page * limit + i + 1}</span>
                        <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-r" />
                      </td>
                      <td className="px-4 py-4">
                        <Link to={`/problems/${p.slug}`}
                          className="font-medium text-sm text-[var(--text-1)] group-hover:text-purple-400 transition-colors flex items-center gap-2">
                          <Code2 size={13} className="text-[var(--text-3)] shrink-0" />
                          {p.title}
                        </Link>
                      </td>
                      <td className="px-3 py-4 hidden sm:table-cell">
                        {p.difficulty_code ? (
                          <span className="font-mono text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md uppercase">{p.difficulty_code}</span>
                        ) : <span className="text-[var(--text-3)] text-xs">—</span>}
                      </td>
                      <td className="px-3 py-4"><DifficultyBadge difficulty={p.difficulty} /></td>
                      <td className="px-3 py-4 hidden md:table-cell">
                        {p.topic
                          ? <span className="text-xs text-[var(--text-2)] bg-[var(--surface-2)] border border-[var(--border)] px-2.5 py-0.5 rounded-full">{p.topic}</span>
                          : <span className="text-[var(--text-3)] text-xs">—</span>}
                      </td>
                      <td className="px-4 py-4 text-right text-xs text-[var(--text-3)] font-mono">{p.solve_count.toLocaleString()}</td>
                      <td className="px-3 py-4 text-right">
                        <button
                          onClick={e => toggleBm(e, p.id)}
                          className="text-[var(--text-3)] hover:text-yellow-400 transition-all cursor-pointer opacity-0 group-hover:opacity-100 hover:scale-110"
                        >
                          {bookmarkedIds.has(p.id)
                            ? <BookmarkCheck size={15} className="text-yellow-400" />
                            : <Bookmark size={15} />}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )
            }
          </tbody>
        </table>

        {!isLoading && filtered.length === 0 && (
          <div className="py-16 text-center text-[var(--text-3)]">
            <Code2 size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">{t.problems.not_found}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-5">
        <Button variant="outline" size="sm" icon={<ChevronLeft size={14} />}
          onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
          {t.common.back}
        </Button>
        <div className="flex items-center gap-2 text-sm text-[var(--text-3)]">
          <span className="px-3 py-1 rounded-lg border border-[var(--border)] font-mono text-xs text-[var(--text-2)]">{page + 1}</span>
        </div>
        <Button variant="outline" size="sm" icon={<ChevronRight size={14} />}
          onClick={() => setPage(page + 1)} disabled={(problems?.length ?? 0) < limit}>
          {t.common.next}
        </Button>
      </div>
    </div>
  );
}
