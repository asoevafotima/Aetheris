interface BadgeProps {
  children: React.ReactNode;
  variant?: 'purple' | 'cyan' | 'green' | 'red' | 'orange' | 'yellow' | 'gray' | 'indigo';
  size?: 'sm' | 'md';
}

const V: Record<string, string> = {
  indigo: 'bg-indigo-500/10 text-indigo-400  border border-indigo-500/20',
  purple: 'bg-purple-500/10 text-purple-400  border border-purple-500/20',
  cyan:   'bg-cyan-500/10   text-cyan-400    border border-cyan-500/20',
  green:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  red:    'bg-red-500/10    text-red-400     border border-red-500/20',
  orange: 'bg-orange-500/10 text-orange-400  border border-orange-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-400  border border-yellow-500/20',
  gray:   'bg-white/5       text-[var(--text-3)] border border-white/8',
};

export function Badge({ children, variant = 'gray', size = 'md' }: BadgeProps) {
  return (
    <span className={`pill ${V[variant] ?? V.gray} ${size === 'sm' ? '!text-[9px] !px-2 !py-0.5' : ''}`}>
      {children}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const m: Record<string, { l: string; c: string }> = {
    easy:   { l: 'Лёгкая',  c: 'diff-easy'   },
    medium: { l: 'Средняя', c: 'diff-medium'  },
    hard:   { l: 'Сложная', c: 'diff-hard'    },
    expert: { l: 'Эксперт', c: 'diff-expert'  },
  };
  const cfg = m[difficulty] ?? { l: difficulty, c: 'diff-easy' };
  return <span className={`pill ${cfg.c}`}>{cfg.l}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const m: Record<string, { l: string; c: string; dot?: string }> = {
    accepted:      { l: 'Принято',        c: 'st-ac',  dot: 'bg-emerald-400' },
    wrong_answer:  { l: 'Неверный ответ', c: 'st-wa'  },
    time_limit:    { l: 'Лимит времени',  c: 'st-tle' },
    memory_limit:  { l: 'Лимит памяти',   c: 'st-tle' },
    runtime_error: { l: 'Runtime Error',  c: 'st-re'  },
    compile_error: { l: 'Compile Error',  c: 'st-ce'  },
    system_error:  { l: 'System Error',   c: 'st-nd'  },
    pending:       { l: 'Ожидание',       c: 'st-nd'  },
    running:       { l: 'Выполняется',    c: 'st-run', dot: 'bg-cyan-400 animate-pulse' },
  };
  const cfg = m[status] ?? { l: status, c: 'st-nd' };
  return (
    <span className={`pill ${cfg.c}`}>
      {cfg.dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />}
      {cfg.l}
    </span>
  );
}
