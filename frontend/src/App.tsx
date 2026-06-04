import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout }   from './components/layout/AppLayout';
import { useAuthStore }  from './store/authStore';
import { useThemeStore } from './store/themeStore';

import { Landing }        from './pages/Landing';
import { Login }          from './pages/Login';
import { Register }       from './pages/Register';
import { Dashboard }      from './pages/Dashboard';
import { Problems }       from './pages/Problems';
import { ProblemDetail }  from './pages/ProblemDetail';
import { Contests }       from './pages/Contests';
import { ContestDetail }  from './pages/ContestDetail';
import { Duels }          from './pages/Duels';
import { DuelDetail }     from './pages/DuelDetail';
import { Friends }        from './pages/Friends';
import { Teams }          from './pages/Teams';
import { AIMentor }       from './pages/AIMentor';
import { Visualizations } from './pages/Visualizations';
import { Leaderboard }    from './pages/Leaderboard';
import { Profile }        from './pages/Profile';
import { Settings }       from './pages/Settings';
import { Notifications }  from './pages/Notifications';
import { Training }       from './pages/Training';
import { AdminPanel }     from './pages/AdminPanel';
import { CreateProblem }  from './pages/CreateProblem';
import { AuthCallback }   from './pages/AuthCallback';

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

function AppInit({ children }: { children: React.ReactNode }) {
  const { fetchMe }    = useAuthStore();
  const { theme }      = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) fetchMe();
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AppInit>
          <Routes>
            <Route path="/"         element={<Landing />} />
            <Route path="/login"         element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/register"      element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
              <Route path="/dashboard"       element={<Dashboard />} />
              <Route path="/problems"           element={<Problems />} />
              <Route path="/problems/create"  element={<CreateProblem />} />
              <Route path="/problems/:slug"   element={<ProblemDetail />} />
              <Route path="/contests"        element={<Contests />} />
              <Route path="/contests/:slug"  element={<ContestDetail />} />
              <Route path="/duels"           element={<Duels />} />
              <Route path="/duels/:id"       element={<DuelDetail />} />
              <Route path="/friends"         element={<Friends />} />
              <Route path="/teams"           element={<Teams />} />
              <Route path="/teams/:slug"     element={<Teams />} />
              <Route path="/ai-mentor"       element={<AIMentor />} />
              <Route path="/visualizations"  element={<Visualizations />} />
              <Route path="/leaderboard"     element={<Leaderboard />} />
              <Route path="/profile"         element={<Profile />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/settings"        element={<Settings />} />
              <Route path="/notifications"   element={<Notifications />} />
              <Route path="/training"        element={<Training />} />
              <Route path="/admin"           element={<AdminPanel />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppInit>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
