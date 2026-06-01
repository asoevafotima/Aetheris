import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, Globe, Code2, CheckCircle, Calendar, TrendingUp, Award, ExternalLink } from 'lucide-react';
import { usersApi, profilesApi, submissionsApi, achievementsApi, ratingsApi } from '../api/endpoints';
import { Card, CardBody } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { formatDistanceToNow, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuthStore } from '../store/authStore';
import type { Submission } from '../types';

const ROLE_MAP: Record<string, { label: string; color: string }> = {
  admin:     { label: 'Администратор', color: 'bg-red-100 text-red-700 border-red-200'   },
  moderator: { label: 'Модератор',     color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  user:      { label: 'Участник',      color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

function StatBox({ value, label, icon: Icon, color }: { value: string | number; label: string; icon: React.ElementType; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-center">
      <Icon size={18} className={color} />
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

export function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const { user: me } = useAuthStore();
  const targetId = userId ?? me?.id;

  const { data: user, isLoading } = useQuery({ queryKey: ['user', targetId], queryFn: () => usersApi.getById(targetId!), enabled: !!targetId });
  const { data: profile }         = useQuery({ queryKey: ['profile', targetId], queryFn: () => profilesApi.getById(targetId!), enabled: !!targetId });
  const { data: submissions }     = useQuery({ queryKey: ['submissions', 'user', targetId], queryFn: () => submissionsApi.me(0, 10), enabled: targetId === me?.id });
  const { data: userAchievements }= useQuery({ queryKey: ['achievements', 'user', targetId], queryFn: () => achievementsApi.user(targetId!), enabled: !!targetId });
  const { data: ratings }         = useQuery({ queryKey: ['ratings', targetId], queryFn: () => ratingsApi.user(targetId!, 0, 10), enabled: !!targetId });

  if (isLoading) return <PageLoader />;
  if (!user)     return <div className="p-10 text-center text-slate-500">Пользователь не найден</div>;

  const accepted    = (submissions ?? []).filter((s: Submission) => s.status === 'accepted').length;
  const ratingDelta = (ratings ?? []).reduce((acc: number, r: { delta: number }) => acc + r.delta, 0);
  const isMe        = targetId === me?.id;
  const roleInfo    = ROLE_MAP[user.role] ?? ROLE_MAP.user;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Шапка профиля */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-start gap-6 flex-wrap">
              {/* Аватар */}
              <div className="relative shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-sm" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-3xl font-black text-white shadow-md">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
              </div>

              {/* Инфо */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="text-2xl font-bold text-slate-900">{user.username}</h1>
                  <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-semibold ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                  {isMe && <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold">Это вы</span>}
                </div>

                {profile?.first_name && (
                  <p className="text-slate-700 font-medium mb-1">{profile.first_name} {profile.last_name}</p>
                )}
                {profile?.bio && <p className="text-slate-500 text-sm mb-3 max-w-xl leading-relaxed">{profile.bio}</p>}

                <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                  {profile?.country && (
                    <span className="flex items-center gap-1.5"><MapPin size={12} /> {profile.city ? `${profile.city}, ` : ''}{profile.country}</span>
                  )}
                  <span className="flex items-center gap-1.5"><Calendar size={12} /> Зарегистрирован {format(new Date(user.created_at), 'MMMM yyyy', { locale: ru })}</span>
                  {profile?.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                      <ExternalLink size={12} /> GitHub
                    </a>
                  )}
                  {profile?.website_url && (
                    <a href={profile.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                      <Globe size={12} /> Сайт
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Статистика */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatBox value={Math.max(0, ratingDelta)} label="Рейтинг"   icon={TrendingUp} color="text-purple-500" />
        <StatBox value={accepted}                  label="Решено"    icon={CheckCircle} color="text-emerald-500" />
        <StatBox value={(submissions ?? []).length} label="Посылок"  icon={Code2}       color="text-cyan-500"  />
        <StatBox value={(userAchievements ?? []).length} label="Достижений" icon={Award} color="text-yellow-500" />
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Последние посылки */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <Code2 size={16} className="text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">Последние посылки</h2>
            </div>
            <CardBody className="p-0">
              {(submissions ?? []).length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">Посылок пока нет</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {(submissions ?? []).map((sub: Submission) => (
                    <div key={sub.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={sub.status} />
                        <span className="text-xs text-slate-400">{sub.language}</span>
                      </div>
                      <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(sub.created_at), { addSuffix: true, locale: ru })}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Достижения */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <Award size={16} className="text-yellow-500" />
              <h2 className="text-sm font-semibold text-slate-900">Достижения</h2>
              <span className="ml-auto text-xs text-slate-400">{(userAchievements ?? []).length} получено</span>
            </div>
            <CardBody className="p-4">
              {(userAchievements ?? []).length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  <Award size={32} className="mx-auto mb-2 opacity-20" />
                  Достижений пока нет
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {(userAchievements ?? []).map((ua: { id: string; achievement?: { name: string; icon?: string; description?: string } }) => (
                    <div key={ua.id} title={ua.achievement?.description} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-center">
                      <span className="text-2xl">{ua.achievement?.icon ?? '🏆'}</span>
                      <p className="text-xs text-slate-700 font-medium leading-tight">{ua.achievement?.name ?? 'Достижение'}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* История рейтинга */}
        {(ratings ?? []).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="md:col-span-2">
            <Card>
              <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                <TrendingUp size={16} className="text-purple-500" />
                <h2 className="text-sm font-semibold text-slate-900">История рейтинга</h2>
              </div>
              <CardBody className="p-4">
                <div className="flex flex-col gap-2">
                  {(ratings ?? []).map((r: { id: string; delta: number; created_at: string }) => (
                    <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                      <span className="text-xs text-slate-500">{format(new Date(r.created_at), 'd MMM yyyy', { locale: ru })}</span>
                      <span className={`text-sm font-mono font-bold ${r.delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {r.delta >= 0 ? '+' : ''}{r.delta}
                      </span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
