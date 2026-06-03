import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';

export function AppLayout() {
  return (
    <div className="min-h-screen surface-transition" style={{ background: 'var(--bg)' }}>
      <TopNav />
      <main className="max-w-screen-2xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
