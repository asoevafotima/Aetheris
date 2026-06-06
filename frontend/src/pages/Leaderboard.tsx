import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Crown, Search, TrendingUp, X } from 'lucide-react';
import { ratingsApi } from '../api/endpoints';
import { useAuthStore }  from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useT }          from '../i18n';
import { BackgroundGraph } from '../components/BackgroundGraph';

const ROLE_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  admin:     { label:'Админ',     color:'#f87171', bg:'rgba(239,68,68,0.12)',   border:'rgba(239,68,68,0.3)'   },
  moderator: { label:'Модератор', color:'#22d3ee', bg:'rgba(6,182,212,0.12)',   border:'rgba(6,182,212,0.3)'   },
  user:      { label:'Участник',  color:'#818cf8', bg:'rgba(129,140,248,0.1)',  border:'rgba(129,140,248,0.2)' },
};

const RANK_CFG = [
  { color:'#f59e0b', bg:'rgba(245,158,11,0.12)', border:'rgba(245,158,11,0.4)', glow:'rgba(245,158,11,0.3)', size:72, podium:120, avatarGrad:'linear-gradient(135deg,#f59e0b,#d97706)' },
  { color:'#94a3b8', bg:'rgba(148,163,184,0.1)', border:'rgba(148,163,184,0.3)', glow:'rgba(148,163,184,0.2)', size:60, podium:84,  avatarGrad:'linear-gradient(135deg,#64748b,#94a3b8)' },
  { color:'#cd7c2f', bg:'rgba(205,124,47,0.12)', border:'rgba(205,124,47,0.3)', glow:'rgba(205,124,47,0.2)', size:56, podium:64,  avatarGrad:'linear-gradient(135deg,#92400e,#cd7c2f)' },
];

type Entry = { user_id: string; username: string; role: string; rating: number; created_at: string };

export function Leaderboard() {
  const [search, setSearch] = useState('');
  const { user: me }    = useAuthStore();
  const { lang, theme } = useThemeStore();
  const dark = theme === 'dark';
  const t    = useT();

  const pageBg   = dark ? '#04080f'                 : '#f1f5f9';
  const t1       = dark ? 'rgba(255,255,255,0.9)'   : 'rgba(0,0,0,0.88)';
  const t2       = dark ? 'rgba(255,255,255,0.45)'  : 'rgba(0,0,0,0.5)';
  const t3       = dark ? 'rgba(255,255,255,0.22)'  : 'rgba(0,0,0,0.28)';
  const cardBg   = dark ? 'rgba(6,12,28,0.72)'      : 'rgba(255,255,255,0.97)';
  const cardBord = dark ? 'rgba(255,255,255,0.07)'  : 'rgba(0,0,0,0.08)';
  const chipBg   = dark ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.04)';
  const inputBg  = dark ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.04)';
  const inputBord= dark ? 'rgba(255,255,255,0.1)'   : 'rgba(0,0,0,0.11)';
  const hoverBg  = dark ? 'rgba(255,255,255,0.04)'  : 'rgba(0,0,0,0.03)';
  const meBg     = dark ? 'rgba(99,102,241,0.08)'   : 'rgba(99,102,241,0.05)';

  const { data: entries, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => ratingsApi.leaderboard(100),
    staleTime: 60_000,
  });

  const all = (entries ?? []) as Entry[];
  const filtered = all.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));

  const podiumOrder    = [filtered[1], filtered[0], filtered[2]].filter(Boolean);
  const podiumCfgOrder = [RANK_CFG[1], RANK_CFG[0], RANK_CFG[2]];
  const podiumRankOrder= [2, 1, 3];

  return (
    <div style={{ position:'relative', minHeight:'calc(100vh - 56px)', background:pageBg }}>
      <BackgroundGraph noSphere light={!dark} />

      <div style={{ position:'relative', zIndex:1, maxWidth:900, margin:'0 auto', padding:'36px 36px 60px' }}>

        {/* Header */}
        <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} transition={{duration:0.4}}
          style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:12,marginBottom:8 }}>
            <Crown size={30} color="#f59e0b" />
            <h1 style={{ fontSize:34,fontWeight:900,color:t1,margin:0,letterSpacing:'-0.02em' }}>{t.leaderboard.title}</h1>
          </div>
          <p style={{ fontSize:14,color:t2,margin:0 }}>{t.leaderboard.subtitle}</p>
        </motion.div>

        {/* Podium — only show if top 3 have actual ratings > 0 */}
        {!isLoading && filtered.length >= 3 && filtered[0].rating > 0 && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1,duration:0.5}}
            style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:16, marginBottom:44 }}>
            {podiumOrder.map((u, idx) => {
              const cfg  = podiumCfgOrder[idx];
              const rank = podiumRankOrder[idx];
              const trueIdx = filtered.indexOf(u);
              return (
                <Link key={u.user_id} to={`/profile/${u.user_id}`} style={{ textDecoration:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                  <motion.div whileHover={{ scale:1.08 }} style={{ position:'relative' }}>
                    <div style={{ width:cfg.size, height:cfg.size, borderRadius:'50%', background:cfg.avatarGrad,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:cfg.size*0.38,fontWeight:900,color:'#fff',
                      boxShadow:`0 0 30px ${cfg.glow}`, border:`2px solid ${cfg.border}` }}>
                      {u.username[0].toUpperCase()}
                    </div>
                    {rank === 1 && (
                      <div style={{ position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',fontSize:22 }}>👑</div>
                    )}
                  </motion.div>
                  <p style={{ fontSize:13,fontWeight:800,color:cfg.color,margin:0,textAlign:'center' }}>{u.username}</p>
                  <p style={{ fontSize:12,fontFamily:'monospace',color:t2,margin:0,fontWeight:700 }}>
                    {u.rating.toLocaleString()}
                  </p>
                  <div style={{ width:84, height:cfg.podium, borderRadius:'12px 12px 0 0',
                    background: dark
                      ? `rgba(${rank===1?'245,158,11':rank===2?'148,163,184':'205,124,47'},0.12)`
                      : `rgba(${rank===1?'245,158,11':rank===2?'148,163,184':'205,124,47'},0.1)`,
                    border:`1px solid ${cfg.border}`, borderBottom:'none',
                    display:'flex',alignItems:'center',justifyContent:'center' }}>
                    <span style={{ fontSize:28,fontWeight:900,color:cfg.color,fontFamily:'monospace' }}>{rank}</span>
                  </div>
                </Link>
              );
            })}
          </motion.div>
        )}

        {/* Search */}
        <div style={{ position:'relative', marginBottom:20 }}>
          <Search size={15} style={{ position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:t3 }} />
          <input placeholder="Поиск по нику..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width:'100%',paddingLeft:38,paddingRight:search?36:14,paddingTop:11,paddingBottom:11,
              background:inputBg,border:`1px solid ${inputBord}`,borderRadius:13,color:t1,fontSize:13,
              outline:'none',fontFamily:'inherit',boxSizing:'border-box' as const }}
            onFocus={e=>e.target.style.borderColor='rgba(99,102,241,0.5)'}
            onBlur={e =>e.target.style.borderColor=inputBord}/>
          {search && (
            <button onClick={()=>setSearch('')}
              style={{ position:'absolute',right:11,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:t2,cursor:'pointer' }}>
              <X size={14}/>
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{ background:cardBg, border:`1px solid ${cardBord}`, borderRadius:20, overflow:'hidden',
          backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
          boxShadow:dark?'none':'0 4px 30px rgba(0,0,0,0.07)' }}>
          <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(99,102,241,0.4),transparent)' }} />

          {/* Header */}
          <div style={{ display:'grid', gridTemplateColumns:'64px 1fr 130px 110px',
            padding:'12px 24px', borderBottom:`1px solid ${cardBord}` }}>
            {['#', 'Участник', 'Рейтинг', 'Роль'].map((h, i) => (
              <span key={h} style={{ fontSize:10,fontWeight:800,color:t3,textTransform:'uppercase',
                letterSpacing:'0.1em', textAlign:i>=2?'right':'left' }}>{h}</span>
            ))}
          </div>

          {isLoading ? (
            <div style={{ padding:'16px 24px', display:'flex', flexDirection:'column', gap:12 }}>
              {Array(8).fill(0).map((_,i)=>(
                <div key={i} style={{ height:48,borderRadius:12,background:chipBg }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:'60px 0', textAlign:'center', color:t3 }}>
              <Crown size={40} style={{ margin:'0 auto 12px', opacity:0.2 }} />
              <p style={{ margin:0,fontSize:14 }}>{t.leaderboard.not_found}</p>
            </div>
          ) : (
            filtered.map((u: Entry, i: number) => {
              const isMe   = u.user_id === me?.id;
              const role   = ROLE_CFG[u.role] ?? ROLE_CFG.user;
              const ratingColor = u.rating === 0 ? t3
                : i===0 ? '#f59e0b' : i<3 ? '#818cf8' : i<10 ? '#06b6d4' : t1;
              const avatarGrad = u.role==='admin'
                ? 'linear-gradient(135deg,#ef4444,#dc2626)'
                : u.role==='moderator'
                  ? 'linear-gradient(135deg,#0891b2,#06b6d4)'
                  : 'linear-gradient(135deg,#6366f1,#4f46e5)';

              return (
                <motion.div key={u.user_id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay:i*0.018, duration:0.28 }}
                  style={{ display:'grid', gridTemplateColumns:'64px 1fr 130px 110px',
                    alignItems:'center', padding:'13px 24px',
                    borderBottom: i < filtered.length-1 ? `1px solid ${cardBord}` : 'none',
                    background: isMe ? meBg : 'transparent',
                    borderLeft: isMe ? '3px solid rgba(99,102,241,0.5)' : '3px solid transparent',
                    transition:'background 0.15s', cursor:'default' }}
                  onMouseEnter={e=>{if(!isMe)(e.currentTarget as HTMLDivElement).style.background=hoverBg}}
                  onMouseLeave={e=>{if(!isMe)(e.currentTarget as HTMLDivElement).style.background='transparent'}}>

                  {/* Rank */}
                  <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                    {i < 3 && u.rating > 0 ? (
                      <Crown size={16} color={RANK_CFG[i].color} />
                    ) : (
                      <span style={{ fontSize:13,fontFamily:'monospace',color:t3,fontWeight:600,width:20,textAlign:'center' }}>{i+1}</span>
                    )}
                  </div>

                  {/* User */}
                  <Link to={`/profile/${u.user_id}`} style={{ textDecoration:'none',display:'flex',alignItems:'center',gap:12 }}>
                    <div style={{ width:38,height:38,borderRadius:'50%',background:avatarGrad,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:15,fontWeight:900,color:'#fff',flexShrink:0,
                      boxShadow:i<3&&u.rating>0?`0 0 12px ${RANK_CFG[i]?.glow}`:undefined }}>
                      {u.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize:14,fontWeight:700,color:t1,margin:'0 0 2px',display:'flex',alignItems:'center',gap:6 }}>
                        {u.username}
                        {isMe && (
                          <span style={{ fontSize:10,fontWeight:800,color:'#818cf8',background:'rgba(99,102,241,0.12)',border:'1px solid rgba(99,102,241,0.25)',padding:'1px 7px',borderRadius:20 }}>
                            {lang==='ru'?'Вы':'You'}
                          </span>
                        )}
                      </p>
                      <p style={{ fontSize:11,color:t3,margin:0 }}>
                        {lang==='ru'?'С ':'Since '}
                        {new Date(u.created_at).toLocaleDateString(lang==='ru'?'ru-RU':'en-US',{month:'short',year:'numeric'})}
                      </p>
                    </div>
                  </Link>

                  {/* Rating */}
                  <div style={{ textAlign:'right',display:'flex',alignItems:'center',justifyContent:'flex-end',gap:5 }}>
                    <TrendingUp size={12} color={ratingColor} />
                    <span style={{ fontSize:15,fontWeight:800,fontFamily:'monospace',color:ratingColor }}>
                      {u.rating === 0 ? '—' : u.rating.toLocaleString()}
                    </span>
                  </div>

                  {/* Role */}
                  <div style={{ textAlign:'right' }}>
                    <span style={{ fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,
                      background:role.bg,color:role.color,border:`1px solid ${role.border}` }}>
                      {role.label}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {!isLoading && filtered.length > 0 && (
          <p style={{ textAlign:'center',fontSize:12,color:t3,marginTop:16 }}>
            {filtered.length} {lang==='ru'?'участников в рейтинге':'participants in leaderboard'}
          </p>
        )}
      </div>
    </div>
  );
}
