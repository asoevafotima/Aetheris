import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Code2, Trophy, Swords, Bot, BarChart2, Users, Star, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useT } from '../i18n';

const FI = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const ST = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };

export function Landing() {
  const { theme, toggleTheme, lang, toggleLang } = useThemeStore();
  const t = useT();
  const isDark = theme === 'dark';

  const FEATURES = [
    { Icon: Code2,     title: lang==='ru'?'Умный судья':'Smart Judge',       desc: lang==='ru'?'Python и C++. Реальная проверка. AI разбирает ошибки на русском.':'Real Python & C++ execution with AI error analysis.' },
    { Icon: Trophy,    title: lang==='ru'?'Живые контесты':'Live Contests',   desc: lang==='ru'?'ICPC‑стиль с WebSocket. Таблица обновляется в реальном времени.':'ICPC-style with live WebSocket standings.' },
    { Icon: Swords,    title: lang==='ru'?'Дуэли 1 на 1':'1v1 Duels',        desc: lang==='ru'?'Вызывай соперников. Случайная задача по сложности. Кто быстрее.':'Challenge opponents. Random problem by difficulty.' },
    { Icon: Bot,       title: lang==='ru'?'AI Наставник':'AI Mentor',         desc: lang==='ru'?'Groq LLM. Объясняет без спойлеров. Отвечает по‑русски.':'Groq LLM explains errors without spoilers.' },
    { Icon: BarChart2, title: lang==='ru'?'Визуализации':'Visualizations',   desc: lang==='ru'?'Пошаговые анимации BFS, DFS, сортировок и других алгоритмов.':'Animated step-by-step algorithm visualizations.' },
    { Icon: Users,     title: lang==='ru'?'Команды':'Teams',                  desc: lang==='ru'?'Командные контесты. Real‑time чат. Общий рейтинг.':'Team contests with real-time chat and ratings.' },
  ];

  const STATS = [
    { n: '50K+', l: lang==='ru'?'участников':'members'  },
    { n: '10K+', l: lang==='ru'?'задач':'problems'      },
    { n: '1K+',  l: lang==='ru'?'контестов':'contests'  },
    { n: 'AI',   l: lang==='ru'?'наставник':'mentor'    },
  ];

  const bg = isDark ? '#030305' : '#f8f9fc';
  const fg = isDark ? '#f1f5f9' : '#0d0d1a';

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Inter', sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ─── NAV ───────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: isDark ? 'rgba(3,3,5,0.85)' : 'rgba(248,249,252,0.85)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              className="glow-pulse">
              <Zap size={13} color="#fff" />
            </div>
            <span style={{ fontWeight: 900, fontSize: 15, letterSpacing: '-0.03em' }} className="gradient-text">Aetheris</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={toggleTheme} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: isDark ? '#94a3b8' : '#64748b' }} className="hover:bg-white/10 transition-colors">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button onClick={toggleLang} style={{ height: 32, padding: '0 10px', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: isDark ? '#94a3b8' : '#64748b' }}>
              {lang.toUpperCase()}
            </button>
            <Link to="/login" style={{ height: 34, padding: '0 14px', borderRadius: 10, display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 500, color: isDark ? '#94a3b8' : '#4a5568', textDecoration: 'none' }}
              className="hover:text-white/90 transition-colors">
              {t.auth.login}
            </Link>
            <Link to="/register" style={{ height: 34, padding: '0 16px', borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', textDecoration: 'none' }}
              className="btn-primary">
              {lang==='ru'?'Начать':'Get Started'}
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Grid bg */}
        <div className="hero-grid" style={{ position: 'absolute', inset: 0 }} />
        {/* Glow blobs */}
        <div className="hero-glow-left" />
        <div className="hero-glow-right" />
        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: `linear-gradient(to top, ${bg}, transparent)`, zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto', padding: '80px 24px', width: '100%', textAlign: 'center' }}>
          <motion.div initial="hidden" animate="show" variants={ST} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>

            {/* Badge */}
            <motion.div variants={FI}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 99,
                background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
                color: '#a78bfa', fontSize: 12, fontWeight: 600,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'glow-pulse 2s infinite' }} />
                {lang==='ru'?'Powered by Groq AI · Beta':'Powered by Groq AI · Beta'}
              </span>
            </motion.div>

            {/* Title */}
            <motion.div variants={FI}>
              <h1 style={{ fontSize: 'clamp(52px,8vw,96px)', fontWeight: 800, lineHeight: 1.02, letterSpacing: '-0.04em', margin: 0 }}>
                <span className="gradient-text">Aetheris</span>
              </h1>
              <p style={{ fontSize: 'clamp(16px,2vw,22px)', color: isDark ? '#94a3b8' : '#4a5568', marginTop: 20, maxWidth: 600, lineHeight: 1.6 }}>
                {lang==='ru'
                  ? 'Олимпиадная платформа нового уровня. AI‑наставник, дуэли 1 на 1, командные контесты и мгновенная проверка кода.'
                  : 'Next-gen competitive programming platform. AI mentor, 1v1 duels, team contests, and instant code judging.'}
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div variants={FI} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', border: 'none' }}
                  className="btn-primary"
                >
                  {lang==='ru'?'Начать бесплатно':'Start for Free'}
                  <ArrowRight size={16} />
                </motion.button>
              </Link>
              <Link to="/problems">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: 'pointer', background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`, color: isDark ? '#e2e8f0' : '#1a1a2e' }}
                  className="btn-outline"
                >
                  {lang==='ru'?'Посмотреть задачи':'Browse Problems'}
                </motion.button>
              </Link>
            </motion.div>

            {/* Code preview */}
            <motion.div variants={FI} style={{ marginTop: 20, width: '100%', maxWidth: 560 }}>
              <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, boxShadow: isDark ? '0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(124,58,237,0.06)' : '0 20px 60px rgba(0,0,0,0.12)' }}>
                <div style={{ background: isDark ? '#0a0a14' : '#f1f3f9', padding: '10px 16px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />)}
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: isDark ? '#475569' : '#94a3b8', marginLeft: 8 }}>solution.py</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="pill st-ac">
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block', marginRight: 4 }} />
                      {lang==='ru'?'Принято':'Accepted'}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: isDark ? '#475569' : '#94a3b8' }}>42мс</span>
                  </div>
                </div>
                <div style={{ background: isDark ? '#07070f' : '#ffffff', padding: '20px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, lineHeight: 1.8 }}>
                  <div style={{ color: isDark ? '#475569' : '#94a3b8' }}># O(n) — хэш-таблица</div>
                  <div style={{ marginTop: 4 }}><span style={{ color: '#a78bfa' }}>def </span><span style={{ color: '#67e8f9' }}>two_sum</span><span style={{ color: isDark ? '#e2e8f0' : '#1a1a2e' }}>(nums, target):</span></div>
                  <div style={{ paddingLeft: 24, color: isDark ? '#e2e8f0' : '#1a1a2e' }}>seen = {}</div>
                  <div style={{ paddingLeft: 24 }}><span style={{ color: '#a78bfa' }}>for </span><span style={{ color: '#67e8f9' }}>i, n </span><span style={{ color: '#a78bfa' }}>in </span><span style={{ color: isDark ? '#e2e8f0' : '#1a1a2e' }}>enumerate(nums):</span></div>
                  <div style={{ paddingLeft: 48 }}><span style={{ color: '#a78bfa' }}>if </span><span style={{ color: isDark ? '#e2e8f0' : '#1a1a2e' }}>target - n </span><span style={{ color: '#a78bfa' }}>in </span><span style={{ color: isDark ? '#e2e8f0' : '#1a1a2e' }}>seen:</span></div>
                  <div style={{ paddingLeft: 72 }}><span style={{ color: '#a78bfa' }}>return </span><span style={{ color: '#34d399' }}>[seen[target-n], i]</span></div>
                  <div style={{ paddingLeft: 48, color: isDark ? '#e2e8f0' : '#1a1a2e' }}>seen[n] = i</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ─────────────────────────────────────────────── */}
      <section style={{ padding: '60px 24px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}` }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, textAlign: 'center' }}>
          {STATS.map(({ n, l }, i) => (
            <motion.div key={l} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.5, ease: 'easeOut' }}>
              <div style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, letterSpacing: '-0.03em', fontFamily: 'JetBrains Mono, monospace' }} className="gradient-text">{n}</div>
              <div style={{ fontSize: 13, color: isDark ? '#64748b' : '#94a3b8', marginTop: 4 }}>{l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ──────────────────────────────────────────── */}
      <section style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 16 }}>
              {lang==='ru'?'Возможности':'Features'}
            </div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {lang==='ru'?'Всё необходимое для ':'Everything you need to '}
              <span className="gradient-text-subtle">{lang==='ru'?'победы':'win'}</span>
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {FEATURES.map(({ Icon, title, desc }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: 'easeOut' }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                style={{
                  padding: 28, borderRadius: 16, cursor: 'default',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
                  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(124,58,237,0.35)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 40px rgba(124,58,237,0.08)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Icon size={20} color="#a78bfa" />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: isDark ? '#f1f5f9' : '#0d0d1a' }}>{title}</h3>
                <p style={{ fontSize: 13, color: isDark ? '#64748b' : '#64748b', lineHeight: 1.7 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TOP USERS ─────────────────────────────────────────── */}
      <section style={{ padding: '60px 24px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}` }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 40 }}>
            {lang==='ru'?'Топ ':'Top '}
            <span className="gradient-text">{lang==='ru'?'участников':'Coders'}</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { name: 'algo_master',  rating: 2847, solved: 312, badge: '🥇' },
              { name: 'cp_grinder',   rating: 2541, solved: 289, badge: '🥈' },
              { name: 'team_coder',   rating: 2318, solved: 261, badge: '🥉' },
            ].map(({ name, rating, solved, badge }, i) => (
              <motion.div key={name}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4, ease: 'easeOut' }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderRadius: 14,
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
                }}
              >
                <span style={{ fontSize: 22, width: 32 }}>{badge}</span>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff' }}>
                  {name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: isDark ? '#f1f5f9' : '#0d0d1a' }}>@{name}</div>
                  <div style={{ fontSize: 12, color: isDark ? '#475569' : '#94a3b8' }}>{solved} решено</div>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 16 }} className="gradient-text">{rating}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ──────────────────────────────────────── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 40, letterSpacing: '-0.02em' }}>
            {lang==='ru'?'Что говорят ':'What '}
            <span className="gradient-text">{lang==='ru'?'участники':'coders say'}</span>
          </motion.h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[
              { u:'algo_master', t: lang==='ru'?'Aetheris лучше Codeforces. AI объясняет ошибки как репетитор — понятно и без спойлеров.':'Better than Codeforces. AI explains mistakes clearly without spoilers.' },
              { u:'cp_grinder',  t: lang==='ru'?'Система дуэлей затягивает. За месяц вырос на 400 рейтинга — реально работает.':'The duel system is addictive. Gained 400 rating in a month.' },
              { u:'team_coder',  t: lang==='ru'?'Наконец платформа, где командные контесты сделаны правильно.':'Finally a platform that does team contests right.' },
            ].map(({ u, t: tx }, i) => (
              <motion.div key={u}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                style={{
                  padding: 24, borderRadius: 16, cursor: 'default',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                  {[0,1,2,3,4].map(n => <Star key={n} size={12} color="#fbbf24" fill="#fbbf24" />)}
                </div>
                <p style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#4a5568', lineHeight: 1.7, marginBottom: 16 }}>"{tx}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                    {u[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#64748b' : '#94a3b8' }}>@{u}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────── */}
      <section style={{ padding: '96px 24px', position: 'relative', overflow: 'hidden', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}` }}>
        <div className="hero-glow-left" style={{ opacity: 0.4 }} />
        <div className="hero-glow-right" style={{ opacity: 0.3 }} />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ position: 'relative', zIndex: 2, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(36px,5vw,64px)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 20 }}>
            {lang==='ru'?'Готов ':'Ready to '}
            <span className="gradient-text">{lang==='ru'?'побеждать?':'Win?'}</span>
          </h2>
          <p style={{ fontSize: 16, color: isDark ? '#94a3b8' : '#4a5568', marginBottom: 32 }}>
            {lang==='ru'?'Присоединяйся бесплатно прямо сейчас.':'Join for free right now.'}
          </p>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.97 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderRadius: 14, fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer', border: 'none' }}
              className="btn-primary"
            >
              {lang==='ru'?'Начать бесплатно':'Get Started Free'}
              <ArrowRight size={18} />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ padding: '24px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1100, margin: '0 auto', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={13} color="#7c3aed" />
          <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: '-0.02em' }} className="gradient-text">Aetheris</span>
        </div>
        <span style={{ fontSize: 12, color: isDark ? '#475569' : '#94a3b8' }}>© 2025 Aetheris. {lang==='ru'?'Все права защищены.':'All rights reserved.'}</span>
      </footer>
    </div>
  );
}
