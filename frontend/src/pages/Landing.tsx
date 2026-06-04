import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Code2, Trophy, Swords, Bot, BarChart2, Users, ArrowRight, Star, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useThemeStore } from '../store/themeStore';
import { useT } from '../i18n';

const fade     = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger  = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

export function Landing() {
  const { theme, toggleTheme, lang, toggleLang } = useThemeStore();
  const t = useT();
  const isDark = theme === 'dark';

  const FEATURES = [
    { icon: Code2,     title: lang === 'ru' ? 'Умный судья'       : 'Smart Judge',         desc: lang === 'ru' ? 'Python и C++, реальное выполнение, детальный разбор каждого теста.'       : 'Real-time execution with Python & C++, detailed per-test analysis.' },
    { icon: Trophy,    title: lang === 'ru' ? 'Живые контесты'    : 'Live Contests',        desc: lang === 'ru' ? 'Рейтинговые соревнования с таблицей в реальном времени.'                  : 'Rated contests with live leaderboard and real-time scoring.' },
    { icon: Swords,    title: lang === 'ru' ? 'Дуэли 1 на 1'      : '1v1 Duels',            desc: lang === 'ru' ? 'Вызывай соперников на поединок — кто первый решит задачу.'                : 'Challenge opponents to head-to-head coding battles.' },
    { icon: Bot,       title: lang === 'ru' ? 'AI Наставник'      : 'AI Mentor',            desc: lang === 'ru' ? 'Groq LLM отвечает на русском — подсказки, анализ кода, отладка.'          : 'Groq LLM — hints, code reviews, and debug help instantly.' },
    { icon: BarChart2, title: lang === 'ru' ? 'Визуализации'      : 'Visualizations',       desc: lang === 'ru' ? 'Пошаговые анимации классических алгоритмов — BFS, сортировка и другие.'   : 'Step-by-step animated visualizations of classic algorithms.' },
    { icon: Users,     title: lang === 'ru' ? 'Командные олимпиады': 'Team Olympiads',       desc: lang === 'ru' ? 'Создай команду, соревнуйся вместе и поднимайся в командном рейтинге.'   : 'Form teams, compete together, climb team rankings.' },
  ];

  const STATS = [
    { value: '10',   label: lang === 'ru' ? 'Задач'         : 'Problems'   },
    { value: '5',    label: lang === 'ru' ? 'Контестов'     : 'Contests'   },
    { value: '< 1с', label: lang === 'ru' ? 'Время проверки': 'Judge Time' },
    { value: 'AI',   label: lang === 'ru' ? 'Наставник'     : 'Mentor'     },
  ];

  const TESTIMONIALS = [
    { user: 'algo_master', text: lang === 'ru' ? 'Aetheris лучше Codeforces. AI подсказки — просто огонь для обучения.' : 'Aetheris feels better than Codeforces. The AI hints are a game changer for learning.', stars: 5 },
    { user: 'cp_grinder',  text: lang === 'ru' ? 'Система дуэлей затягивает. За месяц вырос на 400 рейтинга.' : 'The duel system is addictive. I improved by 400 rating points in a month.', stars: 5 },
    { user: 'team_coder',  text: lang === 'ru' ? 'Наконец платформа, которая серьёзно относится к командным контестам.' : 'Finally a platform that takes team contests seriously.', stars: 5 },
  ];

  return (
    <div className={`min-h-screen overflow-x-hidden ${isDark ? 'bg-[#080814] text-white' : 'bg-white text-slate-900'}`}>

      {/* ── Навбар лендинга ── */}
      <nav className={`fixed top-0 w-full z-50 backdrop-blur-xl border-b ${isDark ? 'bg-[#080814]/85 border-slate-800/60' : 'bg-white/90 border-slate-200'}`}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center glow-pulse"><Zap size={14} className="text-white" /></div>
            <span className="font-black text-base gradient-text">Aetheris</span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
              {isDark ? <span className="text-base">☀️</span> : <span className="text-base">🌙</span>}
            </button>
            <button onClick={toggleLang} className={`h-8 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
              {lang.toUpperCase()}
            </button>
            <Link to="/login"><Button variant="ghost" size="sm">{t.auth.login}</Button></Link>
            <Link to="/register"><Button size="sm">{lang === 'ru' ? 'Начать' : 'Get Started'}</Button></Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={`relative min-h-screen flex items-center pt-14 hero-grid ${isDark ? '' : 'bg-gradient-to-br from-white via-purple-50/40 to-cyan-50/30'}`}>
        {/* Орбы */}
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center w-full">
          <motion.div initial="hidden" animate="show" variants={stagger} className="flex flex-col items-center gap-6">

            <motion.div variants={fade}>
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border ${isDark ? 'bg-purple-900/40 border-purple-700/40 text-purple-300' : 'bg-purple-100 border-purple-200 text-purple-700'}`}>
                <Zap size={12} /> {lang === 'ru' ? 'Powered by Groq AI · Бета' : 'Powered by Groq AI · Beta'}
              </span>
            </motion.div>

            <motion.h1 variants={fade} className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
              {lang === 'ru' ? (
                <><span className="gradient-text">Олимпиадное</span><br />программирование<br />нового уровня</>
              ) : (
                <>The <span className="gradient-text">Future</span> of<br />Competitive Programming</>
              )}
            </motion.h1>

            <motion.p variants={fade} className={`text-xl max-w-2xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {lang === 'ru'
                ? 'Лучше Codeforces по интерфейсу. Лучше LeetCode по функциям. AI-наставник, дуэли, командные контесты — всё в одном месте.'
                : 'Better than Codeforces UI. More features than LeetCode. AI mentoring, duels, team contests — all in one place.'}
            </motion.p>

            <motion.div variants={fade} className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/register">
                <Button size="lg" icon={<ArrowRight size={18} />} className="glow-pulse px-8">
                  {lang === 'ru' ? 'Начать бесплатно' : 'Start for Free'}
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  {lang === 'ru' ? 'Войти' : 'Sign In'}
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fade} className="flex flex-wrap justify-center gap-4 mt-2">
              {['Python', 'C++', 'Java', 'Go'].map(l => (
                <span key={l} className={`px-3 py-1 text-xs rounded-full border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>{l}</span>
              ))}
            </motion.div>
          </motion.div>

          {/* Код-превью */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7 }}
            className="mt-20 mx-auto max-w-3xl">
            <div className={`rounded-2xl border overflow-hidden shadow-2xl ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
              <div className={`flex items-center gap-2 px-4 py-3 border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className={`ml-2 text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>solution.py · {lang === 'ru' ? 'Сумма двух чисел' : 'Two Sum'}</span>
                <div className="ml-auto flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700 border border-emerald-200">
                    {lang === 'ru' ? '✓ Принято' : '✓ Accepted'}
                  </span>
                  <span className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>42мс · 16МБ</span>
                </div>
              </div>
              <div className="p-6 font-mono text-sm text-left">
                <div className={isDark ? 'text-slate-500' : 'text-slate-400'}># O(n) — хэш-таблица</div>
                <br />
                <div><span className="text-purple-500">def </span><span className="text-cyan-600">two_sum</span><span className={isDark ? 'text-white' : 'text-slate-800'}>(nums, target):</span></div>
                <div className="pl-6"><span className={isDark ? 'text-white' : 'text-slate-800'}>seen = </span><span className="text-yellow-500">{'{}'}</span></div>
                <div className="pl-6"><span className="text-purple-500">for </span><span className={isDark ? 'text-white' : 'text-slate-800'}>i, n </span><span className="text-purple-500">in </span><span className={isDark ? 'text-white' : 'text-slate-800'}>enumerate(nums):</span></div>
                <div className="pl-12"><span className="text-purple-500">if </span><span className={isDark ? 'text-white' : 'text-slate-800'}>target - n </span><span className="text-purple-500">in </span><span className={isDark ? 'text-white' : 'text-slate-800'}>seen:</span></div>
                <div className="pl-20"><span className="text-purple-500">return </span><span className={isDark ? 'text-white' : 'text-slate-800'}>[seen[target - n], i]</span></div>
                <div className="pl-12"><span className={isDark ? 'text-white' : 'text-slate-800'}>seen[n] = i</span></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Статистика ── */}
      <section className={`py-16 border-y ${isDark ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-50'}`}>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="text-4xl font-black gradient-text mb-1">{value}</div>
              <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Фичи ── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-3">
              {lang === 'ru' ? 'Всё что нужно для' : 'Everything You Need to'}{' '}
              <span className="gradient-text">{lang === 'ru' ? 'победы' : 'Win'}</span>
            </h2>
            <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {lang === 'ru' ? 'Создано программистами для программистов' : 'Built by competitive programmers, for competitive programmers.'}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className={`group p-6 rounded-2xl border transition-all duration-200 ${isDark ? 'border-slate-800 bg-slate-900/40 hover:border-purple-700/50 hover:bg-slate-900/70' : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-md'}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${isDark ? 'bg-purple-900/40 border border-purple-700/30' : 'bg-purple-100'}`}>
                  <Icon size={22} className="text-purple-600" />
                </div>
                <h3 className="text-base font-semibold mb-2">{title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Отзывы ── */}
      <section className={`py-20 ${isDark ? 'bg-slate-900/20' : 'bg-slate-50'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-14">
            {lang === 'ru' ? 'Отзывы ' : 'Loved by '}
            <span className="gradient-text">{lang === 'ru' ? 'участников' : 'Competitive Programmers'}</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ user, text, stars }) => (
              <motion.div key={user} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className={`p-6 rounded-2xl border ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white shadow-sm'}`}>
                <div className="flex gap-1 mb-4">
                  {Array(stars).fill(0).map((_, i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>"{text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">
                    {user[0].toUpperCase()}
                  </div>
                  <span className={`text-sm font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>@{user}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className={`p-12 rounded-3xl border ${isDark ? 'border-purple-700/30 bg-purple-900/10' : 'border-purple-200 bg-purple-50'}`}>
            <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center mx-auto mb-6 glow-pulse">
              <Zap size={28} className="text-white" />
            </div>
            <h2 className="text-4xl font-black mb-3">
              {lang === 'ru' ? 'Готов соревноваться?' : 'Ready to Compete?'}
            </h2>
            <p className={`text-lg mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {lang === 'ru' ? 'Регистрация бесплатна. Навсегда.' : 'Free forever. Join thousands of programmers.'}
            </p>
            <Link to="/register">
              <Button size="lg" icon={<ArrowRight size={18} />} className="px-10 py-4 text-base">
                {lang === 'ru' ? 'Создать аккаунт' : 'Create Free Account'}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Футер ── */}
      <footer className={`border-t py-10 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center"><Zap size={12} className="text-white" /></div>
            <span className="font-bold text-sm gradient-text">Aetheris</span>
          </div>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            © 2024 Aetheris. {lang === 'ru' ? 'Для нового поколения программистов.' : 'Built for the next generation of competitive programmers.'}
          </p>
          <a href="#" className={`text-sm flex items-center gap-1 ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'} transition-colors`}>
            <ExternalLink size={14} /> GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
