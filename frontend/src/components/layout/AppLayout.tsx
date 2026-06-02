import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-app surface-transition">
      <TopNav />
      <main className="max-w-screen-2xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
