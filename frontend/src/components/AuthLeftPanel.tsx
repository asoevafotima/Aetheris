import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const BOARD = [
  { rank: 1, init: 'T', name: 'tourist',    rating: 3847, delta: '+22', color: '#f59e0b' },
  { rank: 2, init: 'P', name: 'Petr',       rating: 3742, delta: '+14', color: '#6366f1' },
  { rank: 3, init: 'U', name: 'Um_nik',     rating: 3698, delta: '+8',  color: '#3b82f6' },
  { rank: 4, init: 'E', name: 'ecnerwala',  rating: 3654, delta: '-2',  color: '#ec4899' },
  { rank: 5, init: 'G', name: 'Gennady',    rating: 3623, delta: '+18', color: '#10b981' },
];

const TICKER_ITEMS = [
  { user: 'tourist',   problem: 'Max Flow',          verdict: 'AC',  lang: 'C++' },
  { user: 'Petr',      problem: 'Tree DP Hard',       verdict: 'AC',  lang: 'C++' },
  { user: 'Um_nik',    problem: 'String Hashing',     verdict: 'WA',  lang: 'C++' },
  { user: 'ecnerwala', problem: 'Segment Tree',       verdict: 'AC',  lang: 'C++' },
  { user: 'Gennady',   problem: 'Binary Search',      verdict: 'AC',  lang: 'Python' },
  { user: 'Benq',      problem: 'Convex Hull',        verdict: 'TLE', lang: 'C++' },
  { user: 'jiangly',   problem: 'Matrix Exponent',    verdict: 'AC',  lang: 'C++' },
  { user: 'ksun48',    problem: 'Min Cut',             verdict: 'AC',  lang: 'Java' },
];

const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

const verdictColor = (v: string) =>
  v === 'AC' ? '#22c55e' : v === 'WA' ? '#ef4444' : '#f59e0b';

export function AuthLeftPanel() {
  return (
    <div style={{
      flex: 1, minHeight: '100vh',
      background: 'rgba(4,8,15,0.38)',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      position: 'relative', zIndex: 1,
      display: 'flex', flexDirection: 'column',
      padding: '44px 52px',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg,#6366f1,#f59e0b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Zap size={20} color="#fff" />
        </div>
        <span style={{
          fontSize: 22, fontWeight: 900,
          background: 'linear-gradient(90deg,#fff,#a5b4fc,#fde68a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Aetheris</span>
      </Link>

      {/* Center */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28 }}>

        {/* Online badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, width: 'fit-content' }}
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }}
          />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>847 участников онлайн</span>
        </motion.div>

        {/* Headline */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.6 }}
            style={{
              fontSize: 46, fontWeight: 900, lineHeight: 1.12, margin: '0 0 14px',
              background: 'linear-gradient(135deg,#fff 0%,#c7d2fe 30%,#a5b4fc 55%,#fde68a 80%,#f59e0b 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}
          >
            Думай быстро.<br />Кодь ещё быстрее.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.5 }}
            style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}
          >
            AI-наставник, рейтинговые дуэли, умный судья.<br />
            Всё что нужно, чтобы стать лучшим.
          </motion.p>
        </div>

        {/* Live leaderboard card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.55 }}
          style={{
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: '16px 20px',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Card header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🏆</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>Топ прямо сейчас</span>
            </div>
            <motion.div
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                fontSize: 11, fontWeight: 600, color: '#22c55e',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              LIVE
            </motion.div>
          </div>

          {/* Rows */}
          {BOARD.map((u, i) => (
            <motion.div
              key={u.name}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.09, duration: 0.4 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 0',
                borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.045)' : 'none',
              }}
            >
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', width: 16, textAlign: 'right', flexShrink: 0 }}>#{u.rank}</span>

              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: u.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0,
                boxShadow: `0 0 10px ${u.color}55`,
              }}>
                {u.init}
              </div>

              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.82)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {u.name}
              </span>

              {/* Rating bar */}
              <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((u.rating - 3600) / 250) * 100}%` }}
                  transition={{ delay: 0.6 + i * 0.09, duration: 0.7 }}
                  style={{ height: '100%', background: u.color, borderRadius: 4 }}
                />
              </div>

              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', fontFamily: 'monospace', flexShrink: 0, width: 36, textAlign: 'right' }}>
                {u.rating}
              </span>

              <motion.span
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + i * 0.09, duration: 0.3 }}
                style={{
                  fontSize: 11, fontWeight: 800, flexShrink: 0, width: 30, textAlign: 'right',
                  color: u.delta.startsWith('+') ? '#22c55e' : '#ef4444',
                }}
              >
                {u.delta}
              </motion.span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scrolling ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        style={{
          overflow: 'hidden',
          maskImage: 'linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)',
          paddingTop: 16,
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'flex', gap: 0, width: 'max-content' }}
        >
          {doubled.map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, paddingRight: 32, whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{item.user}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)' }}>→</span>
              <span style={{
                fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
                color: verdictColor(item.verdict),
              }}>{item.verdict}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', fontFamily: 'monospace' }}>{item.problem}</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.12)', paddingLeft: 4 }}>·</span>
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
