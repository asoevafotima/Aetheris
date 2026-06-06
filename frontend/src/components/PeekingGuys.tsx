import { motion } from 'framer-motion';

interface GuyProps {
  covering: boolean;
  hue: string;       // head/body fill
  shadow: string;    // darker shade for depth
  delay: number;
  bobOffset: number;
}

function Guy({ covering, hue, shadow, delay, bobOffset }: GuyProps) {
  const arm = { duration: 0.38, ease: [0.34, 1.4, 0.64, 1] as [number,number,number,number] };
  const face = { duration: 0.22 };

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, delay }}
      style={{ display: 'inline-block' }}
    >
      {/* gentle float bob */}
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 2.6 + bobOffset, repeat: Infinity, ease: 'easeInOut', delay: bobOffset }}
      >
        <svg width="78" height="98" viewBox="0 0 78 98" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* ground shadow */}
          <ellipse cx="39" cy="94" rx="17" ry="4" fill="rgba(0,0,0,0.18)" />

          {/* body */}
          <ellipse cx="39" cy="76" rx="14" ry="11" fill={shadow} />

          {/* left arm line — behind head */}
          <motion.line
            x1={28} y1={68}
            stroke={shadow} strokeWidth={10} strokeLinecap="round"
            animate={{ x2: covering ? 28 : 13, y2: covering ? 34 : 74 }}
            transition={arm}
          />

          {/* right arm line — behind head */}
          <motion.line
            x1={50} y1={68}
            stroke={shadow} strokeWidth={10} strokeLinecap="round"
            animate={{ x2: covering ? 50 : 65, y2: covering ? 34 : 74 }}
            transition={arm}
          />

          {/* neck */}
          <rect x="33" y="63" width="13" height="8" rx="5" fill={hue} />

          {/* head */}
          <circle cx="39" cy="38" r="28" fill={hue} />

          {/* head shine */}
          <ellipse
            cx="30" cy="23" rx="9" ry="5"
            fill="rgba(255,255,255,0.2)"
            transform="rotate(-18 30 23)"
          />

          {/* ── left eye white ── */}
          <ellipse cx="28" cy="37" rx="7.5" ry="8" fill="white" />

          {/* ── right eye white ── */}
          <ellipse cx="50" cy="37" rx="7.5" ry="8" fill="white" />

          {/* left pupil — shifted right when looking toward form */}
          <motion.g
            animate={{ x: covering ? 0 : 2.5, opacity: covering ? 0 : 1 }}
            transition={face}
          >
            <circle cx="28" cy="38" r="4.5" fill="#1a1433" />
            <circle cx="26.5" cy="36" r="1.6" fill="rgba(255,255,255,0.65)" />
          </motion.g>

          {/* right pupil — shifted right */}
          <motion.g
            animate={{ x: covering ? 0 : 2.5, opacity: covering ? 0 : 1 }}
            transition={face}
          >
            <circle cx="50" cy="38" r="4.5" fill="#1a1433" />
            <circle cx="48.5" cy="36" r="1.6" fill="rgba(255,255,255,0.65)" />
          </motion.g>

          {/* left eyebrow — raises slightly when covering (worried) */}
          <motion.path
            stroke="rgba(0,0,0,0.28)" strokeWidth="2.8" strokeLinecap="round" fill="none"
            animate={{ d: covering ? 'M20 25 Q28 21 36 25' : 'M20 27 Q28 24 36 27' }}
            transition={{ duration: 0.28 }}
          />

          {/* right eyebrow */}
          <motion.path
            stroke="rgba(0,0,0,0.28)" strokeWidth="2.8" strokeLinecap="round" fill="none"
            animate={{ d: covering ? 'M42 25 Q50 21 58 25' : 'M42 27 Q50 24 58 27' }}
            transition={{ duration: 0.28 }}
          />

          {/* smile — turns to neutral line when covering */}
          <motion.path
            stroke="rgba(0,0,0,0.22)" strokeWidth="2.8" strokeLinecap="round" fill="none"
            animate={{ d: covering ? 'M29 51 Q39 49 49 51' : 'M29 49 Q39 57 49 49' }}
            transition={{ duration: 0.3 }}
          />

          {/* left hand — moves from side to cover left eye */}
          <motion.g
            animate={{ x: covering ? 15 : 0, y: covering ? -40 : 0 }}
            transition={arm}
          >
            <circle cx="13" cy="74" r="12" fill={hue} />
          </motion.g>

          {/* right hand — moves from side to cover right eye */}
          <motion.g
            animate={{ x: covering ? -15 : 0, y: covering ? -40 : 0 }}
            transition={arm}
          >
            <circle cx="65" cy="74" r="12" fill={hue} />
          </motion.g>
        </svg>
      </motion.div>
    </motion.div>
  );
}

export function PeekingGuys({ covering }: { covering: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', justifyContent: 'center' }}>
      <Guy covering={covering} hue="#6366f1" shadow="#4338ca" delay={0.35} bobOffset={0} />
      <Guy covering={covering} hue="#3b82f6" shadow="#1d4ed8" delay={0.5}  bobOffset={0.4} />
      <Guy covering={covering} hue="#f59e0b" shadow="#d97706" delay={0.65} bobOffset={0.8} />
    </div>
  );
}
