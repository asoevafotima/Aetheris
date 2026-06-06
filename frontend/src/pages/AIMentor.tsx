import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Lightbulb, Code2, Zap, Trash2, Sparkles, ChevronDown, X, Cpu } from 'lucide-react';
import { problemsApi, aiApi } from '../api/endpoints';
import { useThemeStore } from '../store/themeStore';
import { BackgroundGraph } from '../components/BackgroundGraph';
import type { ProblemShort } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'hint';
}

const HINTS = [
  { value: 'algorithm',  label: '🧠 Алгоритм',   desc: 'Нужный алгоритм' },
  { value: 'approach',   label: '📋 Подход',       desc: 'Пошаговый план'  },
  { value: 'complexity', label: '⚡ Сложность',    desc: 'Время и память'  },
  { value: 'debug',      label: '🐛 Отладка',     desc: 'Найдём ошибку'   },
];

const QUICK = [
  'Какой алгоритм использовать?',
  'Объясни временную сложность',
  'Дай пошаговую подсказку',
  'Помоги найти ошибку',
];

const FEATURES = [
  { icon: Lightbulb, label: 'Подсказки алгоритма', desc: 'Направлю к правильному подходу',  color: '#f59e0b' },
  { icon: Code2,     label: 'Помощь с отладкой',   desc: 'Найдём баги без спойлеров',        color: '#ef4444' },
  { icon: Zap,       label: 'Анализ сложности',    desc: 'Объясню время и память',           color: '#06b6d4' },
  { icon: Bot,       label: 'Пошаговый разбор',    desc: 'Разобьём задачу на шаги',          color: '#22c55e' },
];

export function AIMentor() {
  const { theme } = useThemeStore();
  const dark = theme === 'dark';

  const [messages, setMessages]   = useState<Message[]>([]);
  const [selected, setSelected]   = useState('');
  const [hintType, setHintType]   = useState('algorithm');
  const [inputText, setInput]     = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── same tokens as Dashboard ──
  const pageBg    = dark ? '#04080f'                  : '#f1f5f9';
  const panelBg   = dark ? 'rgba(6,12,28,0.72)'       : 'rgba(255,255,255,0.95)';
  const panelBord = dark ? 'rgba(255,255,255,0.08)'   : 'rgba(0,0,0,0.09)';
  const cardBg    = dark ? 'rgba(6,12,28,0.65)'       : 'rgba(255,255,255,0.97)';
  const cardBord  = dark ? 'rgba(255,255,255,0.08)'   : 'rgba(0,0,0,0.08)';
  const t1        = dark ? 'rgba(255,255,255,0.9)'    : 'rgba(0,0,0,0.88)';
  const t2        = dark ? 'rgba(255,255,255,0.45)'   : 'rgba(0,0,0,0.5)';
  const t3        = dark ? 'rgba(255,255,255,0.22)'   : 'rgba(0,0,0,0.3)';
  const inputBg   = dark ? 'rgba(255,255,255,0.06)'   : 'rgba(0,0,0,0.04)';
  const inputBord = dark ? 'rgba(255,255,255,0.12)'   : 'rgba(0,0,0,0.12)';
  const chipBg    = dark ? 'rgba(255,255,255,0.05)'   : 'rgba(0,0,0,0.04)';
  const chipBord  = dark ? 'rgba(255,255,255,0.09)'   : 'rgba(0,0,0,0.08)';
  const shimmer   = dark
    ? 'linear-gradient(90deg,transparent,rgba(96,165,250,0.3),rgba(245,158,11,0.15),transparent)'
    : 'linear-gradient(90deg,transparent,rgba(99,102,241,0.2),rgba(245,158,11,0.12),transparent)';

  const { data: problems } = useQuery({
    queryKey: ['problems', 'list'],
    queryFn: () => problemsApi.list({ limit: 100 }),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMsg = (role: Message['role'], content: string, type?: Message['type']) =>
    setMessages(p => [...p, { id: crypto.randomUUID(), role, content, timestamp: new Date(), type }]);

  const hintMut = useMutation({
    mutationFn: () => aiApi.hint({ problem_id: selected, hint_type: hintType }),
    onMutate:  () => addMsg('user', HINTS.find(h => h.value === hintType)?.label ?? hintType),
    onSuccess: (d) => addMsg('assistant', d.response_text, 'hint'),
    onError:   () => addMsg('assistant', '❌ Не удалось получить подсказку.'),
  });

  const handleSend = () => {
    if (!inputText.trim() || !selected || hintMut.isPending) return;
    addMsg('user', inputText);
    setInput('');
    hintMut.mutate();
  };

  const selProblem = (problems as ProblemShort[] ?? []).find(p => p.id === selected);

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 56px)', background: pageBg, overflow: 'hidden', display: 'flex' }}>
      <BackgroundGraph noSphere light={!dark} />

      {/* ── LEFT PANEL (same as Dashboard) ── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
        style={{
          width: 440, flexShrink: 0, position: 'relative', zIndex: 1,
          background: panelBg, backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
          borderRight: `1px solid ${panelBord}`,
          boxShadow: dark ? 'none' : '2px 0 16px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden',
        }}
      >
        {/* Shimmer top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: shimmer, zIndex: 1 }} />

        {/* Branding */}
        <div style={{ padding: '28px 24px 20px', borderBottom: `1px solid ${panelBord}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(99,102,241,0.45)', flexShrink: 0 }}
            >
              <Cpu size={22} color="#fff" />
            </motion.div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 900, color: t1, margin: 0 }}>AI Наставник</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.7)' }} />
                <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>Groq · Онлайн</span>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: t3, lineHeight: 1.6, margin: 0 }}>
            Подсказки без спойлеров — только правильное направление мысли.
          </p>
        </div>

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>

          {/* Problem */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, color: t3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Задача</p>
            <div style={{ position: 'relative' }}>
              <select value={selected} onChange={e => setSelected(e.target.value)}
                style={{ width: '100%', padding: '10px 32px 10px 13px', background: inputBg, border: `1px solid ${inputBord}`, borderRadius: 12, color: selected ? t1 : t3, fontSize: 13, cursor: 'pointer', outline: 'none', fontFamily: 'inherit', appearance: 'none', WebkitAppearance: 'none', boxSizing: 'border-box' as const, transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                onBlur={e => e.target.style.borderColor = inputBord}
              >
                <option value="">Выбери задачу...</option>
                {(problems as ProblemShort[] ?? []).map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: t3, pointerEvents: 'none' }} />
            </div>
            {selProblem && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 8, padding: '10px 13px', borderRadius: 11, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.22)' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selProblem.title}</p>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>{selProblem.difficulty}</span>
              </motion.div>
            )}
          </div>

          {/* Hint type */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, color: t3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Тип подсказки</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {HINTS.map(h => (
                <button key={h.value} onClick={() => setHintType(h.value)}
                  style={{ padding: '9px 12px', borderRadius: 10, border: `1px solid ${hintType === h.value ? 'rgba(99,102,241,0.4)' : 'transparent'}`, background: hintType === h.value ? 'rgba(99,102,241,0.12)' : 'transparent', color: hintType === h.value ? '#818cf8' : t2, fontSize: 13, fontWeight: hintType === h.value ? 700 : 400, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {/* Get hint */}
          <button onClick={() => hintMut.mutate()} disabled={!selected || hintMut.isPending}
            style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: selected ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : chipBg, boxShadow: selected ? '0 0 24px rgba(99,102,241,0.38)' : 'none', border: `1px solid ${selected ? 'transparent' : chipBord}`, borderRadius: 13, color: selected ? '#fff' : t3, fontSize: 13, fontWeight: 700, cursor: selected ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
            onMouseEnter={e => { if (selected) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            <Lightbulb size={15} /> {hintMut.isPending ? 'Думаю...' : 'Получить подсказку'}
          </button>

          {/* Quick Q */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, color: t3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Быстрые вопросы</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {QUICK.map(q => (
                <button key={q} onClick={() => setInput(q)}
                  style={{ padding: '9px 12px', borderRadius: 10, background: chipBg, border: `1px solid ${chipBord}`, color: t2, fontSize: 12, cursor: 'pointer', textAlign: 'left', lineHeight: 1.4, transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = t1; e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = t2; e.currentTarget.style.borderColor = chipBord; }}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Clear */}
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: t3, fontSize: 12, cursor: 'pointer', padding: '4px 0', marginTop: 'auto', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
              onMouseLeave={e => e.currentTarget.style.color = t3}>
              <Trash2 size={13} /> Очистить диалог
            </button>
          )}
        </div>
      </motion.div>

      {/* ── RIGHT: CHAT ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Empty state */}
          {messages.length === 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, textAlign: 'center', padding: '40px 0' }}>
              <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 180, delay: 0.1 }}
                style={{ width: 96, height: 96, borderRadius: 28, background: dark ? 'rgba(6,12,28,0.8)' : 'rgba(255,255,255,0.92)', border: '1px solid rgba(99,102,241,0.22)', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(99,102,241,0.18)' }}>
                <Sparkles size={44} color="#818cf8" />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 style={{ fontSize: 28, fontWeight: 900, color: t1, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Твой AI Наставник</h2>
                <p style={{ fontSize: 14, color: t2, maxWidth: 420, lineHeight: 1.7, margin: '0 auto' }}>
                  Выбери задачу слева, выбери тип подсказки и нажми кнопку — помогу разобраться без спойлеров!
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 500, width: '100%' }}>
                {FEATURES.map(({ icon: Icon, label, desc, color }) => (
                  <div key={label} style={{ padding: '18px', borderRadius: 18, background: cardBg, border: `1px solid ${cardBord}`, backdropFilter: 'blur(24px)', textAlign: 'left', boxShadow: dark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${color}44,transparent)` }} />
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <Icon size={18} color={color} />
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: t1, margin: '0 0 5px' }}>{label}</p>
                    <p style={{ fontSize: 12, color: t3, margin: 0, lineHeight: 1.5 }}>{desc}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          )}

          {/* Messages */}
          <AnimatePresence initial={false}>
            {messages.map(msg => {
              const isUser = msg.role === 'user';
              return (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
                  style={{ display: 'flex', gap: 12, flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#fff', background: isUser ? 'linear-gradient(135deg,#1d4ed8,#3b82f6)' : 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: `0 0 14px ${isUser ? 'rgba(29,78,216,0.4)' : 'rgba(99,102,241,0.4)'}` }}>
                    {isUser ? 'Я' : <Bot size={17} />}
                  </div>
                  <div style={{ maxWidth: '68%', display: 'flex', flexDirection: 'column', gap: 5, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                    {!isUser && msg.type === 'hint' && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Lightbulb size={11} /> AI Подсказка
                      </span>
                    )}
                    <div style={{ padding: '13px 17px', borderRadius: isUser ? '20px 5px 20px 20px' : '5px 20px 20px 20px', fontSize: 14, lineHeight: 1.65, whiteSpace: 'pre-wrap', background: isUser ? 'linear-gradient(135deg,#1d4ed8,#3b82f6)' : cardBg, color: isUser ? '#fff' : t1, border: isUser ? 'none' : `1px solid ${cardBord}`, boxShadow: isUser ? '0 4px 20px rgba(29,78,216,0.28)' : dark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)', backdropFilter: 'blur(20px)' }}>
                      {msg.content}
                    </div>
                    <span style={{ fontSize: 10, color: t3, paddingInline: 4 }}>
                      {msg.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing */}
          <AnimatePresence>
            {hintMut.isPending && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 14px rgba(99,102,241,0.4)' }}>
                  <Bot size={17} color="#fff" />
                </div>
                <div style={{ padding: '14px 18px', borderRadius: '5px 20px 20px 20px', background: cardBg, border: `1px solid ${cardBord}`, backdropFilter: 'blur(20px)', display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#818cf8', animation: 'bounce 1.1s ease-in-out infinite', animationDelay: `${i * 0.18}s` }} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* Input bar — same style as other page bottoms */}
        <div style={{ borderTop: `1px solid ${panelBord}`, padding: '14px 36px 18px', background: panelBg, backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 12, maxWidth: 860, margin: '0 auto' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                placeholder={selected ? 'Задай любой вопрос по задаче...' : 'Сначала выбери задачу слева...'}
                value={inputText} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                disabled={!selected}
                style={{ width: '100%', padding: '13px 44px 13px 18px', background: inputBg, border: `1px solid ${inputBord}`, borderRadius: 16, color: t1, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const, transition: 'border-color 0.15s, box-shadow 0.15s', opacity: selected ? 1 : 0.55 }}
                onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = inputBord; e.target.style.boxShadow = 'none'; }}
              />
              {inputText && (
                <button onClick={() => setInput('')} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: t3, cursor: 'pointer' }}>
                  <X size={15} />
                </button>
              )}
            </div>
            <button onClick={handleSend} disabled={!inputText.trim() || !selected || hintMut.isPending}
              style={{ width: 50, height: 50, borderRadius: 15, flexShrink: 0, background: inputText.trim() && selected ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : chipBg, boxShadow: inputText.trim() && selected ? '0 0 24px rgba(99,102,241,0.45)' : 'none', border: `1px solid ${inputText.trim() && selected ? 'transparent' : chipBord}`, color: inputText.trim() && selected ? '#fff' : t3, cursor: inputText.trim() && selected ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseEnter={e => { if (inputText.trim() && selected) e.currentTarget.style.transform = 'scale(1.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
              <Send size={19} />
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 11, color: t3, marginTop: 8 }}>
            Enter — отправить · выбери задачу и тип подсказки слева
          </p>
        </div>
      </div>

      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}`}</style>
    </div>
  );
}
