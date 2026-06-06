import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Trash2, BellOff, Users, Check, X, Shield } from 'lucide-react';
import { notificationsApi, teamInvitationsApi } from '../api/endpoints';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useThemeStore } from '../store/themeStore';
import { BackgroundGraph } from '../components/BackgroundGraph';
import { Link } from 'react-router-dom';
import type { Notification } from '../types';

interface TeamInvite {
  id: string;
  from_user: { id: string; username: string };
  team: { id: string; name: string; slug: string };
  created_at: string;
}

export function Notifications() {
  const qc = useQueryClient();
  const { theme } = useThemeStore();
  const dark = theme === 'dark';

  const pageBg    = dark ? '#04080f'                : '#f1f5f9';
  const t1        = dark ? 'rgba(255,255,255,0.9)'  : 'rgba(0,0,0,0.88)';
  const t2        = dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
  const t3        = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.28)';
  const cardBg    = dark ? 'rgba(6,12,28,0.78)'     : 'rgba(255,255,255,0.97)';
  const cardBord  = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const chipBg    = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(0, 50),
  });
  const { data: teamInvites, refetch: refetchInvites } = useQuery({
    queryKey: ['team-invitations', 'me'],
    queryFn: teamInvitationsApi.myIncoming,
    refetchInterval: 15_000,
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
  const acceptInvMut = useMutation({
    mutationFn: (id: string) => teamInvitationsApi.accept(id),
    onSuccess: () => refetchInvites(),
  });
  const declineInvMut = useMutation({
    mutationFn: (id: string) => teamInvitationsApi.decline(id),
    onSuccess: () => refetchInvites(),
  });

  const unread    = (notifications ?? []).filter((n: Notification) => !n.is_read).length;
  const invList   = (teamInvites ?? []) as TeamInvite[];
  const totalNew  = unread + invList.length;

  return (
    <div style={{ position:'relative', minHeight:'calc(100vh - 56px)', background:pageBg }}>
      <BackgroundGraph noSphere light={!dark}/>

      <div style={{ position:'relative', zIndex:1, maxWidth:780, margin:'0 auto', padding:'36px 32px 60px' }}>

        {/* Header */}
        <motion.div initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}} transition={{duration:0.4}}
          style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24 }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:44,height:44,borderRadius:13,background:'rgba(99,102,241,0.15)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Bell size={22} color="#818cf8"/>
            </div>
            <div>
              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                <h1 style={{ fontSize:26,fontWeight:900,color:t1,margin:0 }}>Уведомления</h1>
                {totalNew > 0 && (
                  <span style={{ fontSize:12,fontWeight:800,padding:'2px 10px',borderRadius:20,background:'rgba(99,102,241,0.2)',color:'#818cf8',border:'1px solid rgba(99,102,241,0.35)' }}>
                    {totalNew} новых
                  </span>
                )}
              </div>
              <p style={{ fontSize:13,color:t2,margin:'3px 0 0' }}>Контесты, дуэли, приглашения в команды</p>
            </div>
          </div>
          {unread > 0 && (
            <button onClick={() => markAllMut.mutate()} disabled={markAllMut.isPending}
              style={{ display:'flex',alignItems:'center',gap:7,padding:'9px 16px',background:chipBg,border:`1px solid ${cardBord}`,borderRadius:11,color:t2,fontSize:13,fontWeight:600,cursor:'pointer',transition:'all 0.15s' }}>
              <CheckCheck size={14}/> Прочитать все
            </button>
          )}
        </motion.div>

        {/* Team invitations */}
        <AnimatePresence>
          {invList.length > 0 && (
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} style={{ marginBottom:20 }}>
              <p style={{ fontSize:11,fontWeight:800,color:t3,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10 }}>
                Приглашения в команды · {invList.length}
              </p>
              <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                {invList.map(inv => (
                  <motion.div key={inv.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}}
                    style={{ display:'flex',alignItems:'center',gap:12,padding:'14px 18px',borderRadius:16,background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.25)',backdropFilter:'blur(20px)' }}>
                    <div style={{ width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#6366f1,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:900,color:'#fff',flexShrink:0 }}>
                      {inv.team?.name[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <p style={{ fontSize:14,fontWeight:700,color:t1,margin:'0 0 3px' }}>
                        <span style={{ color:'#818cf8' }}>{inv.from_user?.username}</span>
                        {' '}приглашает в команду{' '}
                        <Link to={`/teams/${inv.team?.slug}`} style={{ color:'#818cf8',textDecoration:'none',fontWeight:800 }}>
                          {inv.team?.name}
                        </Link>
                      </p>
                      <p style={{ fontSize:11,color:t3,margin:0 }}>
                        {formatDistanceToNow(new Date(inv.created_at),{addSuffix:true,locale:ru})}
                      </p>
                    </div>
                    <div style={{ display:'flex',gap:8,flexShrink:0 }}>
                      <button onClick={() => declineInvMut.mutate(inv.id)} disabled={declineInvMut.isPending}
                        style={{ width:36,height:36,borderRadius:10,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'background 0.15s' }}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.2)'}
                        onMouseLeave={e=>e.currentTarget.style.background='rgba(239,68,68,0.1)'}>
                        <X size={15}/>
                      </button>
                      <button onClick={() => acceptInvMut.mutate(inv.id)} disabled={acceptInvMut.isPending}
                        style={{ width:36,height:36,borderRadius:10,background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.35)',color:'#22c55e',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'background 0.15s' }}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(34,197,94,0.28)'}
                        onMouseLeave={e=>e.currentTarget.style.background='rgba(34,197,94,0.15)'}>
                        <Check size={15}/>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Regular notifications */}
        <div style={{ background:cardBg,border:`1px solid ${cardBord}`,borderRadius:20,overflow:'hidden',backdropFilter:'blur(24px)',boxShadow:dark?'none':'0 4px 24px rgba(0,0,0,0.07)' }}>
          <div style={{ height:1,background:'linear-gradient(90deg,transparent,rgba(99,102,241,0.4),transparent)' }}/>

          {isLoading ? (
            <div style={{ padding:'20px',display:'flex',flexDirection:'column',gap:12 }}>
              {[1,2,3,4].map(i => <div key={i} style={{ height:60,borderRadius:12,background:chipBg }}/>)}
            </div>
          ) : (notifications ?? []).length === 0 ? (
            <div style={{ padding:'60px 0',textAlign:'center' }}>
              <BellOff size={44} style={{ color:t3,opacity:0.3,margin:'0 auto 14px' }}/>
              <p style={{ fontSize:15,color:t2,margin:0 }}>Уведомлений нет</p>
            </div>
          ) : (
            <div>
              {(notifications ?? []).map((n: Notification, i: number) => (
                <motion.div key={n.id}
                  initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.03}}
                  style={{ display:'flex',alignItems:'flex-start',gap:14,padding:'16px 22px',borderBottom:`1px solid ${cardBord}`,background:!n.is_read?(dark?'rgba(99,102,241,0.06)':'rgba(99,102,241,0.04)'):'transparent',transition:'background 0.15s' }}
                  onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background=dark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=!n.is_read?(dark?'rgba(99,102,241,0.06)':'rgba(99,102,241,0.04)'):'transparent'}>
                  <div style={{ width:8,height:8,borderRadius:'50%',background:!n.is_read?'#818cf8':'transparent',marginTop:6,flexShrink:0 }}/>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ fontSize:14,fontWeight:!n.is_read?700:500,color:!n.is_read?t1:t2,margin:'0 0 3px' }}>{n.title}</p>
                    <p style={{ fontSize:13,color:t2,margin:'0 0 4px',lineHeight:1.5 }}>{n.message}</p>
                    <p style={{ fontSize:11,color:t3,margin:0 }}>
                      {formatDistanceToNow(new Date(n.created_at),{addSuffix:true,locale:ru})}
                    </p>
                  </div>
                  <div style={{ display:'flex',gap:6,flexShrink:0 }}>
                    {!n.is_read && (
                      <button onClick={() => markOneMut.mutate(n.id)}
                        style={{ width:30,height:30,borderRadius:8,background:'none',border:`1px solid ${cardBord}`,color:t3,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s' }}
                        onMouseEnter={e=>{e.currentTarget.style.color='#22c55e';e.currentTarget.style.borderColor='rgba(34,197,94,0.4)';}}
                        onMouseLeave={e=>{e.currentTarget.style.color=t3;e.currentTarget.style.borderColor=cardBord;}}>
                        <CheckCheck size={13}/>
                      </button>
                    )}
                    <button onClick={() => deleteMut.mutate(n.id)}
                      style={{ width:30,height:30,borderRadius:8,background:'none',border:`1px solid ${cardBord}`,color:t3,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s' }}
                      onMouseEnter={e=>{e.currentTarget.style.color='#f87171';e.currentTarget.style.borderColor='rgba(239,68,68,0.4)';}}
                      onMouseLeave={e=>{e.currentTarget.style.color=t3;e.currentTarget.style.borderColor=cardBord;}}>
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
