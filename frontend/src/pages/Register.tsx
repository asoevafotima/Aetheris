import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { authApi } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';
import { BackgroundGraph } from '../components/BackgroundGraph';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

const itemV = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

function pwdStrength(pwd: string): number {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 6) s++;
  if (pwd.length >= 10) s++;
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) s++;
  return s;
}

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ username: '', name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const strength = pwdStrength(form.password);
  const strengthColor = ['rgba(239,68,68,0.8)', '#f59e0b', '#818cf8', '#6366f1'][strength];
  const strengthLabel = ['', 'Слабый', 'Средний', 'Надёжный'][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Пароль должен быть минимум 6 символов'); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.register({ username: form.username, email: form.email, password: form.password });
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const inp = (name: string): React.CSSProperties => ({
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${focused === name ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.09)'}`,
    boxShadow: focused === name ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
    borderRadius: 11,
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    padding: '11px 14px',
    boxSizing: 'border-box' as const,
  });

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', background: '#04080f', overflow: 'hidden' }}>
      <BackgroundGraph noSphere />

      {/* Left panel */}
      <div style={{
        flex: 1, minHeight: '100vh',
        background: 'rgba(4,8,15,0.3)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        padding: '44px 64px',
      }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 22, fontWeight: 900, background: 'linear-gradient(90deg,#fff,#a5b4fc,#fde68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Aetheris</span>
        </Link>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1, margin: '0 0 20px', background: 'linear-gradient(135deg,#fff 0%,#c7d2fe 25%,#a5b4fc 50%,#fde68a 75%,#f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Compete.<br />Win.<br />Repeat.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, maxWidth: 380, lineHeight: 1.7, margin: 0 }}
          >
            Олимпиадная платформа с AI-наставником, дуэлями и умным судьёй.
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }} style={{ display: 'flex', gap: 48 }}>
          {[['50K+', 'Участников'], ['10K+', 'Задач'], ['AI', 'Наставник']].map(([val, label]) => (
            <div key={label}>
              <div style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(90deg,#a5b4fc,#fde68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right panel */}
      <motion.div
        initial={{ opacity: 0, x: 48 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55 }}
        style={{ flex: 1, minHeight: '100vh', background: 'rgba(3,5,13,0.85)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 64px', overflowY: 'auto' }}
      >
        <motion.div style={{ width: '100%', maxWidth: 400 }} initial="hidden" animate="show" transition={{ staggerChildren: 0.07 }}>
          <motion.div variants={itemV} transition={{ duration: 0.42 }} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Создать аккаунт</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', margin: 0 }}>Присоединяйся к сообществу</p>
          </motion.div>

          {error && (
            <motion.div variants={itemV} transition={{ duration: 0.42 }} style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13 }}>
              ⚠ {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <motion.div variants={itemV} transition={{ duration: 0.42 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 7 }}>Никнейм</label>
                <input type="text" placeholder="your_handle" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} onFocus={() => setFocused('username')} onBlur={() => setFocused(null)} required style={inp('username')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 7 }}>Имя</label>
                <input type="text" placeholder="Иван" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} style={inp('name')} />
              </div>
            </motion.div>

            <motion.div variants={itemV} transition={{ duration: 0.42 }} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 7 }}>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} required style={inp('email')} />
            </motion.div>

            <motion.div variants={itemV} transition={{ duration: 0.42 }} style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 7 }}>Пароль</label>
              <input type="password" placeholder="Минимум 6 символов" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} required style={inp('password')} />
            </motion.div>

            <motion.div variants={itemV} transition={{ duration: 0.42 }} style={{ marginBottom: 22 }}>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${[0, 33, 66, 100][strength]}%`, background: `linear-gradient(90deg,#f59e0b,${strengthColor})`, borderRadius: 4, transition: 'width 0.35s ease' }} />
              </div>
              {form.password && <p style={{ fontSize: 11, color: strengthColor, margin: '5px 0 0', fontWeight: 600 }}>{strengthLabel}</p>}
            </motion.div>

            <motion.div variants={itemV} transition={{ duration: 0.42 }}>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: loading ? 'rgba(99,102,241,0.45)' : 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 0 28px rgba(99,102,241,0.3)', border: 'none', borderRadius: 11, color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'transform 0.15s' }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {loading ? 'Создаём...' : 'Создать аккаунт →'}
              </button>
            </motion.div>
          </form>

          <motion.div variants={itemV} transition={{ duration: 0.42 }} style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '22px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>или</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </motion.div>

          <motion.div variants={itemV} transition={{ duration: 0.42 }}>
            <a href="http://localhost:8000/auth/google/login" style={{ textDecoration: 'none' }}>
              <button type="button" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'background 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              >
                <GoogleIcon /> Зарегистрироваться через Google
              </button>
            </a>
          </motion.div>

          <motion.p variants={itemV} transition={{ duration: 0.42 }} style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>
            Уже есть аккаунт?{' '}
            <Link to="/login" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>Войти</Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
