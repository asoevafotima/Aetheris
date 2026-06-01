import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { authApi } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Пароли не совпадают'); return; }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
              <Zap size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black gradient-text">Aetheris</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Создать аккаунт</h1>
          <p className="text-slate-500 text-sm">Присоединяйся к тысячам программистов</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-100 p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">⚠ {error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Логин (username)" placeholder="your_handle" icon={<User size={16} />}
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required
            />
            <Input
              label="Email" type="email" placeholder="you@example.com" icon={<Mail size={16} />}
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
            />
            <Input
              label="Пароль" type="password" placeholder="Минимум 6 символов" icon={<Lock size={16} />}
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
            />
            <Input
              label="Повторите пароль" type="password" placeholder="Повторите пароль" icon={<Lock size={16} />}
              value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required
            />
            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Зарегистрироваться
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
