interface BadgeProps {
  children: React.ReactNode;
  variant?: 'purple' | 'cyan' | 'green' | 'red' | 'orange' | 'yellow' | 'gray';
  size?: 'sm' | 'md';
}

const variants = {
  purple: 'bg-purple-100 text-purple-700 border border-purple-200',
  cyan:   'bg-cyan-100 text-cyan-700 border border-cyan-200',
  green:  'bg-emerald-100 text-emerald-700 border border-emerald-200',
  red:    'bg-red-100 text-red-700 border border-red-200',
  orange: 'bg-orange-100 text-orange-700 border border-orange-200',
  yellow: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  gray:   'bg-slate-100 text-slate-600 border border-slate-200',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({ children, variant = 'gray', size = 'md' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-md font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    easy:   { label: 'Лёгкая',  variant: 'green'  },
    medium: { label: 'Средняя', variant: 'yellow' },
    hard:   { label: 'Сложная', variant: 'orange' },
    expert: { label: 'Эксперт', variant: 'red'    },
  };
  const cfg = map[difficulty] ?? { label: difficulty, variant: 'gray' };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    accepted:      { label: 'Принято',        variant: 'green'  },
    wrong_answer:  { label: 'Неверный ответ', variant: 'red'    },
    time_limit:    { label: 'Превышено время',variant: 'orange' },
    memory_limit:  { label: 'Превышена память',variant: 'orange'},
    runtime_error: { label: 'Ошибка времени', variant: 'red'    },
    compile_error: { label: 'Ошибка компиляции',variant: 'red'  },
    system_error:  { label: 'Системная ошибка',variant: 'gray'  },
    pending:       { label: 'Ожидание',       variant: 'gray'   },
    running:       { label: 'Выполняется',    variant: 'cyan'   },
  };
  const cfg = map[status] ?? { label: status, variant: 'gray' };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
