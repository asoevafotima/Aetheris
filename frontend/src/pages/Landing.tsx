import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Code2, Trophy, Swords, Bot, BarChart2, Users,
  ArrowRight, Star, ExternalLink,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const FEATURES = [
  { icon: Code2,    title: 'Smart Judge',       desc: 'Real-time code execution with Python & C++ support, detailed test case analysis.' },
  { icon: Trophy,   title: 'Live Contests',      desc: 'Compete in rated contests with live leaderboards and real-time scoring.' },
  { icon: Swords,   title: '1v1 Duels',          desc: 'Challenge opponents to head-to-head battles with problems selected at random.' },
  { icon: Bot,      title: 'AI Mentor',          desc: 'Powered by Groq LLM — get algorithm hints, code reviews, and debug help instantly.' },
  { icon: BarChart2,title: 'Visualizations',     desc: 'Interactive step-by-step visualizations for classic algorithms.' },
  { icon: Users,    title: 'Team Olympiads',     desc: 'Form teams, compete together, and climb team rankings.' },
];

const STATS = [
  { value: '10K+', label: 'Problems' },
  { value: '50K+', label: 'Users'    },
  { value: '99ms', label: 'Avg Judge Time' },
  { value: 'GPT-4', label: 'AI Model Tier' },
];

const LANGS = ['Python', 'C++', 'Java', 'Go', 'Rust', 'TypeScript'];

const TESTIMONIALS = [
  { user: 'competitive_dev', text: 'Aetheris makes Codeforces look ancient. The AI hints are a game changer for learning.', stars: 5 },
  { user: 'algo_master_99',  text: 'The duel system is addictive. I\'ve improved my rating by 400 points in a month.', stars: 5 },
  { user: 'teamcoder_x',     text: 'Finally a platform that takes team contests seriously. The live chat during rounds is perfect.', stars: 5 },
];

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

export function Landing() {
  return (
    <div className="min-h-screen bg-[#080814] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-slate-800/50 bg-[#080814]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center glow-pulse">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">Aetheris</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#stats"    className="hover:text-white transition-colors">Stats</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Community</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16 hero-grid">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
          <motion.div
            initial="hidden" animate="show" variants={stagger}
            className="flex flex-col items-center gap-6"
          >
            <motion.div variants={fade}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-purple-900/40 border border-purple-700/40 text-purple-300">
                <Zap size={12} /> Powered by Groq AI · Now in Beta
              </span>
            </motion.div>

            <motion.h1 variants={fade} className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
              The Future of{' '}
              <span className="gradient-text">Competitive</span>
              <br />Programming is Here
            </motion.h1>

            <motion.p variants={fade} className="text-xl text-slate-400 max-w-2xl leading-relaxed">
              Beat LeetCode's UI. Outperform Codeforces' features. Aetheris is the next-generation
              platform with AI mentoring, real-time duels, and live contests.
            </motion.p>

            <motion.div variants={fade} className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" icon={<ArrowRight size={18} />} className="glow-pulse">
                  Start Competing Free
                </Button>
              </Link>
              <Link to="/problems">
                <Button size="lg" variant="outline">
                  Browse Problems
                </Button>
              </Link>
            </motion.div>

            {/* Language pills */}
            <motion.div variants={fade} className="flex flex-wrap justify-center gap-2 mt-4">
              {LANGS.map(l => (
                <span key={l} className="px-3 py-1 text-xs rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                  {l}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero code preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-20 relative mx-auto max-w-4xl"
          >
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-sm overflow-hidden shadow-2xl shadow-purple-900/20">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/60 border-b border-slate-700/50">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="ml-2 text-xs text-slate-500 font-mono">solution.py · Two Sum</span>
                <div className="ml-auto flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs bg-emerald-900/50 text-emerald-400 border border-emerald-700/40">✓ Accepted</span>
                  <span className="text-xs text-slate-500">42ms · 16MB</span>
                </div>
              </div>
              <div className="p-6 font-mono text-sm text-left leading-relaxed">
                <div className="text-slate-500"># Runtime: 42ms | Beats 98.7% of Python submissions</div>
                <br />
                <div>
                  <span className="text-purple-400">from</span>{' '}
                  <span className="text-white">typing</span>{' '}
                  <span className="text-purple-400">import</span>{' '}
                  <span className="text-cyan-300">List</span>
                </div>
                <br />
                <div>
                  <span className="text-purple-400">class</span>{' '}
                  <span className="text-yellow-300">Solution</span>
                  <span className="text-white">:</span>
                </div>
                <div className="pl-6">
                  <span className="text-purple-400">def</span>{' '}
                  <span className="text-cyan-300">twoSum</span>
                  <span className="text-white">(self, nums: </span>
                  <span className="text-cyan-300">List</span>
                  <span className="text-white">[int], target: int) -&gt; </span>
                  <span className="text-cyan-300">List</span>
                  <span className="text-white">[int]:</span>
                </div>
                <div className="pl-12">
                  <span className="text-white">seen = </span>
                  <span className="text-yellow-300">{'{}'}</span>
                </div>
                <div className="pl-12">
                  <span className="text-purple-400">for</span>
                  <span className="text-white"> i, n </span>
                  <span className="text-purple-400">in</span>
                  <span className="text-white"> enumerate(nums):</span>
                </div>
                <div className="pl-20">
                  <span className="text-purple-400">if</span>
                  <span className="text-white"> target - n </span>
                  <span className="text-purple-400">in</span>
                  <span className="text-white"> seen:</span>
                </div>
                <div className="pl-28">
                  <span className="text-purple-400">return</span>
                  <span className="text-white"> [seen[target - n], i]</span>
                </div>
                <div className="pl-20">
                  <span className="text-white">seen[n] = i</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-20 border-y border-slate-800/50 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl font-black gradient-text mb-2">{value}</div>
                <div className="text-slate-400 text-sm">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Everything You Need to <span className="gradient-text">Win</span></h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Built by competitive programmers, for competitive programmers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-purple-700/50 hover:bg-slate-900/60 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-700/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon size={24} className="text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">
            Loved by <span className="gradient-text">Competitive Programmers</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ user, text, stars }) => (
              <motion.div
                key={user}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60"
              >
                <div className="flex gap-1 mb-4">
                  {Array(stars).fill(0).map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">"{text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-xs font-bold">
                    {user[0].toUpperCase()}
                  </div>
                  <span className="text-slate-400 text-sm font-mono">@{user}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl border border-purple-700/30 bg-purple-900/10 backdrop-blur-sm"
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center mx-auto mb-6 glow-pulse">
              <Zap size={32} className="text-white" />
            </div>
            <h2 className="text-4xl font-black mb-4">Ready to Compete?</h2>
            <p className="text-slate-400 text-lg mb-8">Join thousands of programmers. Free forever.</p>
            <Link to="/register">
              <Button size="lg" icon={<ArrowRight size={18} />} className="text-base px-8 py-4">
                Create Free Account
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="font-bold text-sm gradient-text">Aetheris</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 Aetheris. Built for the next generation of competitive programmers.</p>
          <div className="flex gap-4 text-slate-500">
            <a href="#" className="hover:text-white transition-colors"><ExternalLink size={18} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
