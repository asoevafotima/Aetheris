import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Lightbulb, Code2, Zap, Trash2, Sparkles } from 'lucide-react';
import { problemsApi, aiApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { DifficultyBadge } from '../components/ui/Badge';
import type { ProblemShort } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'hint' | 'analysis' | 'text';
}

const HINT_OPTIONS = [
  { value: 'algorithm', label: '🧠 Algorithm hint' },
  { value: 'approach',  label: '📋 Step-by-step approach' },
  { value: 'complexity',label: '⚡ Complexity analysis' },
  { value: 'debug',     label: '🐛 Debug help' },
];

const QUICK_QUESTIONS = [
  'What algorithm should I use?',
  'Explain time complexity',
  'Give me a step-by-step hint',
  'Help me debug this logic',
];

export function AIMentor() {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [selectedProblem, setSel] = useState('');
  const [hintType, setHintType]   = useState('algorithm');
  const [inputText, setInputText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: problems } = useQuery({
    queryKey: ['problems', 'list'],
    queryFn: () => problemsApi.list({ limit: 100 }),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMsg = (role: Message['role'], content: string, type?: Message['type']) => {
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role, content,
      timestamp: new Date(),
      type,
    }]);
  };

  const hintMut = useMutation({
    mutationFn: () => aiApi.hint({ problem_id: selectedProblem, hint_type: hintType }),
    onMutate: () => addMsg('user', `Get ${hintType} hint`),
    onSuccess: (data) => addMsg('assistant', data.response_text, 'hint'),
    onError: () => addMsg('assistant', '❌ Failed to get hint. Make sure you selected a problem.'),
  });

  const problemOptions = [
    { value: '', label: 'Select a problem…' },
    ...(problems ?? []).map((p: ProblemShort) => ({ value: p.id, label: p.title })),
  ];

  const selectedProblemData = problems?.find((p: ProblemShort) => p.id === selectedProblem);

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 border-r border-slate-800 bg-slate-900/40 flex flex-col p-4 gap-4 overflow-y-auto shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <span className="font-bold text-white">AI Mentor</span>
          <span className="ml-auto px-1.5 py-0.5 rounded text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-700/30">Groq</span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Powered by Groq LLM. Get intelligent hints without spoiling the solution.
        </p>

        <div className="border-t border-slate-800 pt-4">
          <Select
            label="Problem"
            options={problemOptions}
            value={selectedProblem}
            onChange={e => setSel(e.target.value)}
          />
        </div>

        {selectedProblemData && (
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <p className="text-sm font-medium text-white mb-1">{selectedProblemData.title}</p>
            <DifficultyBadge difficulty={selectedProblemData.difficulty} />
          </div>
        )}

        <div className="border-t border-slate-800 pt-4">
          <Select
            label="Hint Type"
            options={HINT_OPTIONS}
            value={hintType}
            onChange={e => setHintType(e.target.value)}
          />
        </div>

        <Button
          onClick={() => hintMut.mutate()}
          loading={hintMut.isPending}
          disabled={!selectedProblem}
          icon={<Lightbulb size={16} />}
          className="w-full"
        >
          Get Hint
        </Button>

        <div className="border-t border-slate-800 pt-4">
          <p className="text-xs font-medium text-slate-400 mb-2">Quick questions</p>
          <div className="flex flex-col gap-1.5">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => setInputText(q)}
                className="text-left text-xs px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors cursor-pointer mt-auto"
          >
            <Trash2 size={12} /> Clear conversation
          </button>
        )}
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-purple-900/30 border border-purple-700/30 flex items-center justify-center glow-pulse">
                <Sparkles size={36} className="text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Your AI Coding Mentor</h2>
                <p className="text-slate-400 max-w-md">
                  Select a problem from the sidebar and ask for hints, approach guidance, or complexity analysis.
                  I'll help you learn without spoiling the fun!
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-md w-full">
                {[
                  { icon: Lightbulb, label: 'Algorithm hints', desc: 'Guide you to the right approach' },
                  { icon: Code2,     label: 'Debug help',     desc: 'Find bugs in your logic' },
                  { icon: Zap,       label: 'Complexity',     desc: 'Explain time & space complexity' },
                  { icon: Bot,       label: 'Step by step',   desc: 'Break down the solution approach' },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-left">
                    <Icon size={18} className="text-purple-400 mb-2" />
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  msg.role === 'assistant'
                    ? 'bg-purple-700 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {msg.role === 'assistant' ? <Bot size={16} /> : 'Y'}
                </div>
                <div className={`max-w-2xl ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-purple-700 text-white rounded-tr-none'
                      : msg.type === 'hint'
                      ? 'bg-slate-800/80 border border-purple-700/30 text-slate-200 rounded-tl-none'
                      : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.role === 'assistant' && msg.type === 'hint' && (
                      <div className="flex items-center gap-1.5 mb-2 text-purple-400 text-xs font-medium">
                        <Lightbulb size={12} /> AI Hint
                      </div>
                    )}
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-slate-600">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {hintMut.isPending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 rounded-tl-none">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-800 p-4 bg-slate-900/60">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <input
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500 transition-colors"
              placeholder={selectedProblem ? "Ask anything about this problem…" : "Select a problem first, then ask for help…"}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && inputText.trim() && selectedProblem) {
                  e.preventDefault();
                  addMsg('user', inputText);
                  setInputText('');
                  hintMut.mutate();
                }
              }}
            />
            <Button
              icon={<Send size={16} />}
              disabled={!inputText.trim() || !selectedProblem}
              onClick={() => {
                if (inputText.trim() && selectedProblem) {
                  addMsg('user', inputText);
                  setInputText('');
                  hintMut.mutate();
                }
              }}
              loading={hintMut.isPending}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
