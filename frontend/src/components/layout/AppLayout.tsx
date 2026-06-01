import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
