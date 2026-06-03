import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  Zap, Code2, Trophy, Swords, Bot, BarChart2,
  Users, ArrowRight, CheckCircle2, Star,
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useT } from '../i18n';

/* ── Staggered reveal variants ── */
const FADE_UP = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0 } };
const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };

/* ── Animated counter ── */
function Counter({ to, suffix = '' }: { to: number | string; suffix?: string }) {
  if (typeof to === 'string') return <span>{to}</span>;
  const count   = useMotionValue(0);
  const display = useTransform(count, v => Math.round(v).toLocaleString() + suffix);
  useEffect(() => {
    const ctrl = animate(count, to, { duration: 1.5, ease: 'easeOut' });
    return () => ctrl.stop();
  }, [to]);
  return <motion.span>{display}</motion.span>;
}

export function Landing() {
  const { theme, toggleTheme, lang, toggleLang } = useThemeStore();
  const t = useT();
  const isDark = theme === 'dark';

  const FEATURES = [
    { icon: Code2,     g: 'from-indigo-500 to-violet-600', title: lang==='ru'?'Умный судья':'Smart Judge',           desc: lang==='ru'?'Python и C++. Реальное выполнение. Детальный разбор каждого теста с AI-объяснением.':'Python & C++. Real execution. Per-test AI analysis.' },
    { icon: Trophy,    g: 'from-amber-400  to-orange-500',  title: lang==='ru'?'Живые контесты':'Live Contests',      desc: lang==='ru'?'ICPC-стиль. Таблица обновляется мгновенно через WebSocket. Заморозка за 30 минут.':'ICPC-style. Live standings via WebSocket. Final 30-min freeze.' },
    { icon: Swords,    g: 'from-rose-500   to-pink-600',    title: lang==='ru'?'Дуэли 1 на 1':'1v1 Duels',           desc: lang==='ru'?'Вызывай друзей. Случайная задача по теме. Кто быстрее — тот победил.':'Challenge friends. Random problem by topic. Fastest wins.' },
    { icon: Bot,       g: 'from-cyan-400   to-sky-600',     title: lang==='ru'?'AI Наставник':'AI Mentor',           desc: lang==='ru'?'Groq LLM. Объясняет ошибки на русском. Без спойлеров — только направление мысли.':'Groq LLM. Explains errors in your language. No spoilers.' },
    { icon: BarChart2, g: 'from-teal-400   to-emerald-600', title: lang==='ru'?'Визуализации':'Visualizations',      desc: lang==='ru'?'BFS, DFS, сортировки — пошаговые анимированные примеры для понимания алгоритмов.':'BFS, DFS, sorting — animated step-by-step algorithm demos.' },
    { icon: Users,     g: 'from-fuchsia-500 to-purple-600', title: lang==='ru'?'Командные олимпиады':'Team Olympiads', desc: lang==='ru'?'Создай команду. Real-time чат. Соревнуйтесь вместе в командных контестах.':'Create teams. Real-time chat. Compete together in team contests.' },
  ];

  const STATS = [
    { v: 10, s: '+', l: lang==='ru'?'задач':'problems' },
    { v: 5,  s: '+', l: lang==='ru'?'контестов':'contests' },
    { v: '<1',  s: 'с', l: lang==='ru'?'проверка кода':'judge time' },
    { v: 'AI', s: '', l: lang==='ru'?'наставник':'mentor' },
  ];

  const CMP = [
    [lang==='ru'?'AI наставник':'AI Mentor',       true,false,false],
    [lang==='ru'?'Дуэли 1v1':'1v1 Duels',          true,false,false],
    [lang==='ru'?'Командные контесты':'Team Contests',true,true,false],
    [lang==='ru'?'WebSocket standings':'Live Standings',true,false,false],
    [lang==='ru'?'Открытый исходник':'Open Source', true,false,false],
  ];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#030309', color: '#f1f5f9' }}>

      {/* ══ NAV ══════════════════════════════════════════════════ */}
      <nav className="fixed top-0 w-full z-50" style={{
        background: 'rgba(3,3,9,0.75)',
        backdropFilter: 'blur(24px) saturate(1.4)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center glow-pulse"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-black text-[15px] tracking-[-0.03em]"
              style={{ background:'linear-gradient(135deg,#e0e7ff,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              Aetheris
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={toggleTheme} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/8 transition-all cursor-pointer text-sm">
              {isDark ? '☀️' : '🌙'}
            </button>
            <button onClick={toggleLang} className="h-8 px-3 rounded-xl text-[11px] font-bold tracking-wider text-slate-400 hover:text-white hover:bg-white/8 transition-all cursor-pointer">
              {lang.toUpperCase()}
            </button>
            <Link to="/login">
              <button className="h-9 px-4 rounded-xl text-[13px] font-medium text-slate-300 hover:text-white hover:bg-white/6 transition-all cursor-pointer">
                {t.auth.login}
              </button>
            </Link>
            <Link to="/register">
              <button className="h-9 px-5 rounded-xl text-[13px] font-semibold text-white btn-glow cursor-pointer">
                {lang==='ru'?'Начать':'Get Started'}
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ══ HERO ═════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-14">
        {/* Grid */}
        <div className="absolute inset-0 grid-bg opacity-100" />

        {/* Blobs */}
        <div className="blob blob-indigo w-[700px] h-[700px]" style={{ top: '-10%', left: '-5%' }} />
        <div className="blob blob-violet w-[500px] h-[500px]" style={{ bottom: '0',  right: '-5%' }} />
        <div className="blob blob-cyan   w-[400px] h-[400px]" style={{ top: '60%',  left: '40%'  }} />

        {/* Gradient overlay */}
        <div className="absolute inset-0 hero-bg" />

        {/* Vignette */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(3,3,9,0.7) 100%)',
        }} />

        <div className="relative max-w-6xl mx-auto px-6 py-32 w-full">
          <motion.div initial="hidden" animate="show" variants={STAGGER} className="flex flex-col items-center text-center gap-8">

            {/* Beta pill */}
            <motion.div variants={FADE_UP}>
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-[12px] font-semibold"
                style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.25)', color:'#a5b4fc' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                {lang==='ru'?'Powered by Groq AI · Бета':'Powered by Groq AI · Beta'}
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </motion.div>

            {/* Main headline */}
            <motion.div variants={FADE_UP} className="max-w-4xl">
              <h1 className="display">
                {lang === 'ru' ? (
                  <>
                    <span className="gradient-text-hero block">Олимпиадное</span>
                    <span style={{ color: 'rgba(241,245,249,0.9)' }}>программирование</span>
                    <br />
                    <span className="gradient-text-hero">нового уровня</span>
                  </>
                ) : (
                  <>
                    <span className="gradient-text-hero">Competitive</span>
                    <br />
                    <span style={{ color: 'rgba(241,245,249,0.9)' }}>Programming</span>{' '}
                    <span className="gradient-text-hero">Reimagined</span>
                  </>
                )}
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p variants={FADE_UP} className="text-lg md:text-xl max-w-2xl leading-relaxed text-slate-400 font-light">
              {lang==='ru'
                ? 'Лучше Codeforces по интерфейсу. Мощнее LeetCode по функциям. AI-наставник, дуэли и командные контесты — всё в одном месте.'
                : 'Better UI than Codeforces. More powerful than LeetCode. AI mentor, duels, team contests — all in one place.'}
            </motion.p>

            {/* CTA */}
            <motion.div variants={FADE_UP} className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-[15px] font-bold text-white cursor-pointer btn-glow"
                >
                  {lang==='ru'?'Начать бесплатно':'Start for Free'}
                  <ArrowRight size={17} />
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-[15px] font-semibold cursor-pointer btn-ghost-border"
                >
                  {lang==='ru'?'Войти':'Sign In'}
                </motion.button>
              </Link>
            </motion.div>

            {/* Language tags */}
            <motion.div variants={FADE_UP} className="flex flex-wrap justify-center gap-2">
              {['Python 3', 'C++17'].map(l => (
                <span key={l} className="px-3 py-1.5 rounded-full text-[12px] font-mono font-medium"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#94a3b8' }}>
                  {l}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Terminal preview ── */}
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            transition={{ delay: 0.6, duration: 0.9, ease: [0.16,1,0.3,1] }}
            className="mt-20 max-w-2xl mx-auto"
          >
            <div className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(8,8,26,0.9)',
                border: '1px solid rgba(99,102,241,0.2)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 50px 120px rgba(0,0,0,0.9), 0 0 80px rgba(99,102,241,0.08)',
              }}>
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b"
                style={{ background:'rgba(255,255,255,0.02)', borderColor:'rgba(255,255,255,0.06)' }}>
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-3 text-[11px] font-mono text-slate-500 flex-1">solution.py</span>
                <div className="flex items-center gap-1.5">
                  <span className="st-ac pill text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    {lang==='ru'?'Принято':'Accepted'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">42мс</span>
                </div>
              </div>
              {/* Code */}
              <div className="p-6 font-mono text-[13px] leading-7">
                <div className="text-slate-500"># O(n) hash table — two sum</div>
                <div className="mt-1">
                  <span className="text-violet-400">def </span>
                  <span className="text-blue-300">two_sum</span>
                  <span className="text-slate-300">(nums: list, target: int) → list:</span>
                </div>
                <div className="pl-6 text-slate-400">seen = {'{}'}</div>
                <div className="pl-6">
                  <span className="text-violet-400">for </span>
                  <span className="text-blue-200">i, n </span>
                  <span className="text-violet-400">in </span>
                  <span className="text-blue-200">enumerate(nums):</span>
                </div>
                <div className="pl-12">
                  <span className="text-violet-400">if </span>
                  <span className="text-slate-300">target - n </span>
                  <span className="text-violet-400">in </span>
                  <span className="text-slate-300">seen:</span>
                </div>
                <div className="pl-20">
                  <span className="text-violet-400">return </span>
                  <span className="text-emerald-400">[seen[target - n], i]</span>
                </div>
                <div className="pl-12 text-slate-300">seen[n] = i</div>
              </div>
              {/* Status bar */}
              <div className="px-5 py-2.5 flex items-center justify-between border-t"
                style={{ background:'rgba(255,255,255,0.01)', borderColor:'rgba(255,255,255,0.04)' }}>
                <span className="text-[11px] font-mono text-slate-500">3/3 тестов пройдено</span>
                <div className="flex gap-1.5">
                  {[1,2,3].map(i => (
                    <motion.div key={i} className="w-5 h-5 rounded-md flex items-center justify-center text-emerald-400"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 + i * 0.1 }}
                      style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)' }}>
                      <span className="text-[9px] font-bold">✓</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ STATS ════════════════════════════════════════════════ */}
      <section className="py-16 relative" style={{ background:'rgba(8,8,26,0.5)', borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map(({ v, s, l }, i) => (
            <motion.div key={l}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
            >
              <div className="text-5xl font-black tracking-tight gradient-text-hero mb-1">
                {typeof v === 'number' ? <Counter to={v} suffix={s} /> : `${v}${s}`}
              </div>
              <div className="text-sm text-slate-500 font-medium">{l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ═════════════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="blob blob-indigo w-[600px] h-[600px] opacity-30" style={{ top:'10%', right:'-10%' }} />
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-16">
            <div className="text-xs font-bold tracking-[0.2em] text-indigo-400 uppercase mb-4">
              {lang==='ru'?'Возможности':'Features'}
            </div>
            <h2 className="heading-xl text-white mb-4">
              {lang==='ru'?'Всё для победы':'Everything to'}
              <br />
              <span className="gradient-text-hero">{lang==='ru'?'в одном месте':'Win, in one place'}</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              {lang==='ru'?'Создано программистами для программистов':'Built by competitive programmers, for you.'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, g, title, desc }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.55, ease: [0.16,1,0.3,1] }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass-card p-7 group cursor-default"
              >
                {/* Icon */}
                <div className={`inline-flex w-12 h-12 rounded-2xl items-center justify-center mb-5 bg-gradient-to-br ${g} shadow-xl`}>
                  <Icon size={22} className="text-white" />
                </div>
                {/* Shine line */}
                <div className="absolute top-0 left-0 right-0 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background:'linear-gradient(90deg,transparent,rgba(129,140,248,0.6),transparent)' }} />
                <h3 className="text-[15px] font-semibold text-white mb-2 tracking-[-0.01em]">{title}</h3>
                <p className="text-[13px] text-slate-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMPARISON ═══════════════════════════════════════════ */}
      <section className="py-24 relative" style={{ background:'rgba(8,8,26,0.4)' }}>
        <div className="max-w-3xl mx-auto px-6">
          <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-12">
            <h2 className="heading-xl text-white mb-3">
              {lang==='ru'?'Почему ':'Why '}
              <span className="gradient-text-hero">Aetheris?</span>
            </h2>
            <p className="text-slate-400">{lang==='ru'?'Честное сравнение':'An honest comparison'}</p>
          </motion.div>
          <motion.div initial={{ opacity:0, y:32 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            transition={{ duration: 0.6, ease:[0.16,1,0.3,1] }}
            className="rounded-2xl overflow-hidden"
            style={{ background:'rgba(8,8,26,0.8)', border:'1px solid rgba(255,255,255,0.07)', boxShadow:'0 40px 80px rgba(0,0,0,0.5)' }}>
            <div className="grid grid-cols-4 border-b" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
              <div className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{lang==='ru'?'Функция':'Feature'}</div>
              {['Aetheris','Codeforces','LeetCode'].map(p => (
                <div key={p} className={`px-5 py-4 text-center text-[13px] font-bold ${p==='Aetheris'?'text-indigo-400':'text-slate-500'}`}>{p}</div>
              ))}
            </div>
            {CMP.map(([feat,...vals], i) => (
              <motion.div key={i} initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay: i*0.05 }}
                className="grid grid-cols-4 border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor:'rgba(255,255,255,0.04)' }}>
                <div className="px-5 py-3.5 text-[13px] text-slate-300">{feat as string}</div>
                {(vals as boolean[]).map((v, j) => (
                  <div key={j} className="px-5 py-3.5 flex justify-center">
                    {v ? <CheckCircle2 size={15} className="text-emerald-400" />
                       : <div className="w-4 h-px bg-slate-700 mt-2" />}
                  </div>
                ))}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ═════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-12">
            <h2 className="heading-xl text-white">
              {lang==='ru'?'Что говорят ':'What '}
              <span className="gradient-text-hero">{lang==='ru'?'участники':'coders say'}</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { u:'algo_master', t: lang==='ru'?'Aetheris лучше Codeforces. AI объясняет ошибки как репетитор — понятно и без спойлеров.':'Better than Codeforces. AI explains mistakes like a tutor — clear and without spoilers.' },
              { u:'cp_grinder',  t: lang==='ru'?'Система дуэлей затягивает. За месяц вырос на 400 рейтинга — реально работает.':'The duel system is addictive. I grew 400 rating in a month — it genuinely works.' },
              { u:'team_coder',  t: lang==='ru'?'Наконец платформа, которая серьёзно относится к командным контестам. Real-time чат — огонь.':'Finally a platform that takes team contests seriously. Real-time chat is 🔥' },
            ].map(({ u, t: txt }, i) => (
              <motion.div key={u}
                initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
                transition={{ delay:i*0.1, duration:0.5, ease:[0.16,1,0.3,1] }}
                whileHover={{ y:-3, transition:{duration:0.2} }}
                className="glass-card p-6 cursor-default"
              >
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(n => <Star key={n} size={12} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-[13px] text-slate-300 leading-relaxed mb-5">"{txt}"</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                    style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    {u[0].toUpperCase()}
                  </div>
                  <span className="text-[13px] font-medium text-slate-400">@{u}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══════════════════════════════════════════════════ */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="blob blob-indigo w-[800px] h-[800px] opacity-20" style={{ top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
        <div className="absolute inset-0 hero-bg" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity:0, y:32 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            transition={{ duration:0.7, ease:[0.16,1,0.3,1] }}>
            <h2 className="display text-white mb-6">
              {lang==='ru'?'Готов к ':'Ready to'}
              <br />
              <span className="gradient-text-hero">{lang==='ru'?'победе?':'Win?'}</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto">
              {lang==='ru'?'Присоединяйся бесплатно и начни решать задачи прямо сейчас.':'Join free and start solving problems right now.'}
            </p>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-base font-bold text-white btn-glow cursor-pointer"
              >
                {lang==='ru'?'Начать бесплатно':'Get Started Free'}
                <ArrowRight size={19} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════ */}
      <footer className="border-t py-8" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between gap-4 text-slate-500 text-[12px]">
          <div className="flex items-center gap-2">
            <Zap size={12} className="text-indigo-400" />
            <span className="font-bold text-slate-400">Aetheris</span>
          </div>
          <span>© 2025 Aetheris</span>
        </div>
      </footer>
    </div>
  );
}
