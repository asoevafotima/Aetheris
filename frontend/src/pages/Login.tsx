import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Zap, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/authStore';

export function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? 'Неверный логин или пароль');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
              <Zap size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black gradient-text">Aetheris</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Добро пожаловать!</h1>
          <p className="text-slate-500 text-sm">Войдите в аккаунт, чтобы продолжить</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-100 p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail size={16} />}
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Пароль</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pl-9 pr-9 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={isLoading} className="w-full mt-2" size="lg">
              Войти
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Нет аккаунта?{' '}
              <Link to="/register" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
