import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, X, Shield, Star, Globe, Lock, AlertCircle, ChevronRight, Zap } from 'lucide-react';
import { teamsApi } from '../api/endpoints';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useThemeStore } from '../store/themeStore';
import { BackgroundGraph } from '../components/BackgroundGraph';
import type { Team } from '../types';

const TEAM_GRADIENTS = [
  'linear-gradient(135deg,#6366f1,#4f46e5)',
  'linear-gradient(135deg,#06b6d4,#0891b2)',
  'linear-gradient(135deg,#22c55e,#16a34a)',
  'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#ef4444,#dc2626)',
  'linear-gradient(135deg,#a855f7,#9333ea)',
  'linear-gradient(135deg,#f43f5e,#e11d48)',
  'linear-gradient(135deg,#10b981,#059669)',
];

function hashGrad(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return TEAM_GRADIENTS[Math.abs(h) % TEAM_GRADIENTS.length];
}

function TeamCard({ team, dark }: { team: Team; dark: boolean }) {
  const t1      = dark ? 'rgba(255,255,255,0.9)'  : 'rgba(0,0,0,0.88)';
  const t2      = dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
  const t3      = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.28)';
  const cardBg  = dark ? 'rgba(6,12,28,0.75)'     : 'rgba(255,255,255,0.97)';
  const cardBord= dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const chipBg  = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const chipBord= dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.08)';
  const grad    = hashGrad(team.name);

  return (
    <Link to={`/teams/${team.slug}`} style={{ textDecoration:'none' }}>
      <motion.div
        whileHover={{ y:-4 }} transition={{ duration:0.18 }}
        style={{ background:cardBg, border:`1px solid ${cardBord}`, borderRadius:18, overflow:'hidden', position:'relative', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', cursor:'pointer', transition:'border-color 0.2s, box-shadow 0.2s', boxShadow:dark?'none':'0 4px 20px rgba(0,0,0,0.06)' }}
        onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=dark?'rgba(99,102,241,0.4)':'rgba(99,102,241,0.3)';(e.currentTarget as HTMLDivElement).style.boxShadow=dark?'0 0 30px rgba(99,102,241,0.15)':'0 8px 32px rgba(0,0,0,0.1)';}}
        onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=cardBord;(e.currentTarget as HTMLDivElement).style.boxShadow=dark?'none':'0 4px 20px rgba(0,0,0,0.06)';}}
      >
        {/* Top gradient line */}
        <div style={{ height:2, background:grad.replace('linear-gradient(135deg,','linear-gradient(90deg,').replace(')',',transparent)') }} />

        <div style={{ padding:'20px 20px 16px' }}>
          {/* Avatar + name */}
          <div style={{ display:'flex',alignItems:'flex-start',gap:14,marginBottom:14 }}>
            {team.avatar_url ? (
              <img src={team.avatar_url} alt="" style={{ width:52,height:52,borderRadius:14,objectFit:'cover',flexShrink:0 }} />
            ) : (
              <div style={{ width:52,height:52,borderRadius:14,background:grad,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:900,color:'#fff',flexShrink:0,boxShadow:`0 0 20px ${grad.slice(grad.indexOf('#'),grad.indexOf('#')+7)}33` }}>
                {team.name[0]?.toUpperCase()}
              </div>
            )}
            <div style={{ flex:1,minWidth:0 }}>
              <p style={{ fontSize:16,fontWeight:800,color:t1,margin:'0 0 6px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{team.name}</p>
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                <span style={{ display:'flex',alignItems:'center',gap:4,fontSize:12,fontWeight:700,color:'#f59e0b' }}>
                  <Star size={11} style={{ fill:'#f59e0b' }} /> {Math.round(team.rating)}
                </span>
                <span style={{ fontSize:12,color:t3 }}>·</span>
                <span style={{ display:'flex',alignItems:'center',gap:4,fontSize:12,color:t3 }}>
                  {team.is_public ? <Globe size={11}/> : <Lock size={11}/>}
                  {team.is_public ? 'Публичная' : 'Приватная'}
                </span>
              </div>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:4,padding:'4px 10px',borderRadius:20,background:chipBg,border:`1px solid ${chipBord}`,flexShrink:0 }}>
              <Users size={11} color={t3}/>
              <span style={{ fontSize:11,color:t2,fontWeight:600 }}>{team.max_members}</span>
            </div>
          </div>

          {team.description && (
            <p style={{ fontSize:13,color:t2,margin:'0 0 14px',lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden' }}>
              {team.description}
            </p>
          )}

          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:12,borderTop:`1px solid ${chipBord}` }}>
            <span style={{ fontSize:11,color:t3 }}>
              {formatDistanceToNow(new Date(team.created_at), { addSuffix:true, locale:ru })}
            </span>
            <span style={{ display:'flex',alignItems:'center',gap:4,fontSize:12,fontWeight:700,color:'#818cf8' }}>
              Войти <ChevronRight size={13}/>
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function CreateTeamModal({ onClose, dark }: { onClose: () => void; dark: boolean }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name:'', description:'', is_public:true, max_members:5 });
  const [error, setError] = useState('');

  const t1 = dark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.88)';
  const t2 = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
  const t3 = dark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.32)';
  const modalBg  = dark ? 'rgba(4,8,20,0.98)'     : 'rgba(255,255,255,0.99)';
  const modalBord= dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.1)';
  const inputBg  = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const inputSt  = { width:'100%', background:inputBg, border:`1px solid ${modalBord}`, borderRadius:11, color:t1, fontSize:13, padding:'10px 13px', outline:'none', fontFamily:'inherit', boxSizing:'border-box' as const, transition:'border-color 0.15s' };
  const labelSt  = { fontSize:11, fontWeight:800 as const, color:t3, textTransform:'uppercase' as const, letterSpacing:'0.08em' as const, display:'block' as const, marginBottom:7 };

  const createMut = useMutation({
    mutationFn: () => teamsApi.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams'] }); onClose(); },
    onError: (e:unknown) => {
      const msg = (e as { response?:{data?:{detail?:string}} })?.response?.data?.detail;
      setError(msg ?? 'Ошибка создания команды');
    },
  });

  const grad = form.name ? hashGrad(form.name) : 'linear-gradient(135deg,#6366f1,#4f46e5)';

  return (
    <div style={{ position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        onClick={onClose} style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)' }} />
      <motion.div
        initial={{opacity:0,scale:0.94,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.94,y:20}}
        style={{ position:'relative',width:'100%',maxWidth:460,background:modalBg,border:`1px solid ${modalBord}`,borderRadius:22,overflow:'hidden',boxShadow:'0 40px 120px rgba(0,0,0,0.4)' }}
      >
        <div style={{ height:2, background:grad.replace('linear-gradient(135deg,','linear-gradient(90deg,').replace(')',',transparent)') }} />

        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px 16px' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ width:38,height:38,borderRadius:11,background:'rgba(99,102,241,0.15)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Shield size={18} color="#818cf8"/>
            </div>
            <div>
              <p style={{ fontSize:16,fontWeight:800,color:t1,margin:0 }}>Создать команду</p>
              <p style={{ fontSize:12,color:t3,margin:0 }}>Соревнуйтесь вместе</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32,height:32,borderRadius:9,background:'none',border:`1px solid ${modalBord}`,color:t2,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <X size={15}/>
          </button>
        </div>

        <div style={{ padding:'4px 24px 24px',display:'flex',flexDirection:'column',gap:16 }}>
          {error && (
            <div style={{ display:'flex',alignItems:'center',gap:8,padding:'11px 14px',borderRadius:12,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',fontSize:13 }}>
              <AlertCircle size={15}/> {error}
            </div>
          )}

          {/* Preview avatar */}
          {form.name && (
            <div style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:13,background:inputBg,border:`1px solid ${modalBord}` }}>
              <div style={{ width:44,height:44,borderRadius:12,background:grad,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:900,color:'#fff' }}>
                {form.name[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize:14,fontWeight:700,color:t1,margin:0 }}>{form.name}</p>
                <p style={{ fontSize:11,color:t3,margin:'2px 0 0' }}>Предпросмотр</p>
              </div>
            </div>
          )}

          <div>
            <label style={labelSt}>Название *</label>
            <input style={inputSt} placeholder="AlgoMasters" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
              onFocus={e=>e.target.style.borderColor='rgba(99,102,241,0.5)'} onBlur={e=>e.target.style.borderColor=modalBord} />
          </div>

          <div>
            <label style={labelSt}>Описание</label>
            <textarea style={{...inputSt,resize:'none',height:76}} placeholder="Расскажите о команде..."
              value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
              onFocus={e=>e.target.style.borderColor='rgba(99,102,241,0.5)'} onBlur={e=>e.target.style.borderColor=modalBord} />
          </div>

          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
            <div>
              <label style={labelSt}>Макс. участников</label>
              <input type="number" min={2} max={10} style={inputSt} value={form.max_members} onChange={e=>setForm({...form,max_members:parseInt(e.target.value)||2})} />
            </div>
            <div>
              <label style={labelSt}>Видимость</label>
              <div style={{ display:'flex',borderRadius:11,border:`1px solid ${modalBord}`,overflow:'hidden' }}>
                {[{val:true,label:'Публичная',Icon:Globe},{val:false,label:'Приватная',Icon:Lock}].map(opt=>(
                  <button key={String(opt.val)} type="button" onClick={()=>setForm({...form,is_public:opt.val})}
                    style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5,padding:'10px 0',fontSize:12,fontWeight:700,cursor:'pointer',border:'none',background:form.is_public===opt.val?'linear-gradient(135deg,#4f46e5,#6366f1)':'transparent',color:form.is_public===opt.val?'#fff':t2,transition:'all 0.15s' }}>
                    <opt.Icon size={12}/> {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={()=>createMut.mutate()} disabled={!form.name.trim()||createMut.isPending}
            style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'13px 20px',background:form.name.trim()?'linear-gradient(135deg,#6366f1,#4f46e5)':'rgba(99,102,241,0.1)',boxShadow:form.name.trim()?'0 0 28px rgba(99,102,241,0.4)':'none',border:'none',borderRadius:13,color:form.name.trim()?'#fff':'#818cf8',fontSize:14,fontWeight:700,cursor:form.name.trim()?'pointer':'not-allowed',transition:'all 0.2s',marginTop:4 }}>
            <Plus size={16}/> {createMut.isPending?'Создание...':'Создать команду'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function Teams() {
  const { theme }     = useThemeStore();
  const dark          = theme === 'dark';
  const [showCreate, setShowCreate] = useState(false);

  const pageBg  = dark ? '#04080f'                : '#f1f5f9';
  const t1      = dark ? 'rgba(255,255,255,0.9)'  : 'rgba(0,0,0,0.88)';
  const t2      = dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
  const t3      = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.28)';
  const cardBg  = dark ? 'rgba(6,12,28,0.7)'      : 'rgba(255,255,255,0.97)';
  const cardBord= dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const chipBg  = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const chipBord= dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.09)';

  const { data: teams, isLoading } = useQuery({ queryKey:['teams'], queryFn:()=>teamsApi.list(0,50) });

  const totalTeams  = (teams as Team[]??[]).length;
  const publicTeams = (teams as Team[]??[]).filter(t=>t.is_public).length;
  const topRating   = Math.max(0,...(teams as Team[]??[]).map(t=>Math.round(t.rating)));

  return (
    <div style={{ position:'relative',minHeight:'calc(100vh - 56px)',background:pageBg }}>
      <BackgroundGraph noSphere light={!dark}/>

      <div style={{ position:'relative',zIndex:1,maxWidth:1320,margin:'0 auto',padding:'36px 36px 60px' }}>

        {/* Header */}
        <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} transition={{duration:0.4}}
          style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16,marginBottom:28 }}>
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:6 }}>
              <div style={{ width:44,height:44,borderRadius:13,background:'rgba(99,102,241,0.15)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Shield size={22} color="#818cf8"/>
              </div>
              <h1 style={{ fontSize:32,fontWeight:900,color:t1,margin:0,letterSpacing:'-0.02em' }}>Команды</h1>
            </div>
            <p style={{ fontSize:14,color:t2,margin:0,paddingLeft:56 }}>Объединяйтесь и соревнуйтесь вместе на олимпиадах</p>
          </div>
          <button onClick={()=>setShowCreate(true)}
            style={{ display:'flex',alignItems:'center',gap:8,padding:'11px 20px',background:'linear-gradient(135deg,#6366f1,#4f46e5)',boxShadow:'0 0 24px rgba(99,102,241,0.35)',border:'none',borderRadius:13,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',transition:'transform 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
            <Plus size={16}/> Создать команду
          </button>
        </motion.div>

        {/* Stats strip */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.08,duration:0.4}}
          style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:28 }}>
          {[
            {label:'Всего команд', val:totalTeams,  icon:Shield, color:'#818cf8'},
            {label:'Публичных',    val:publicTeams,  icon:Globe,  color:'#22c55e'},
            {label:'Приватных',    val:totalTeams-publicTeams, icon:Lock, color:'#f59e0b'},
            {label:'Топ рейтинг',  val:topRating,   icon:Star,   color:'#f43f5e'},
          ].map(s=>(
            <div key={s.label} style={{ background:cardBg,border:`1px solid ${cardBord}`,borderRadius:16,padding:'16px 18px',backdropFilter:'blur(20px)',display:'flex',alignItems:'center',gap:12,boxShadow:dark?'none':'0 2px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ width:38,height:38,borderRadius:11,background:`${s.color}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <s.icon size={18} color={s.color}/>
              </div>
              <div>
                <p style={{ fontSize:22,fontWeight:900,fontFamily:'monospace',color:s.color,margin:0,lineHeight:1 }}>{s.val}</p>
                <p style={{ fontSize:11,color:t3,margin:'3px 0 0' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:18 }}>
            {Array(6).fill(0).map((_,i)=>(
              <div key={i} style={{ height:170,borderRadius:18,background:chipBg,border:`1px solid ${chipBord}` }}/>
            ))}
          </div>
        ) : (teams as Team[]??[]).length===0 ? (
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 0',gap:16 }}>
            <Users size={52} style={{ color:t3,opacity:0.3 }}/>
            <p style={{ fontSize:18,color:t2,margin:0 }}>Команд пока нет</p>
            <button onClick={()=>setShowCreate(true)}
              style={{ padding:'9px 20px',background:'rgba(99,102,241,0.12)',border:'1px solid rgba(99,102,241,0.3)',borderRadius:12,color:'#818cf8',fontSize:13,fontWeight:600,cursor:'pointer' }}>
              Создать первую команду
            </button>
          </div>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:18 }}>
            {(teams as Team[]).map((team,i)=>(
              <motion.div key={team.id} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:i*0.04,duration:0.3}}>
                <TeamCard team={team} dark={dark}/>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && <CreateTeamModal onClose={()=>setShowCreate(false)} dark={dark}/>}
      </AnimatePresence>
    </div>
  );
}
