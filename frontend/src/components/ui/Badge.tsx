interface BadgeProps {
  children: React.ReactNode;
  variant?: 'purple' | 'cyan' | 'green' | 'red' | 'orange' | 'yellow' | 'gray' | 'blue';
  size?: 'sm' | 'md';
}

const variants = {
  purple: 'bg-purple-500/12 text-purple-400 border border-purple-500/25 shadow-sm shadow-purple-500/10',
  cyan:   'bg-cyan-500/12   text-cyan-400   border border-cyan-500/25   shadow-sm shadow-cyan-500/10',
  green:  'bg-emerald-500/12 text-emerald-400 border border-emerald-500/25 shadow-sm shadow-emerald-500/10',
  red:    'bg-red-500/12   text-red-400   border border-red-500/25   shadow-sm shadow-red-500/10',
  orange: 'bg-orange-500/12 text-orange-400 border border-orange-500/25 shadow-sm shadow-orange-500/10',
  yellow: 'bg-yellow-500/12 text-yellow-400 border border-yellow-500/25 shadow-sm shadow-yellow-500/10',
  gray:   'bg-[var(--surface-2)] text-[var(--text-3)] border border-[var(--border)]',
  blue:   'bg-blue-500/12 text-blue-400 border border-blue-500/25 shadow-sm shadow-blue-500/10',
};

const sizes = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({ children, variant = 'gray', size = 'md' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    easy:   { label: 'Лёгкая',  cls: 'diff-easy'   },
    medium: { label: 'Средняя', cls: 'diff-medium'  },
    hard:   { label: 'Сложная', cls: 'diff-hard'    },
    expert: { label: 'Эксперт', cls: 'diff-expert'  },
  };
  const cfg = map[difficulty] ?? { label: difficulty, cls: 'diff-easy' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    accepted:      { label: 'Принято',          cls: 'status-accepted' },
    wrong_answer:  { label: 'Неверный ответ',   cls: 'status-wrong'    },
    time_limit:    { label: 'Лимит времени',    cls: 'status-tle'      },
    memory_limit:  { label: 'Лимит памяти',     cls: 'status-tle'      },
    runtime_error: { label: 'Ошибка runtime',   cls: 'status-runtime'  },
    compile_error: { label: 'Ошибка компил.',   cls: 'status-compile'  },
    system_error:  { label: 'Системная ошибка', cls: 'status-pending'  },
    pending:       { label: 'Ожидание',         cls: 'status-pending'  },
    running:       { label: 'Выполняется…',     cls: 'status-running'  },
  };
  const cfg = map[status] ?? { label: status, cls: 'status-pending' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      {cfg.cls === 'status-running' && (
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      )}
      {cfg.cls === 'status-accepted' && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
      )}
      {cfg.label}
    </span>
  );
}
