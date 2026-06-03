import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Code2, Trophy, Swords, Bot, BarChart2,
  Users, ArrowRight, Star, CheckCircle2,
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useT } from '../i18n';

const fade    = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

export function Landing() {
  const { theme, toggleTheme, lang, toggleLang } = useThemeStore();
  const t = useT();
  const isDark = theme === 'dark';

  const FEATURES = [
    { icon: Code2,     gradient: 'from-purple-500 to-violet-600', title: lang === 'ru' ? 'Умный судья'        : 'Smart Judge',      desc: lang === 'ru' ? 'Python и C++, реальное выполнение кода, детальный разбор каждого теста.'      : 'Real-time Python & C++ execution with per-test analysis.' },
    { icon: Trophy,    gradient: 'from-yellow-500 to-orange-500', title: lang === 'ru' ? 'Живые контесты'     : 'Live Contests',    desc: lang === 'ru' ? 'ICPC-стиль, таблица обновляется в реальном времени, заморозка последних 30 мин.' : 'ICPC-style contests with live leaderboard and standings freeze.' },
    { icon: Swords,    gradient: 'from-red-500 to-rose-600',      title: lang === 'ru' ? 'Дуэли 1 на 1'       : '1v1 Duels',        desc: lang === 'ru' ? 'Вызывай друзей на поединок — кто первый решит задачу по выбранной теме.'         : 'Challenge friends to head-to-head battles on chosen difficulty.' },
    { icon: Bot,       gradient: 'from-cyan-500 to-sky-600',      title: lang === 'ru' ? 'AI Наставник'       : 'AI Mentor',        desc: lang === 'ru' ? 'Groq LLM объясняет ошибки на русском — без спойлеров, только направление.'     : 'Groq LLM explains errors without spoilers — only hints.' },
    { icon: BarChart2, gradient: 'from-emerald-500 to-teal-600',  title: lang === 'ru' ? 'Визуализации'       : 'Visualizations',   desc: lang === 'ru' ? 'Пошаговые анимации BFS, DFS, сортировок и других алгоритмов.'                  : 'Animated step-by-step algorithm visualizations.' },
    { icon: Users,     gradient: 'from-pink-500 to-fuchsia-600',  title: lang === 'ru' ? 'Командные олимпиады': 'Team Olympiads',   desc: lang === 'ru' ? 'Создай команду, общайтесь в real-time чате и побеждайте вместе.'                : 'Create teams, chat in real-time, and conquer together.' },
  ];

  const STATS = [
    { value: '10+', label: lang === 'ru' ? 'Задач'      : 'Problems'   },
    { value: '5+',  label: lang === 'ru' ? 'Контестов'  : 'Contests'   },
    { value: '<1с', label: lang === 'ru' ? 'Проверка'   : 'Judge Time' },
    { value: 'AI',  label: lang === 'ru' ? 'Наставник'  : 'Mentor'     },
  ];

  const CODE_LINES = [
    { tokens: [{ t: '# O(n) — хэш-таблица', c: 'text-[var(--text-3)]' }] },
    { tokens: [] },
    { tokens: [{ t: 'def ', c: 'text-purple-400' }, { t: 'two_sum', c: 'text-cyan-400' }, { t: '(nums, target):', c: 'text-[var(--text-2)]' }] },
    { tokens: [{ t: '    ', c: '' }, { t: 'seen', c: 'text-[var(--text-1)]' }, { t: ' = ', c: 'text-purple-400' }, { t: '{}', c: 'text-yellow-400' }] },
    { tokens: [{ t: '    ', c: '' }, { t: 'for ', c: 'text-purple-400' }, { t: 'i, n ', c: 'text-[var(--text-1)]' }, { t: 'in ', c: 'text-purple-400' }, { t: 'enumerate(nums):', c: 'text-[var(--text-2)]' }] },
    { tokens: [{ t: '        ', c: '' }, { t: 'if ', c: 'text-purple-400' }, { t: 'target - n ', c: 'text-[var(--text-1)]' }, { t: 'in ', c: 'text-purple-400' }, { t: 'seen:', c: 'text-[var(--text-2)]' }] },
    { tokens: [{ t: '            ', c: '' }, { t: 'return ', c: 'text-purple-400' }, { t: '[seen[target - n], i]', c: 'text-emerald-400' }] },
    { tokens: [{ t: '        ', c: '' }, { t: 'seen', c: 'text-[var(--text-1)]' }, { t: '[n]', c: 'text-yellow-400' }, { t: ' = i', c: 'text-[var(--text-2)]' }] },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#050508', color: '#e2e8f0' }}>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl" style={{ background: 'rgba(5,5,8,0.8)', borderBottom: '1px solid rgba(26,26,46,0.8)' }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center glow-pulse shadow-lg shadow-purple-600/40">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-black text-base gradient-text">Aetheris</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/8 transition-all cursor-pointer text-base">
              {isDark ? '☀️' : '🌙'}
            </button>
            <button onClick={toggleLang}
              className="h-8 px-2.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-white/8 transition-all cursor-pointer">
              {lang.toUpperCase()}
            </button>
            <Link to="/login">
              <button className="h-8 px-4 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/8 transition-all cursor-pointer">
                {t.auth.login}
              </button>
            </Link>
            <Link to="/register">
              <button className="h-8 px-4 rounded-lg text-sm font-semibold text-white btn-primary-glow cursor-pointer">
                {lang === 'ru' ? 'Начать' : 'Get Started'}
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-14 overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }} />
        {/* Orbs */}
        <div className="orb-1" style={{ top: '15%', left: '5%' }} />
        <div className="orb-2" style={{ bottom: '10%', right: '5%' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />

        <div className="relative max-w-6xl mx-auto px-6 py-28 w-full">
          <motion.div initial="hidden" animate="show" variants={stagger} className="flex flex-col items-center text-center gap-7">

            {/* Badge */}
            <motion.div variants={fade}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border border-purple-500/30 bg-purple-500/8 text-purple-300">
                <Zap size={11} className="text-purple-400" />
                {lang === 'ru' ? 'Powered by Groq AI · Бета' : 'Powered by Groq AI · Beta'}
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fade} className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight">
              {lang === 'ru' ? (
                <>
                  <span className="gradient-text">Олимпиадное</span>
                  <br />
                  <span style={{ color: '#e2e8f0' }}>программирование</span>
                  <br />
                  <span className="gradient-text-warm">нового уровня</span>
                </>
              ) : (
                <>
                  <span style={{ color: '#e2e8f0' }}>The </span>
                  <span className="gradient-text">Future</span>
                  <span style={{ color: '#e2e8f0' }}> of</span>
                  <br />
                  <span className="gradient-text-warm">Competitive Programming</span>
                </>
              )}
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={fade} className="text-lg md:text-xl max-w-2xl leading-relaxed text-slate-400">
              {lang === 'ru'
                ? 'Лучше Codeforces по интерфейсу. Лучше LeetCode по функциям. AI-наставник, дуэли, командные контесты — всё в одном месте.'
                : 'Better UI than Codeforces. More features than LeetCode. AI mentoring, duels, team contests — all in one place.'}
            </motion.p>

            {/* CTA */}
            <motion.div variants={fade} className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/register">
                <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold text-white btn-primary-glow cursor-pointer">
                  {lang === 'ru' ? 'Начать бесплатно' : 'Start for Free'}
                  <ArrowRight size={18} />
                </button>
              </Link>
              <Link to="/login">
                <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold btn-outline-glow cursor-pointer">
                  {lang === 'ru' ? 'Войти' : 'Sign In'}
                </button>
              </Link>
            </motion.div>

            {/* Languages */}
            <motion.div variants={fade} className="flex flex-wrap justify-center gap-2 mt-1">
              {['Python', 'C++'].map(l => (
                <span key={l} className="px-3 py-1 text-xs rounded-full border border-[#1a1a2e] bg-[#0d0d18] text-slate-400 font-mono">{l}</span>
              ))}
            </motion.div>
          </motion.div>

          {/* Code preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8, ease: [0.22,1,0.36,1] }}
            className="mt-20 mx-auto max-w-2xl"
          >
            <div className="rounded-2xl overflow-hidden border border-[#1a1a2e] shadow-2xl"
              style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(124,58,237,0.1), 0 0 60px rgba(124,58,237,0.05)' }}>
              {/* Window bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a2e]" style={{ background: '#0a0a14' }}>
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                <span className="ml-2 text-xs font-mono text-slate-500">solution.py</span>
                <div className="ml-auto flex items-center gap-3">
                  <span className="status-accepted px-2 py-0.5 rounded-full text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1.5" />
                    {lang === 'ru' ? 'Принято' : 'Accepted'}
                  </span>
                  <span className="text-xs font-mono text-slate-500">42мс · 16МБ</span>
                </div>
              </div>
              {/* Code */}
              <div className="p-6 font-mono text-sm" style={{ background: '#0d0d18' }}>
                {CODE_LINES.map((line, i) => (
                  <div key={i} className="leading-6">
                    {line.tokens.length === 0
                      ? <span>&nbsp;</span>
                      : line.tokens.map((tok, j) => (
                          <span key={j} className={tok.c}>{tok.t}</span>
                        ))
                    }
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-14 border-y" style={{ borderColor: '#1a1a2e', background: 'rgba(13,13,24,0.5)' }}>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map(({ value, label }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="text-4xl font-black gradient-text mb-1">{value}</div>
              <div className="text-sm text-slate-400">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
                {lang === 'ru' ? 'Всё что нужно для ' : 'Everything to '}
                <span className="gradient-text">{lang === 'ru' ? 'победы' : 'Win'}</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-xl mx-auto">
                {lang === 'ru' ? 'Создано программистами для программистов' : 'Built by competitive programmers, for competitive programmers.'}
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, gradient, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22,1,0.36,1] }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative p-6 rounded-2xl border border-[#1a1a2e] overflow-hidden cursor-default"
                style={{ background: '#0d0d18' }}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />
                {/* Top border glow on hover */}
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.6), transparent)' }} />

                <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${gradient} shadow-lg`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="relative text-base font-semibold text-white mb-2">{title}</h3>
                <p className="relative text-sm leading-relaxed text-slate-400">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why better ── */}
      <section className="py-20 border-t" style={{ borderColor: '#1a1a2e' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-black text-white mb-4">
              {lang === 'ru' ? 'Почему ' : 'Why '}
              <span className="gradient-text">Aetheris?</span>
            </h2>
            <p className="text-slate-400 mb-12">
              {lang === 'ru' ? 'Честное сравнение с другими платформами' : 'An honest comparison with other platforms'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-[#1a1a2e] overflow-hidden"
            style={{ background: '#0d0d18' }}
          >
            <div className="grid grid-cols-4 text-sm">
              <div className="p-4 text-left text-slate-400 font-medium">
                {lang === 'ru' ? 'Функция' : 'Feature'}
              </div>
              {['Aetheris', 'Codeforces', 'LeetCode'].map(p => (
                <div key={p} className={`p-4 text-center font-semibold ${p === 'Aetheris' ? 'text-purple-400' : 'text-slate-500'}`}>{p}</div>
              ))}
            </div>
            {[
              [lang === 'ru' ? 'AI наставник' : 'AI Mentor',       true,  false, false],
              [lang === 'ru' ? 'Дуэли 1v1'   : '1v1 Duels',        true,  false, false],
              [lang === 'ru' ? 'Командные'    : 'Team Contests',    true,  true,  false],
              [lang === 'ru' ? 'Тёмный UI'    : 'Dark-first UI',    true,  false, true ],
              [lang === 'ru' ? 'Open-source'  : 'Open-source',      true,  false, false],
            ].map(([feature, ...vals], i) => (
              <div key={i} className="grid grid-cols-4 border-t text-sm" style={{ borderColor: '#1a1a2e' }}>
                <div className="p-4 text-left text-slate-300">{feature as string}</div>
                {(vals as boolean[]).map((v, j) => (
                  <div key={j} className="p-4 flex justify-center">
                    {v
                      ? <CheckCircle2 size={16} className="text-emerald-400" />
                      : <span className="w-4 h-px bg-slate-700 mt-2 block" />}
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20" style={{ background: 'rgba(13,13,24,0.4)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-black text-white">
              {lang === 'ru' ? 'Что говорят ' : 'What '}
              <span className="gradient-text">{lang === 'ru' ? 'участники' : 'Coders Say'}</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { user: 'algo_master', text: lang === 'ru' ? 'Aetheris лучше Codeforces. AI подсказки — просто огонь для обучения.' : 'Aetheris feels better than Codeforces. The AI hints are a game changer.' },
              { user: 'cp_grinder',  text: lang === 'ru' ? 'Система дуэлей затягивает. За месяц вырос на 400 рейтинга.'          : 'The duel system is addictive. I improved by 400 rating in a month.'    },
              { user: 'team_coder',  text: lang === 'ru' ? 'Наконец платформа, которая серьёзно относится к командным контестам.' : 'Finally a platform that takes team contests seriously.'                  },
            ].map(({ user, text }, i) => (
              <motion.div key={user}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl border border-[#1a1a2e] relative"
                style={{ background: '#0d0d18' }}
              >
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(n => <Star key={n} size={12} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">"{text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-xs font-bold text-white">
                    {user[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-400">@{user}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh opacity-60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-5xl font-black text-white mb-6">
              {lang === 'ru' ? 'Готов к ' : 'Ready to '}
              <span className="gradient-text">{lang === 'ru' ? 'победе?' : 'Win?'}</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              {lang === 'ru' ? 'Присоединяйся бесплатно и начни решать задачи прямо сейчас.' : 'Join for free and start solving problems right now.'}
            </p>
            <Link to="/register">
              <button className="inline-flex items-center gap-2 px-10 py-4 rounded-xl text-lg font-bold text-white btn-primary-glow cursor-pointer">
                {lang === 'ru' ? 'Начать бесплатно' : 'Get Started Free'}
                <ArrowRight size={20} />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-8" style={{ borderColor: '#1a1a2e' }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-purple-500" />
            <span className="font-bold text-slate-400">Aetheris</span>
            <span>— {lang === 'ru' ? 'олимпиадная платформа' : 'competitive programming platform'}</span>
          </div>
          <span>© 2025 Aetheris. {lang === 'ru' ? 'Все права защищены.' : 'All rights reserved.'}</span>
        </div>
      </footer>
    </div>
  );
}
