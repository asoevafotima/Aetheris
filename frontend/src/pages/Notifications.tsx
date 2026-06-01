import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Trash2, BellOff } from 'lucide-react';
import { notificationsApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { SkeletonLine } from '../components/ui/Spinner';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '../types';

export function Notifications() {
  const qc = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(0, 50),
  });

  const markAllMut = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markOneMut = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unread = (notifications ?? []).filter((n: Notification) => !n.is_read).length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <Bell size={28} className="text-purple-400" /> Notifications
            {unread > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-purple-700 text-white">{unread}</span>
            )}
          </h1>
          <p className="text-slate-400">Stay updated on contests, duels, and activity</p>
        </div>
        {unread > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={<CheckCheck size={14} />}
            onClick={() => markAllMut.mutate()}
            loading={markAllMut.isPending}
          >
            Mark all read
          </Button>
        )}
      </motion.div>

      <Card>
        {isLoading ? (
          <CardBody className="flex flex-col gap-3">
            {Array(5).fill(0).map((_, i) => <SkeletonLine key={i} className="w-full h-16" />)}
          </CardBody>
        ) : (notifications ?? []).length === 0 ? (
          <CardBody className="py-20 text-center">
            <BellOff size={48} className="mx-auto mb-4 text-slate-700" />
            <p className="text-slate-500">No notifications yet</p>
          </CardBody>
        ) : (
          <div className="divide-y divide-slate-800">
            {(notifications ?? []).map((n: Notification, i: number) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-start gap-4 px-5 py-4 hover:bg-white/3 transition-colors group ${!n.is_read ? 'bg-purple-900/10' : ''}`}
              >
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.is_read ? 'bg-purple-500' : 'bg-transparent'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${!n.is_read ? 'text-white' : 'text-slate-300'}`}>{n.title}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.is_read && (
                    <button
                      onClick={() => markOneMut.mutate(n.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-900/20 transition-colors cursor-pointer"
                      title="Mark as read"
                    >
                      <CheckCheck size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteMut.mutate(n.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
