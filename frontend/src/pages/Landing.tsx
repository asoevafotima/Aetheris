import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Code2, Trophy, Swords, Bot, BarChart2, Users,
  ArrowRight, Star, ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useT } from '../i18n';
import { BackgroundGraph } from '../components/BackgroundGraph';

// ── Animation variants ───────────────────────────────────────────────────────
const rise   = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.11 } } };

// ── Design tokens ────────────────────────────────────────────────────────────
const BLUE  = '#3b82f6';
const GOLD  = '#fbbf24';
const GOLD2 = '#f59e0b';

// ── Helpers ──────────────────────────────────────────────────────────────────
function Glass({
  children, style = {}, gold = false,
}: { children: React.ReactNode; style?: React.CSSProperties; gold?: boolean }) {
  return (
    <div style={{
      background: 'rgba(5,10,24,0.68)',
      backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
      border: `1px solid ${gold ? 'rgba(251,191,36,0.18)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 24,
      boxShadow: gold
        ? '0 0 50px rgba(245,158,11,0.08), inset 0 1px 0 rgba(255,255,255,0.04)'
        : 'inset 0 1px 0 rgba(255,255,255,0.04)',
      ...style,
    }}>
      {children}
    </div>
  );
}

function Sep() {
  return (
    <div style={{
      height: 1,
      margin: '0 80px',
      background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.12) 25%, rgba(96,165,250,0.15) 75%, transparent)',
    }} />
  );
}

function Chip({ text, gold }: { text: string; gold?: boolean }) {
  return (
    <span style={{
      padding: '4px 13px', borderRadius: 100,
      background: gold ? 'rgba(251,191,36,0.06)' : 'rgba(96,165,250,0.06)',
      border: `1px solid ${gold ? 'rgba(251,191,36,0.25)' : 'rgba(96,165,250,0.22)'}`,
      color: gold ? '#fde68a' : '#93c5fd',
      fontSize: 10, fontWeight: 600,
      letterSpacing: '0.14em', textTransform: 'uppercase' as const,
      fontFamily: '"JetBrains Mono",monospace',
    }}>
      {text}
    </span>
  );
}

// ── Feature card ─────────────────────────────────────────────────────────────
function FCard({
  icon: Icon, title, desc, gold = false, big = false,
}: { icon: React.ElementType; title: string; desc: string; gold?: boolean; big?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.55 }}
      style={{
        padding: big ? '32px 28px' : '24px 22px',
        borderRadius: 24, cursor: 'default', height: '100%',
        background: 'rgba(5,10,24,0.65)',
        backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
        border: `1px solid ${gold ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.06)'}`,
        transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = gold ? 'rgba(251,191,36,0.35)' : 'rgba(96,165,250,0.3)';
        el.style.boxShadow   = gold ? '0 0 40px rgba(245,158,11,0.1)' : '0 0 40px rgba(29,78,216,0.12)';
        el.style.background  = gold ? 'rgba(10,16,32,0.78)' : 'rgba(8,14,35,0.78)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = gold ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.06)';
        el.style.boxShadow   = 'none';
        el.style.background  = 'rgba(5,10,24,0.65)';
      }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 14, marginBottom: big ? 22 : 16,
        background: gold ? 'rgba(245,158,11,0.12)' : 'rgba(29,78,216,0.15)',
        border: `1px solid ${gold ? 'rgba(251,191,36,0.22)' : 'rgba(96,165,250,0.18)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} color={gold ? GOLD : BLUE} />
      </div>
      <h3 style={{ fontSize: big ? 17 : 15, fontWeight: 700, margin: '0 0 10px', color: 'rgba(255,255,255,0.92)' }}>
        {title}
      </h3>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.7, margin: 0 }}>{desc}</p>
    </motion.div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export function Landing() {
  useAuthStore();
  const { lang, toggleLang } = useThemeStore();
  const t = useT();

  const FEATURES = [
    { icon: Code2,     gold: false, title: lang === 'ru' ? 'Умный судья'         : 'Smart Judge',       desc: lang === 'ru' ? 'Python и C++, реальное выполнение кода. Детальный разбор каждого теста с временем и памятью.'     : 'Real-time execution with Python & C++. Detailed per-test breakdown with time & memory.' },
    { icon: Trophy,    gold: true,  title: lang === 'ru' ? 'Живые контесты'      : 'Live Contests',      desc: lang === 'ru' ? 'Рейтинговые соревнования с таблицей в реальном времени.'             : 'Rated contests with live leaderboard.' },
    { icon: Swords,    gold: false, title: lang === 'ru' ? 'Дуэли 1 на 1'        : '1v1 Duels',          desc: lang === 'ru' ? 'Вызывай соперников на поединок — кто первый решит задачу.'           : 'Challenge opponents to head-to-head coding battles.' },
    { icon: Bot,       gold: true,  title: lang === 'ru' ? 'AI Наставник'        : 'AI Mentor',          desc: lang === 'ru' ? 'Groq LLM отвечает на русском — подсказки, анализ кода, отладка.' : 'Groq LLM — hints, code reviews, and debug help.' },
    { icon: BarChart2, gold: false, title: lang === 'ru' ? 'Визуализации'        : 'Visualizations',     desc: lang === 'ru' ? 'Пошаговые анимации алгоритмов — BFS, сортировка и другие.'            : 'Step-by-step animated algorithm visualizations.' },
    { icon: Users,     gold: true,  title: lang === 'ru' ? 'Командные олимпиады' : 'Team Olympiads',     desc: lang === 'ru' ? 'Создай команду, соревнуйся вместе и поднимайся в рейтинге. Командный формат со стратегией.' : 'Form teams, compete together, climb rankings.' },
  ];

  const STATS = [
    { value: '50K+', label: lang === 'ru' ? 'Участников' : 'Users',    gold: false },
    { value: '10K+', label: lang === 'ru' ? 'Задач'      : 'Problems', gold: true  },
    { value: '500+', label: lang === 'ru' ? 'Контестов'  : 'Contests', gold: false },
    { value: 'AI',   label: lang === 'ru' ? 'Наставник'  : 'Mentor',   gold: true  },
  ];

  const LANGS = ['Python', 'C++', 'Java', 'Go', 'Rust'];

  const TESTIMONIALS = [
    { user: 'algo_master', text: lang === 'ru' ? 'Aetheris лучше Codeforces. AI подсказки — просто огонь для обучения.' : 'Aetheris feels better than Codeforces. The AI hints are a game changer.', stars: 5 },
    { user: 'cp_grinder',  text: lang === 'ru' ? 'Система дуэлей затягивает. За месяц вырос на 400 рейтинга.'           : 'The duel system is addictive. I improved 400 rating points in a month.',    stars: 5 },
    { user: 'team_coder',  text: lang === 'ru' ? 'Наконец платформа, которая серьёзно относится к командным контестам.' : 'Finally a platform that takes team contests seriously.',                    stars: 5 },
  ];

  const bGold: React.CSSProperties = {
    background: `linear-gradient(135deg, ${GOLD2}, ${GOLD})`,
    color: '#1a0a00', padding: '12px 26px', borderRadius: 12,
    fontSize: 14, fontWeight: 700, textDecoration: 'none',
    display: 'inline-flex', alignItems: 'center', gap: 8,
    transition: 'transform 0.15s, box-shadow 0.15s',
    border: 'none', cursor: 'pointer',
  };
  const bGhost: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.6)',
    padding: '11px 22px', borderRadius: 12,
    fontSize: 14, fontWeight: 500, textDecoration: 'none',
    display: 'inline-flex', alignItems: 'center', gap: 7,
    transition: 'transform 0.15s, border-color 0.15s',
    cursor: 'pointer',
  };
  const hg = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = 'scale(1.04)';
    e.currentTarget.style.boxShadow = `0 0 28px rgba(245,158,11,0.4)`;
  };
  const hgo = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div style={{ background: '#04080f', color: 'white', fontFamily: 'Inter, sans-serif', minHeight: '100vh' }}>

      {/* ── Fixed animated canvas ── */}
      <BackgroundGraph />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── NAVBAR ──────────────────────────────────────────────── */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 52px', height: 68,
            background: 'rgba(4,8,15,0.86)',
            backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
          }}
        >
          {/* Gradient bottom border */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.3) 30%, rgba(96,165,250,0.3) 70%, transparent 100%)',
          }} />

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 22px rgba(37,99,235,0.5)',
            }}>
              <Zap size={18} color="white" strokeWidth={2.5} />
            </div>
            <span style={{
              fontWeight: 900, fontSize: 19, letterSpacing: '-0.035em',
              background: 'linear-gradient(135deg,#fff 20%,#bfdbfe 60%,#93c5fd)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Aetheris
            </span>
          </Link>

          {/* Right: lang toggle + auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={toggleLang} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.35)', padding: '5px 10px', borderRadius: 7,
              fontSize: 10, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.1em',
            }}>
              {lang.toUpperCase()}
            </button>

            <Link to="/login" style={{
              color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 500,
              textDecoration: 'none', padding: '9px 18px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.08)',
              transition: 'color 0.15s, border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.background = 'transparent';
            }}>
              {t.auth.login}
            </Link>

            <Link to="/register" style={{
              background: `linear-gradient(135deg,${GOLD2},${GOLD})`,
              color: '#120800', padding: '9px 22px', borderRadius: 10,
              fontSize: 14, fontWeight: 800, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              boxShadow: '0 0 20px rgba(245,158,11,0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.04)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(245,158,11,0.55)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(245,158,11,0.35)';
            }}>
              {lang === 'ru' ? 'Начать бесплатно' : 'Get Started'} <ArrowRight size={15} />
            </Link>
          </div>
        </motion.nav>

        {/* ── HERO ────────────────────────────────────────────────── */}
        <section style={{
          height: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', paddingTop: 68, position: 'relative',
        }}>
          {/* Subtle center darkening so text is readable over sphere */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 50% 45% at 50% 52%, rgba(4,8,15,0.45) 0%, transparent 100%)',
          }} />

          {/* ── Floating card LEFT ─ Last Accepted ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1, duration: 0.7 }}
            style={{
              position: 'absolute', left: '6%', top: '50%', transform: 'translateY(-55%)',
              zIndex: 2,
            }}
          >
            <Glass style={{ padding: '18px 20px', minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
                  fontFamily: '"JetBrains Mono",monospace',
                }}>
                  {lang === 'ru' ? 'Последнее решение' : 'Latest Submission'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700,
                  background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)',
                  color: '#4ade80',
                }}>✓ {lang === 'ru' ? 'Принято' : 'Accepted'}</span>
              </div>
              <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
                two_sum.py
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 11, color: '#93c5fd', fontFamily: '"JetBrains Mono",monospace' }}>42мс</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: '"JetBrains Mono",monospace' }}>16МБ</span>
              </div>
              {/* Mini code */}
              <div style={{
                marginTop: 12, padding: '8px 10px', borderRadius: 8,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                fontFamily: '"JetBrains Mono",monospace', fontSize: 10,
                color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, textAlign: 'left',
              }}>
                <span style={{ color: '#c084fc' }}>def </span>
                <span style={{ color: '#67e8f9' }}>two_sum</span>
                <span>(n, t):</span>
                <br />
                <span style={{ paddingLeft: 12, color: 'rgba(255,255,255,0.25)' }}>seen = {'{}'}</span>
              </div>
            </Glass>
          </motion.div>

          {/* ── Floating card RIGHT ─ Live Contests ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.7 }}
            style={{
              position: 'absolute', right: '6%', top: '50%', transform: 'translateY(-45%)',
              zIndex: 2,
            }}
          >
            <Glass gold style={{ padding: '18px 20px', minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                  style={{ width: 7, height: 7, borderRadius: '50%', background: '#f87171', boxShadow: '0 0 8px #f87171', flexShrink: 0 }}
                />
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                  color: '#fde68a', textTransform: 'uppercase',
                  fontFamily: '"JetBrains Mono",monospace',
                }}>LIVE</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4 }}>
                {lang === 'ru' ? 'Контест #247' : 'Contest #247'}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginBottom: 14 }}>
                {lang === 'ru' ? 'Codeforces Round' : 'Codeforces Round'}
              </div>
              {[
                { name: 'algo_master', pts: 2840 },
                { name: 'cp_grinder',  pts: 2710 },
                { name: 'team_coder',  pts: 2580 },
              ].map(({ name, pts }, i) => (
                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: '"JetBrains Mono",monospace', width: 14 }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: '"JetBrains Mono",monospace' }}>
                      @{name}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, fontFamily: '"JetBrains Mono",monospace' }}>
                    {pts}
                  </span>
                </div>
              ))}
            </Glass>
          </motion.div>

          {/* ── Center text ── */}
          <motion.div initial="hidden" animate="show" variants={stagger}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>

            <motion.div variants={rise} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '7px 18px', borderRadius: 100, marginBottom: 28,
              border: 'rgba(251,191,36,0.32) 1px solid',
              background: 'rgba(251,191,36,0.07)',
              color: '#fde68a', fontSize: 12, fontWeight: 600, letterSpacing: '0.03em',
              backdropFilter: 'blur(10px)',
            }}>
              ✦ {lang === 'ru' ? 'Сезон 2026 · Олимпиадная платформа' : 'Season 2026 · Competitive Platform'}
            </motion.div>

            <motion.h1 variants={rise} style={{
              fontSize: 92, fontWeight: 900, lineHeight: 1.0,
              letterSpacing: '-0.045em', margin: '0 0 16px',
              background: 'linear-gradient(150deg, #ffffff 10%, #fde68a 38%, #93c5fd 68%, #3b82f6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              filter: 'drop-shadow(0 0 50px rgba(251,191,36,0.18))',
            }}>
              Aetheris
            </motion.h1>

            <motion.p variants={rise} style={{
              fontSize: 16, color: 'rgba(255,255,255,0.5)', margin: '0 0 6px',
              fontWeight: 400, maxWidth: 480, lineHeight: 1.5,
            }}>
              {lang === 'ru'
                ? 'Платформа для олимпиадного программирования нового поколения'
                : 'Next-generation competitive programming platform'}
            </motion.p>

            <motion.p variants={rise} style={{
              fontSize: 13, color: 'rgba(255,255,255,0.25)',
              margin: '0 0 32px', letterSpacing: '0.04em',
            }}>
              {lang === 'ru'
                ? 'Решай задачи · Побеждай в контестах · Сражайся в дуэлях'
                : 'Solve · Compete · Win'}
            </motion.p>

            <motion.div variants={rise} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/register" style={bGold} onMouseEnter={hg} onMouseLeave={hgo}>
                {lang === 'ru' ? 'Начать бесплатно' : 'Start for Free'} <ArrowRight size={16} />
              </Link>
              <Link to="/login" style={bGhost}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                {t.auth.login}
              </Link>
            </motion.div>

            <motion.div variants={rise} style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
              {LANGS.map((l, i) => <Chip key={l} text={l} gold={i % 2 === 0} />)}
            </motion.div>

            <motion.div variants={rise} style={{
              display: 'flex', alignItems: 'center', gap: 8, marginTop: 14,
              fontSize: 12, color: 'rgba(255,255,255,0.2)',
              fontFamily: '"JetBrains Mono",monospace',
            }}>
              <motion.div
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }}
              />
              {lang === 'ru' ? '3 контеста идут прямо сейчас' : '3 contests live right now'}
            </motion.div>
          </motion.div>
        </section>

        {/* ── STATS ───────────────────────────────────────────────── */}
        <section style={{ padding: '0 44px' }}>
          <Glass style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
              {STATS.map(({ value, label, gold }, i) => (
                <motion.div key={label}
                  initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.09 }}
                  style={{
                    textAlign: 'center', padding: '26px 12px',
                    borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                >
                  <div style={{
                    fontFamily: '"JetBrains Mono",monospace',
                    fontSize: 26, fontWeight: 800, lineHeight: 1, marginBottom: 6,
                    color: gold ? GOLD : '#93c5fd',
                  }}>{value}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {label}
                  </div>
                </motion.div>
              ))}
            </div>
          </Glass>
        </section>

        {/* ── FEATURES ────────────────────────────────────────────── */}
        <section style={{ padding: '96px 44px' }}>
          <Sep />
          <div style={{ maxWidth: 1100, margin: '72px auto 0' }}>

            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <Chip text={lang === 'ru' ? 'Возможности' : 'Features'} gold />
              <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.025em', margin: '14px 0 10px' }}>
                {lang === 'ru' ? 'Всё нужное для ' : 'Built to Help You '}
                <span style={{
                  background: `linear-gradient(135deg, ${GOLD}, ${BLUE})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  {lang === 'ru' ? 'побед' : 'Win'}
                </span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, margin: 0 }}>
                {lang === 'ru' ? 'Создано программистами для программистов' : 'Built by competitive programmers, for competitive programmers.'}
              </p>
            </div>

            {/* Row 1: big left + 2 small right */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
              <FCard {...FEATURES[0]} big />
              <FCard {...FEATURES[1]} />
              <FCard {...FEATURES[2]} />
            </div>
            {/* Row 2: 2 small left + big right */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 14 }}>
              <FCard {...FEATURES[3]} />
              <FCard {...FEATURES[4]} />
              <FCard {...FEATURES[5]} big />
            </div>
          </div>
        </section>

        {/* ── CODE PREVIEW ────────────────────────────────────────── */}
        <section style={{ padding: '0 44px 96px' }}>
          <Sep />
          <div style={{ maxWidth: 840, margin: '72px auto 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <Chip text={lang === 'ru' ? 'Пример' : 'Example'} />
              <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', margin: '14px 0 0' }}>
                {lang === 'ru' ? 'Пишешь код — ' : 'Write Code — '}
                <span style={{
                  background: 'linear-gradient(135deg,#4ade80,#22c55e)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  {lang === 'ru' ? 'мгновенный вердикт' : 'Instant Verdict'}
                </span>
              </h2>
            </div>

            <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <Glass style={{ overflow: 'hidden', borderColor: 'rgba(96,165,250,0.18)', boxShadow: '0 0 60px rgba(29,78,216,0.12)' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  background: 'rgba(255,255,255,0.02)',
                }}>
                  {['rgba(239,68,68,0.6)','rgba(234,179,8,0.6)','rgba(34,197,94,0.6)'].map((c, i) => (
                    <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
                  ))}
                  <span style={{ marginLeft: 8, fontSize: 12, color: 'rgba(255,255,255,0.26)', fontFamily: '"JetBrains Mono",monospace' }}>
                    solution.py · {lang === 'ru' ? 'Сумма двух чисел' : 'Two Sum'}
                  </span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ padding: '3px 9px', borderRadius: 6, fontSize: 11, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.22)', color: '#4ade80' }}>
                      {lang === 'ru' ? '✓ Принято' : '✓ Accepted'}
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: '"JetBrains Mono",monospace' }}>42мс · 16МБ</span>
                  </div>
                </div>
                <div style={{ padding: '24px', fontFamily: '"JetBrains Mono",monospace', fontSize: 13, lineHeight: 1.75 }}>
                  <div style={{ color: 'rgba(255,255,255,0.2)' }}># O(n) — хэш-таблица</div>
                  <br />
                  <div><span style={{ color: '#c084fc' }}>def </span><span style={{ color: '#67e8f9' }}>two_sum</span><span style={{ color: 'rgba(255,255,255,0.72)' }}>(nums, target):</span></div>
                  <div style={{ paddingLeft: 24 }}><span style={{ color: 'rgba(255,255,255,0.72)' }}>seen = </span><span style={{ color: '#fde68a' }}>{'{}'}</span></div>
                  <div style={{ paddingLeft: 24 }}><span style={{ color: '#c084fc' }}>for </span><span style={{ color: 'rgba(255,255,255,0.72)' }}>i, n </span><span style={{ color: '#c084fc' }}>in </span><span style={{ color: 'rgba(255,255,255,0.72)' }}>enumerate(nums):</span></div>
                  <div style={{ paddingLeft: 48 }}><span style={{ color: '#c084fc' }}>if </span><span style={{ color: 'rgba(255,255,255,0.72)' }}>target - n </span><span style={{ color: '#c084fc' }}>in </span><span style={{ color: 'rgba(255,255,255,0.72)' }}>seen:</span></div>
                  <div style={{ paddingLeft: 72 }}><span style={{ color: '#c084fc' }}>return </span><span style={{ color: 'rgba(255,255,255,0.72)' }}>[seen[target - n], i]</span></div>
                  <div style={{ paddingLeft: 48 }}><span style={{ color: 'rgba(255,255,255,0.72)' }}>seen[n] = i</span></div>
                </div>
              </Glass>
            </motion.div>
          </div>
        </section>

        {/* ── TESTIMONIALS ────────────────────────────────────────── */}
        <section style={{ padding: '0 44px 96px' }}>
          <Sep />
          <div style={{ maxWidth: 1100, margin: '72px auto 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <Chip text={lang === 'ru' ? 'Отзывы' : 'Reviews'} gold />
              <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.025em', margin: '14px 0 0' }}>
                {lang === 'ru' ? 'Нас ' : 'Trusted by '}
                <span style={{
                  background: `linear-gradient(135deg, ${GOLD}, ${BLUE})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  {lang === 'ru' ? 'любят участники' : 'Competitive Programmers'}
                </span>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {TESTIMONIALS.map(({ user, text, stars }, i) => (
                <motion.div key={user}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Glass gold={i === 1} style={{ padding: '26px 24px' }}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                      {Array(stars).fill(0).map((_, j) => <Star key={j} size={13} color={GOLD} fill={GOLD} />)}
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.72, margin: '0 0 18px' }}>
                      "{text}"
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: i === 1
                          ? `linear-gradient(135deg, ${GOLD2}, ${GOLD})`
                          : 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: i === 1 ? '#1a0a00' : 'white',
                        boxShadow: i === 1 ? '0 0 14px rgba(245,158,11,0.3)' : '0 0 14px rgba(37,99,235,0.3)',
                      }}>
                        {user[0].toUpperCase()}
                      </div>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: '"JetBrains Mono",monospace' }}>
                        @{user}
                      </span>
                    </div>
                  </Glass>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────── */}
        <section style={{ padding: '0 44px 96px' }}>
          <Sep />
          <div style={{ maxWidth: 740, margin: '72px auto 0' }}>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <Glass gold style={{ padding: '60px 48px', textAlign: 'center', boxShadow: '0 0 80px rgba(245,158,11,0.08), 0 0 40px rgba(29,78,216,0.1)' }}>
                <motion.div
                  animate={{ boxShadow: [`0 0 20px rgba(245,158,11,0.3)`, `0 0 44px rgba(245,158,11,0.55)`, `0 0 20px rgba(245,158,11,0.3)`] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  style={{
                    width: 56, height: 56, borderRadius: 18, margin: '0 auto 26px',
                    background: `linear-gradient(135deg, ${GOLD2}, ${GOLD})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Zap size={26} color="#1a0a00" strokeWidth={2.5} />
                </motion.div>

                <h2 style={{
                  fontSize: 40, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 12px',
                  background: `linear-gradient(145deg, #ffffff, #fde68a)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  {lang === 'ru' ? 'Готов соревноваться?' : 'Ready to Compete?'}
                </h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.3)', margin: '0 0 34px' }}>
                  {lang === 'ru' ? 'Регистрация бесплатна. Навсегда.' : 'Free forever. Join thousands of programmers.'}
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to="/register" style={bGold} onMouseEnter={hg} onMouseLeave={hgo}>
                    {lang === 'ru' ? 'Создать аккаунт' : 'Create Free Account'} <ArrowRight size={16} />
                  </Link>
                  <Link to="/login" style={bGhost}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
                    {t.auth.login}
                  </Link>
                </div>
              </Glass>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────────── */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.04)',
          padding: '26px 44px',
          background: 'rgba(4,8,15,0.75)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 7,
                background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={12} color="white" />
              </div>
              <span style={{ fontWeight: 800, fontSize: 14 }}>Aetheris</span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)', margin: 0 }}>
              © 2026 Aetheris. {lang === 'ru' ? 'Для нового поколения программистов.' : 'Built for the next generation.'}
            </p>
            <a href="#" style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; }}>
              <ExternalLink size={13} /> GitHub
            </a>
          </div>
        </footer>

      </div>
    </div>
  );
}
