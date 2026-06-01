import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Code2, Bookmark, BookmarkCheck } from 'lucide-react';
import { problemsApi, tagsApi, bookmarksApi } from '../api/endpoints';
import { Input, Select } from '../components/ui/Input';
import { DifficultyBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SkeletonLine } from '../components/ui/Spinner';
import type { ProblemShort } from '../types';

const DIFFICULTIES = [
  { value: '',       label: 'Все сложности' },
  { value: 'easy',   label: 'Лёгкая'        },
  { value: 'medium', label: 'Средняя'       },
  { value: 'hard',   label: 'Сложная'       },
  { value: 'expert', label: 'Эксперт'       },
];

export function Problems() {
  const [search, setSearch]   = useState('');
  const [difficulty, setDiff] = useState('');
  const [page, setPage]       = useState(0);
  const limit = 20;

  const { data: problems, isLoading } = useQuery({
    queryKey: ['problems', difficulty, page],
    queryFn: () => problemsApi.list({ skip: page * limit, limit, difficulty: difficulty || undefined }),
  });

  const { data: tags } = useQuery({ queryKey: ['tags'], queryFn: tagsApi.list });
  const { data: bookmarks, refetch: refetchBookmarks } = useQuery({ queryKey: ['bookmarks'], queryFn: bookmarksApi.list });

  const bookmarkedIds = new Set(((bookmarks ?? []) as { problem_id: string }[]).map(b => b.problem_id));
  const filtered = (problems ?? []).filter((p: ProblemShort) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBookmark = async (e: React.MouseEvent, problemId: string) => {
    e.preventDefault();
    try {
      if (bookmarkedIds.has(problemId)) await bookmarksApi.remove(problemId);
      else await bookmarksApi.add(problemId);
      refetchBookmarks();
    } catch {}
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Задачи</h1>
        <p className="text-slate-500">Решай задачи по спортивному программированию</p>
      </motion.div>

      {/* Фильтры */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1">
          <Input placeholder="Поиск задач..." icon={<Search size={16} />} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="w-full sm:w-48">
          <Select options={DIFFICULTIES} value={difficulty} onChange={e => { setDiff(e.target.value); setPage(0); }} />
        </div>
      </div>

      {/* Теги */}
      {tags && (tags as { id: string; name: string }[]).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {(tags as { id: string; name: string }[]).slice(0, 15).map(tag => (
            <button key={tag.id} className="px-3 py-1 text-xs rounded-full border border-slate-200 bg-white text-slate-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all cursor-pointer shadow-sm">
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Таблица */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">#</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Название</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Сложность</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Решено</th>
              <th className="text-right px-5 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array(12).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td colSpan={5} className="px-5 py-4"><SkeletonLine className="w-full" /></td>
                  </tr>
                ))
              : filtered.map((p: ProblemShort, i: number) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-slate-100 hover:bg-purple-50/40 transition-colors group"
                  >
                    <td className="px-5 py-4 text-slate-400 text-sm font-mono">{page * limit + i + 1}</td>
                    <td className="px-5 py-4">
                      <Link to={`/problems/${p.slug}`} className="text-slate-800 hover:text-purple-700 font-medium text-sm transition-colors flex items-center gap-2">
                        <Code2 size={14} className="text-slate-300 shrink-0" />
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-3 py-4"><DifficultyBadge difficulty={p.difficulty} /></td>
                    <td className="px-5 py-4 text-right text-sm text-slate-400 font-mono">{p.solve_count.toLocaleString('ru-RU')}</td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={e => toggleBookmark(e, p.id)} className="text-slate-300 hover:text-yellow-500 transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
                        {bookmarkedIds.has(p.id) ? <BookmarkCheck size={16} className="text-yellow-500" /> : <Bookmark size={16} />}
                      </button>
                    </td>
                  </motion.tr>
                ))
            }
          </tbody>
        </table>
        {!isLoading && filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <Code2 size={40} className="mx-auto mb-3 opacity-20" />
            <p>Задачи не найдены</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button variant="outline" size="sm" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>← Назад</Button>
        <span className="text-slate-500 text-sm">Страница {page + 1}</span>
        <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={(problems?.length ?? 0) < limit}>Вперёд →</Button>
      </div>
    </div>
  );
}
