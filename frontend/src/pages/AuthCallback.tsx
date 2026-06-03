import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader2 } from 'lucide-react';

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    const accessToken  = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const error        = searchParams.get('error');

    if (error || !accessToken || !refreshToken) {
      navigate('/login?error=google_failed', { replace: true });
      return;
    }

    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);

    fetchMe().then(() => {
      navigate('/dashboard', { replace: true });
    }).catch(() => {
      navigate('/login?error=google_failed', { replace: true });
    });
  }, []);

  return (
    <div className="min-h-screen bg-app flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-[var(--text-3)]">
        <Loader2 size={32} className="animate-spin text-purple-500" />
        <p className="text-sm">Входим через Google...</p>
      </div>
    </div>
  );
}
