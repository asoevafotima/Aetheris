import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  MapPin, Globe, Code2, CheckCircle, Calendar, TrendingUp,
  Award, ExternalLink, UserPlus, UserCheck,
} from 'lucide-react';
import { usersApi, profilesApi, submissionsApi, achievementsApi, ratingsApi, followsApi } from '../api/endpoints';
import { formatDistanceToNow, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuthStore }  from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { BackgroundGraph } from '../components/BackgroundGraph';
import type { Submission } from '../types';

const ROLE_CFG: Record<string,{label:string;color:string;bg:string;border:string}> = {
  admin:     { label:'Администратор', color:'#f87171', bg:'rgba(239,68,68,0.12)',   border:'rgba(239,68,68,0.3)'   },
  moderator: { label:'Модератор',     color:'#22d3ee', bg:'rgba(6,182,212,0.12)',   border:'rgba(6,182,212,0.3)'   },
  user:      { label:'Участник',      color:'#818cf8', bg:'rgba(99,102,241,0.1)',   border:'rgba(99,102,241,0.2)'  },
};

const VERDICT: Record<string,[string,string]> = {
  accepted:      ['AC', '#22c55e'],
  wrong_answer:  ['WA', '#ef4444'],
  time_limit:    ['TLE','#f59e0b'],
  memory_limit:  ['MLE','#f59e0b'],
  runtime_error: ['RE', '#ef4444'],
  compile_error: ['CE', '#818cf8'],
  pending:       ['···','#64748b'],
  running:       ['RUN','#3b82f6'],
};

export function Profile() {
  const { userId }  = useParams<{ userId: string }>();
  const { user: me }= useAuthStore();
  const { theme }   = useThemeStore();
  const dark        = theme === 'dark';
  const qc          = useQueryClient();
  const targetId    = userId ?? me?.id;

  const pageBg   = dark ? '#04080f'                 : '#f1f5f9';
  const t1       = dark ? 'rgba(255,255,255,0.9)'   : 'rgba(0,0,0,0.88)';
  const t2       = dark ? 'rgba(255,255,255,0.45)'  : 'rgba(0,0,0,0.5)';
  const t3       = dark ? 'rgba(255,255,255,0.22)'  : 'rgba(0,0,0,0.28)';
  const cardBg   = dark ? 'rgba(6,12,28,0.75)'      : 'rgba(255,255,255,0.97)';
  const cardBord = dark ? 'rgba(255,255,255,0.07)'  : 'rgba(0,0,0,0.08)';
  const rowHov   = dark ? 'rgba(255,255,255,0.03)'  : 'rgba(0,0,0,0.02)';
  const chipBg   = dark ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.04)';
  const chipBord = dark ? 'rgba(255,255,255,0.1)'   : 'rgba(0,0,0,0.08)';

  const isMe        = targetId === me?.id;
  const { fetchMe } = useAuthStore();
  useEffect(() => { if (isMe) fetchMe(); }, [isMe]);

  const { data: user, isLoading } = useQuery({ queryKey:['user',targetId], queryFn:()=>usersApi.getById(targetId!), enabled:!!targetId, staleTime:0 });
  const { data: profile }         = useQuery({ queryKey:['profile',targetId], queryFn:()=>profilesApi.getById(targetId!), enabled:!!targetId });
  const { data: submissions }     = useQuery({ queryKey:['submissions','user',targetId], queryFn:()=>submissionsApi.me(0,10), enabled:isMe });
  const { data: userAchievements }= useQuery({ queryKey:['achievements','user',targetId], queryFn:()=>achievementsApi.user(targetId!), enabled:!!targetId });
  const { data: ratings }         = useQuery({ queryKey:['ratings',targetId], queryFn:()=>ratingsApi.user(targetId!,0,10), enabled:!!targetId });
  const { data: following }       = useQuery({ queryKey:['following'], queryFn:followsApi.following, enabled:!!me });

  const isFollowing = (following??[]).some((f:{following_id:string})=>f.following_id===targetId);
  const followMut   = useMutation({
    mutationFn: ()=>isFollowing?followsApi.unfollow(targetId!):followsApi.follow(targetId!),
    onSuccess: ()=>qc.invalidateQueries({queryKey:['following']}),
  });

  if (isLoading) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'60vh' }}>
      <div style={{ width:40,height:40,borderRadius:'50%',border:'3px solid rgba(99,102,241,0.3)',borderTopColor:'#818cf8',animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!user) return <div style={{ padding:40,textAlign:'center',color:t2 }}>Пользователь не найден</div>;

  const accepted    = (submissions??[]).filter((s:Submission)=>s.status==='accepted').length;
  const ratingDelta = (ratings??[]).reduce((acc:number,r:{delta:number})=>acc+r.delta,0);
  const effectiveRole = (isMe && me?.role) ? me.role : user.role;
  const role        = ROLE_CFG[effectiveRole]??ROLE_CFG.user;

  return (
    <div style={{ position:'relative',minHeight:'calc(100vh - 56px)',background:pageBg }}>
      <BackgroundGraph noSphere light={!dark}/>

      <div style={{ position:'relative',zIndex:1,maxWidth:1000,margin:'0 auto',padding:'36px 36px 60px' }}>

        {/* Profile card */}
        <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} transition={{duration:0.4}}
          style={{ background:cardBg,border:`1px solid ${cardBord}`,borderRadius:22,overflow:'hidden',backdropFilter:'blur(24px)',marginBottom:22,boxShadow:dark?'none':'0 4px 28px rgba(0,0,0,0.07)' }}>
          <div style={{ height:3,background:'linear-gradient(90deg,#6366f1,#06b6d4,#f59e0b)' }}/>
          <div style={{ padding:'28px 32px',display:'flex',alignItems:'flex-start',gap:24,flexWrap:'wrap' }}>
            {/* Avatar */}
            <div style={{ position:'relative',flexShrink:0 }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" style={{ width:96,height:96,borderRadius:18,objectFit:'cover',border:`2px solid ${cardBord}` }}/>
              ) : (
                <div style={{ width:96,height:96,borderRadius:18,background:'linear-gradient(135deg,#6366f1,#06b6d4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:38,fontWeight:900,color:'#fff',boxShadow:'0 0 40px rgba(99,102,241,0.4)' }}>
                  {user.username[0].toUpperCase()}
                </div>
              )}
              <div style={{ position:'absolute',bottom:-4,right:-4,width:20,height:20,borderRadius:'50%',background:'#22c55e',border:`2px solid ${dark?'#04080f':'#f1f5f9'}` }}/>
            </div>

            {/* Info */}
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',marginBottom:10 }}>
                <h1 style={{ fontSize:26,fontWeight:900,color:t1,margin:0 }}>{user.username}</h1>
                <span style={{ fontSize:11,fontWeight:800,padding:'3px 10px',borderRadius:20,background:role.bg,color:role.color,border:`1px solid ${role.border}` }}>{role.label}</span>
                {isMe && <span style={{ fontSize:11,fontWeight:800,padding:'3px 10px',borderRadius:20,background:'rgba(99,102,241,0.1)',color:'#818cf8',border:'1px solid rgba(99,102,241,0.25)' }}>Это вы</span>}
                {!isMe && me && (
                  <button onClick={()=>followMut.mutate()} disabled={followMut.isPending}
                    style={{ display:'flex',alignItems:'center',gap:7,padding:'7px 14px',background:isFollowing?chipBg:'linear-gradient(135deg,#6366f1,#4f46e5)',border:`1px solid ${isFollowing?chipBord:'transparent'}`,borderRadius:20,color:isFollowing?t1:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',boxShadow:isFollowing?'none':'0 0 16px rgba(99,102,241,0.35)',transition:'all 0.15s' }}>
                    {isFollowing?<><UserCheck size={13}/> Вы друзья</>:<><UserPlus size={13}/> Добавить</>}
                  </button>
                )}
              </div>

              {profile?.first_name && <p style={{ fontSize:15,fontWeight:600,color:t1,margin:'0 0 6px' }}>{profile.first_name} {profile.last_name}</p>}
              {profile?.bio && <p style={{ fontSize:13,color:t2,margin:'0 0 12px',lineHeight:1.6,maxWidth:600 }}>{profile.bio}</p>}

              <div style={{ display:'flex',flexWrap:'wrap',gap:16 }}>
                {profile?.country && (
                  <span style={{ display:'flex',alignItems:'center',gap:5,fontSize:12,color:t3 }}>
                    <MapPin size={12}/> {profile.city?`${profile.city}, `:''}{profile.country}
                  </span>
                )}
                <span style={{ display:'flex',alignItems:'center',gap:5,fontSize:12,color:t3 }}>
                  <Calendar size={12}/> С {format(new Date(user.created_at),'MMMM yyyy',{locale:ru})}
                </span>
                {profile?.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noreferrer"
                    style={{ display:'flex',alignItems:'center',gap:5,fontSize:12,color:'#818cf8',textDecoration:'none' }}>
                    <ExternalLink size={12}/> GitHub
                  </a>
                )}
                {profile?.website_url && (
                  <a href={profile.website_url} target="_blank" rel="noreferrer"
                    style={{ display:'flex',alignItems:'center',gap:5,fontSize:12,color:'#818cf8',textDecoration:'none' }}>
                    <Globe size={12}/> Сайт
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.1,duration:0.4}}
          style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:22 }}>
          {[
            {label:'Рейтинг',     val:Math.max(0,ratingDelta), icon:TrendingUp, color:'#818cf8'},
            {label:'Задач решено',val:accepted,                 icon:CheckCircle,color:'#22c55e'},
            {label:'Посылок',     val:(submissions??[]).length, icon:Code2,      color:'#06b6d4'},
            {label:'Достижений',  val:(userAchievements??[]).length, icon:Award, color:'#f59e0b'},
          ].map(s=>(
            <div key={s.label} style={{ background:cardBg,border:`1px solid ${cardBord}`,borderRadius:16,padding:'18px',backdropFilter:'blur(20px)',display:'flex',flexDirection:'column',alignItems:'center',gap:8,textAlign:'center',boxShadow:dark?'none':'0 2px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ width:40,height:40,borderRadius:12,background:`${s.color}18`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                <s.icon size={20} color={s.color}/>
              </div>
              <p style={{ fontSize:26,fontWeight:900,fontFamily:'monospace',color:s.color,margin:0,lineHeight:1 }}>{s.val}</p>
              <p style={{ fontSize:11,color:t3,margin:0 }}>{s.label}</p>
            </div>
          ))}
        </motion.div>

        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:18 }}>
          {/* Submissions */}
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.18,duration:0.4}}>
            <div style={{ background:cardBg,border:`1px solid ${cardBord}`,borderRadius:18,overflow:'hidden',backdropFilter:'blur(20px)',boxShadow:dark?'none':'0 3px 16px rgba(0,0,0,0.05)' }}>
              <div style={{ padding:'16px 20px',borderBottom:`1px solid ${cardBord}`,display:'flex',alignItems:'center',gap:8 }}>
                <Code2 size={15} color={t3}/>
                <span style={{ fontSize:14,fontWeight:700,color:t1 }}>Последние посылки</span>
              </div>
              {(submissions??[]).length===0 ? (
                <div style={{ padding:'40px 0',textAlign:'center',color:t3,fontSize:13 }}>Посылок пока нет</div>
              ) : (
                <div>
                  {(submissions??[]).map((sub:Submission)=>{
                    const [label,color] = VERDICT[sub.status]??[sub.status.slice(0,3).toUpperCase(),'#64748b'];
                    return (
                      <div key={sub.id} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 20px',borderBottom:`1px solid ${cardBord}`,transition:'background 0.15s' }}
                        onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background=rowHov}
                        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='transparent'}>
                        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                          <span style={{ fontSize:10,fontWeight:800,padding:'2px 8px',borderRadius:6,background:`${color}18`,color,fontFamily:'monospace',letterSpacing:'0.04em' }}>{label}</span>
                          <span style={{ fontSize:12,color:t3 }}>{sub.language}</span>
                        </div>
                        <span style={{ fontSize:11,color:t3 }}>{formatDistanceToNow(new Date(sub.created_at),{addSuffix:true,locale:ru})}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.24,duration:0.4}}>
            <div style={{ background:cardBg,border:`1px solid ${cardBord}`,borderRadius:18,overflow:'hidden',backdropFilter:'blur(20px)',boxShadow:dark?'none':'0 3px 16px rgba(0,0,0,0.05)' }}>
              <div style={{ padding:'16px 20px',borderBottom:`1px solid ${cardBord}`,display:'flex',alignItems:'center',gap:8 }}>
                <Award size={15} color="#f59e0b"/>
                <span style={{ fontSize:14,fontWeight:700,color:t1 }}>Достижения</span>
                <span style={{ marginLeft:'auto',fontSize:11,color:t3 }}>{(userAchievements??[]).length} получено</span>
              </div>
              {(userAchievements??[]).length===0 ? (
                <div style={{ padding:'40px 0',textAlign:'center',color:t3 }}>
                  <Award size={32} style={{ margin:'0 auto 10px',opacity:0.2 }}/>
                  <p style={{ fontSize:13,margin:0 }}>Достижений пока нет</p>
                </div>
              ) : (
                <div style={{ padding:'14px',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10 }}>
                  {(userAchievements??[]).map((ua:{id:string;achievement?:{name:string;icon?:string;description?:string}})=>(
                    <div key={ua.id} title={ua.achievement?.description}
                      style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:6,padding:'12px 8px',borderRadius:13,background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',textAlign:'center' }}>
                      <span style={{ fontSize:24 }}>{ua.achievement?.icon??'🏆'}</span>
                      <p style={{ fontSize:11,color:t1,fontWeight:600,margin:0,lineHeight:1.3 }}>{ua.achievement?.name??'Достижение'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Rating history */}
          {(ratings??[]).length>0 && (
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.3,duration:0.4}} style={{ gridColumn:'span 2' }}>
              <div style={{ background:cardBg,border:`1px solid ${cardBord}`,borderRadius:18,overflow:'hidden',backdropFilter:'blur(20px)',boxShadow:dark?'none':'0 3px 16px rgba(0,0,0,0.05)' }}>
                <div style={{ padding:'16px 20px',borderBottom:`1px solid ${cardBord}`,display:'flex',alignItems:'center',gap:8 }}>
                  <TrendingUp size={15} color="#818cf8"/>
                  <span style={{ fontSize:14,fontWeight:700,color:t1 }}>История рейтинга</span>
                </div>
                <div style={{ padding:'8px 20px' }}>
                  {(ratings??[]).map((r:{id:string;delta:number;created_at:string})=>(
                    <div key={r.id} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:`1px solid ${cardBord}` }}>
                      <span style={{ fontSize:12,color:t2 }}>{format(new Date(r.created_at),'d MMM yyyy',{locale:ru})}</span>
                      <span style={{ fontSize:15,fontFamily:'monospace',fontWeight:800,color:r.delta>=0?'#22c55e':'#ef4444' }}>
                        {r.delta>=0?'+':''}{r.delta}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
