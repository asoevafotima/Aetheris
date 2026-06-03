import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  Swords, Play, CheckCircle, XCircle,
  Loader2, Crown, Minus, ArrowLeft, User,
} from 'lucide-react';
import { duelsApi, submissionsApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { differenceInSeconds, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuthStore } from '../store/authStore';
import type { Duel } from '../types';

const LANGUAGES = [
  { value: 'python', label: 'Python 3' },
  { value: 'cpp',    label: 'C++ 17'   },
];

const STARTERS: Record<string, string> = {
  python: `import sys\ninput = sys.stdin.readline\n\ndef solve():\n    pass\n\nsolve()\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    return 0;\n}\n`,
};

function Countdown({ startedAt, limitMin, onExpire }: {
  startedAt: string; limitMin: number; onExpire: () => void;
}) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    const calc = () => {
      const elapsed = differenceInSeconds(new Date(), new Date(startedAt + 'Z'));
      const remaining = Math.max(0, limitMin * 60 - elapsed);
      setLeft(remaining);
      if (remaining === 0) onExpire();
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [startedAt, limitMin]);

  const m = Math.floor(left / 60);
  const s = left % 60;
  const pct = left / (limitMin * 60);
  const urgent = pct < 0.2;
  const critical = pct < 0.05;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`font-mono text-3xl font-black tabular-nums ${
        critical ? 'text-red-400 animate-pulse' : urgent ? 'text-orange-400' : 'text-[var(--text-1)]'
      }`}>
        {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </span>
      <div className="w-32 h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${critical ? 'bg-red-400' : urgent ? 'bg-orange-400' : 'bg-emerald-400'}`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}

function PlayerStatus({ name, solved, score, solvedAt, startedAt, isMe }: {
  name: string; solved: boolean; score: number;
  solvedAt?: string; startedAt?: string; isMe: boolean;
}) {
  let timeStr = '';
  if (solved && solvedAt && startedAt) {
    const sec = differenceInSeconds(new Date(solvedAt + 'Z'), new Date(startedAt + 'Z'));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    timeStr = `за ${m}м ${s}с`;
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${
      isMe ? 'border-purple-500/40 bg-purple-500/5' : 'border-[var(--border)] bg-[var(--surface-2)]'
    }`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${
        isMe ? 'bg-purple-600' : 'bg-slate-600'
      }`}>
        {name[0]?.toUpperCase() ?? '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text-1)] flex items-center gap-1">
          {name} {isMe && <span className="text-xs text-purple-400">(вы)</span>}
        </p>
        {solved ? (
          <p className="text-xs text-emerald-400">✓ Решено {timeStr}</p>
        ) : (
          <p className="text-xs text-[var(--text-3)]">Баллы: {score.toFixed(0)}%</p>
        )}
      </div>
      {solved
        ? <CheckCircle size={18} className="text-emerald-400 shrink-0" />
        : <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse shrink-0" />
      }
    </div>
  );
}

function ResultScreen({ duel, userId }: { duel: Duel; userId?: string }) {
  const isChallenger = duel.challenger_id === userId;
  const iWon = (isChallenger && duel.result === 'challenger_win') ||
               (!isChallenger && duel.result === 'opponent_win');
  const isDraw = duel.result === 'draw';

  const myScore = isChallenger ? duel.challenger_score : duel.opponent_score;
  const opScore = isChallenger ? duel.opponent_score : duel.challenger_score;
  const mySolved = isChallenger ? !!duel.challenger_solved_at : !!duel.opponent_solved_at;
  const opSolved = isChallenger ? !!duel.opponent_solved_at : !!duel.challenger_solved_at;
  const opName = isChallenger ? duel.opponent_username : duel.challenger_username;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 py-10"
    >
      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl ${
        isDraw ? 'bg-[var(--surface-2)]' : iWon ? 'bg-yellow-500/20' : 'bg-red-500/20'
      }`}>
        {isDraw ? <Minus size={40} className="text-[var(--text-3)]" /> :
         iWon ? <Crown size={40} className="text-yellow-400" /> :
         <XCircle size={40} className="text-red-400" />}
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-black text-[var(--text-1)]">
          {isDraw ? 'Ничья!' : iWon ? 'Победа! 🎉' : 'Поражение'}
        </h2>
        <p className="text-[var(--text-3)] text-sm mt-1">
          {duel.finished_at && `Завершено ${format(new Date(duel.finished_at + 'Z'), 'd MMM, HH:mm', { locale: ru })}`}
        </p>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-3">
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
          <span className="text-sm text-[var(--text-2)]">Вы</span>
          <div className="flex items-center gap-2">
            {mySolved && <CheckCircle size={14} className="text-emerald-400" />}
            <span className="font-mono font-bold text-[var(--text-1)]">{myScore.toFixed(0)}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
          <span className="text-sm text-[var(--text-2)]">{opName ?? 'Оппонент'}</span>
          <div className="flex items-center gap-2">
            {opSolved && <CheckCircle size={14} className="text-emerald-400" />}
            <span className="font-mono font-bold text-[var(--text-1)]">{opScore.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-[var(--text-3)] text-center">
        {!mySolved && !opSolved && 'Никто не решил — победитель определён по набранным баллам'}
        {mySolved && opSolved && 'Оба решили — победитель определён по скорости решения'}
      </div>
    </motion.div>
  );
}

export function DuelDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [lang, setLang] = useState('python');
  const [code, setCode] = useState(STARTERS.python);
  const [lastSubId, setLastSubId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  const { data: duel, refetch } = useQuery({
    queryKey: ['duel', id],
    queryFn: () => duelsApi.get(id!),
    enabled: !!id,
    refetchInterval: (q) => {
      const d = q.state.data as Duel | undefined;
      if (!d || d.status === 'finished' || d.status === 'cancelled') return false;
      return 5000;
    },
  });

  const { data: latestSub } = useQuery({
    queryKey: ['submission', lastSubId],
    queryFn: () => submissionsApi.get(lastSubId!),
    enabled: !!lastSubId && polling,
    refetchInterval: (q) => {
      const d = q.state.data;
      if (!d || d.status === 'pending' || d.status === 'running') return 1000;
      setPolling(false);
      qc.invalidateQueries({ queryKey: ['duel', id] });
      return false;
    },
  });

  const submitMut = useMutation({
    mutationFn: () => submissionsApi.submit({
      problem_id: duel!.problem_id!,
      language: lang,
      code,
    }),
    onSuccess: (sub) => {
      setLastSubId(sub.id);
      setPolling(true);
    },
  });

  useEffect(() => { setCode(STARTERS[lang] ?? ''); }, [lang]);

  if (!duel) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-purple-500" />
      </div>
    );
  }

  const isChallenger = duel.challenger_id === user?.id;
  const myName = isChallenger ? duel.challenger_username : duel.opponent_username;
  const opName = isChallenger ? duel.opponent_username : duel.challenger_username;
  const mySolvedAt = isChallenger ? duel.challenger_solved_at : duel.opponent_solved_at;
  const opSolvedAt = isChallenger ? duel.opponent_solved_at : duel.challenger_solved_at;
  const myScore = isChallenger ? duel.challenger_score : duel.opponent_score;
  const opScore = isChallenger ? duel.opponent_score : duel.challenger_score;
  const canSubmit = duel.status === 'active' && !!duel.problem_id;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      {/* Левая панель */}
      <div className="w-[44%] flex flex-col border-r border-[var(--border)] overflow-hidden">
        {/* Шапка */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--surface)] shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <Link to="/duels" className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Swords size={16} className="text-red-400 shrink-0" />
              <span className="text-sm font-semibold text-[var(--text-1)] truncate">
                {myName ?? 'Вы'} vs {opName ?? '???'}
              </span>
            </div>
            {duel.status === 'active' && duel.started_at && (
              <Countdown
                startedAt={duel.started_at}
                limitMin={duel.time_limit_minutes}
                onExpire={() => refetch()}
              />
            )}
            {duel.status === 'pending' && (
              <span className="text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-1 rounded-lg">
                Ожидание соперника...
              </span>
            )}
          </div>

          {/* Статус игроков */}
          {duel.status === 'active' && (
            <div className="grid grid-cols-2 gap-2">
              <PlayerStatus
                name={myName ?? 'Вы'}
                solved={!!mySolvedAt}
                score={myScore}
                solvedAt={mySolvedAt}
                startedAt={duel.started_at}
                isMe={true}
              />
              <PlayerStatus
                name={opName ?? 'Оппонент'}
                solved={!!opSolvedAt}
                score={opScore}
                solvedAt={opSolvedAt}
                startedAt={duel.started_at}
                isMe={false}
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {duel.status === 'finished' ? (
            <ResultScreen duel={duel} userId={user?.id} />
          ) : duel.status === 'pending' ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--text-3)]">
              <div className="w-16 h-16 rounded-full border-4 border-dashed border-[var(--border)] flex items-center justify-center">
                <User size={28} className="opacity-30" />
              </div>
              <p className="text-sm text-center">Жди пока соперник примет приглашение.<br />Задача откроется после старта.</p>
            </div>
          ) : duel.status === 'active' && duel.problem_id ? (
            <div className="space-y-4">
              {duel.problem_title && (
                <h2 className="text-lg font-bold text-[var(--text-1)]">{duel.problem_title}</h2>
              )}
              <Link
                to={`/problems/${duel.problem_slug}`}
                className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Открыть задачу полностью <ArrowLeft size={13} className="rotate-180" />
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {/* Правая панель — редактор */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--surface)] shrink-0">
          <Select options={LANGUAGES} value={lang} onChange={e => setLang(e.target.value)} className="w-36" />
          <div className="flex-1" />
          <Button
            onClick={() => submitMut.mutate()}
            loading={submitMut.isPending || polling}
            disabled={!canSubmit}
            icon={<Play size={14} />}
            size="sm"
          >
            {polling ? 'Проверяется…' : 'Отправить'}
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={lang === 'cpp' ? 'cpp' : 'python'}
            value={code}
            onChange={v => setCode(v ?? '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 16 },
              lineNumbers: 'on',
              tabSize: 4,
              readOnly: !canSubmit,
            }}
          />
        </div>

        {latestSub && (
          <div className="border-t border-[var(--border)] bg-[var(--surface)] p-3 shrink-0">
            <div className="flex items-center gap-3">
              {polling ? (
                <div className="flex items-center gap-2 text-cyan-400 text-sm">
                  <Loader2 size={14} className="animate-spin" /> Проверяется…
                </div>
              ) : latestSub.status === 'accepted' ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                  <CheckCircle size={15} /> Принято! {latestSub.time_ms && `· ${latestSub.time_ms} мс`}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <XCircle size={15} /> {latestSub.status}
                  {latestSub.error_message && (
                    <span className="text-xs text-[var(--text-3)] ml-2 truncate max-w-xs">{latestSub.error_message}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
