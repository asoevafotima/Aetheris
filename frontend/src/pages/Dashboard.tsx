import { Component, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import {
  Code2, Trophy, Swords, TrendingUp, CheckCircle2,
  Clock, ArrowUpRight, AlertCircle, RefreshCw, Zap, Bot, Target, Flame,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { submissionsApi, contestsApi, ratingsApi, problemsApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';
import { StatusBadge, DifficultyBadge } from '../components/ui/Badge';
import { SkeletonLine } from '../components/ui/Spinner';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

/* ── Error boundary ── */
class ErrBound extends Component<{children:ReactNode},{err:boolean;msg:string}> {
  constructor(p:{children:ReactNode}) { super(p); this.state={err:false,msg:''}; }
  static getDerivedStateFromError(e:Error) { return {err:true,msg:e.message}; }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle size={32} style={{ color: '#f87171' }} />
        <Button icon={<RefreshCw size={13}/>} onClick={()=>this.setState({err:false,msg:''})}>Retry</Button>
      </div>
    );
  }
}

/* ── CountUp ── */
function CountUp({to, delay=0}:{to:number; delay?:number}) {
  const v = useMotionValue(0);
  const d = useTransform(v, n => Math.round(n).toLocaleString());
  useEffect(() => {
    const t = setTimeout(() => animate(v, to, { duration: 1.4, ease: 'easeOut' }), delay);
    return () => clearTimeout(t);
  }, [to]);
  return <motion.span>{d}</motion.span>;
}

/* ── Contribution graph ── */
function ContribGraph({submissions}:{submissions?:{created_at?:string}[]}) {
  const active = new Set<string>();
  (submissions??[]).forEach(s => {
    if(s.created_at) try{ active.add(new Date(s.created_at).toISOString().split('T')[0]); }catch{/**/}
  });
  const weeks:{date:string;level:number}[][]=[];
  const start=new Date(); start.setDate(start.getDate()-52*7+1);
  for(let w=0;w<52;w++){
    const wk:{date:string;level:number}[]=[];
    for(let d=0;d<7;d++){
      const dt=new Date(start); dt.setDate(start.getDate()+w*7+d);
      const key=dt.toISOString().split('T')[0];
      const seed=(dt.getDate()*7+dt.getMonth()*31)%5;
      wk.push({date:key,level:active.has(key)?Math.max(2,seed):seed>3?1:0});
    }
    weeks.push(wk);
  }
  const MN=['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
  const labels:{l:string;c:number}[]=[]; let last=-1;
  weeks.forEach((wk,wi)=>{ const m=new Date(wk[0].date).getMonth(); if(m!==last){labels.push({l:MN[m],c:wi});last=m;} });
  return (
    <div style={{overflowX:'auto'}}>
      <div style={{display:'inline-block'}}>
        <div style={{display:'flex',gap:3,marginBottom:4,marginLeft:20}}>
          {weeks.map((_,wi)=>{const lb=labels.find(l=>l.c===wi); return <div key={wi} style={{width:11,fontSize:9,color:'var(--text-3)',flexShrink:0}}>{lb?.l??''}</div>;})}
        </div>
        <div style={{display:'flex',gap:3}}>
          <div style={{display:'flex',flexDirection:'column',gap:3,marginRight:6}}>
            {['Пн','','Ср','','Пт','','Вс'].map((d,i)=>(
              <div key={i} style={{height:11,fontSize:9,lineHeight:'11px',width:14,textAlign:'right',color:'var(--text-3)'}}>{d}</div>
            ))}
          </div>
          {weeks.map((wk,wi)=>(
            <div key={wi} style={{display:'flex',flexDirection:'column',gap:3}}>
              {wk.map(({date,level})=>(
                <motion.div key={date} whileHover={{scale:1.5}} transition={{duration:0.1}}
                  className={`cg-cell cg-${level}`} title={date} />
              ))}
            </div>
          ))}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,marginTop:8,marginLeft:20,fontSize:9,color:'var(--text-3)'}}>
          <span>Меньше</span>
          {[0,1,2,3,4].map(l=><div key={l} className={`cg-cell cg-${l}`} style={{flexShrink:0}}/>)}
          <span>Больше</span>
        </div>
      </div>
    </div>
  );
}

const ANIM = {
  hidden: {opacity:0, y:20},
  show: (i:number) => ({opacity:1, y:0, transition:{delay:i*0.06, duration:0.45, ease:'easeOut' as const}}),
};

/* ── Stat card ── */
function StatCard({value,label,Icon,color,delay}:{value:number;label:string;Icon:React.ElementType;color:string;delay:number}) {
  return (
    <motion.div custom={delay} variants={ANIM} initial="hidden" animate="show"
      whileHover={{y:-4, transition:{duration:0.2}}}
      style={{
        padding:24, borderRadius:16, cursor:'default', position:'relative', overflow:'hidden',
        background:'var(--surface)', border:'1px solid var(--border)',
        boxShadow:'var(--shadow)',
        transition:'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e=>{
        (e.currentTarget as HTMLDivElement).style.borderColor='rgba(124,58,237,0.4)';
        (e.currentTarget as HTMLDivElement).style.boxShadow='0 20px 40px rgba(124,58,237,0.1)';
      }}
      onMouseLeave={e=>{
        (e.currentTarget as HTMLDivElement).style.borderColor='var(--border)';
        (e.currentTarget as HTMLDivElement).style.boxShadow='var(--shadow)';
      }}
    >
      {/* bg glow */}
      <div style={{position:'absolute',bottom:-20,right:-20,width:80,height:80,borderRadius:'50%',background:`radial-gradient(circle,${color}25,transparent)`,filter:'blur(16px)'}} />
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
        <div style={{width:36,height:36,borderRadius:12,background:`${color}18`,border:`1px solid ${color}25`,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Icon size={16} color={color} />
        </div>
        <span style={{fontSize:12,color:'var(--text-3)',fontWeight:500}}>{label}</span>
      </div>
      <div style={{fontSize:36,fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:'var(--text-1)',letterSpacing:'-0.02em'}}>
        <CountUp to={value} delay={delay*1000+300} />
      </div>
    </motion.div>
  );
}

/* ── Panel ── */
function Panel({children,style={}}:{children:ReactNode;style?:React.CSSProperties}) {
  return (
    <div style={{borderRadius:16,overflow:'hidden',background:'var(--surface)',border:'1px solid var(--border)',boxShadow:'var(--shadow)',...style}}>
      {children}
    </div>
  );
}
function PanelHead({icon,title,action}:{icon?:ReactNode;title:string;action?:ReactNode}) {
  return (
    <div style={{padding:'14px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:8}}>
      {icon}
      <span style={{fontSize:13,fontWeight:600,color:'var(--text-1)',flex:1}}>{title}</span>
      {action}
    </div>
  );
}

function Inner() {
  const {user}=useAuthStore();
  const {data:subs,isLoading:sl,isError:se}=useQuery({queryKey:['submissions','me'],queryFn:()=>submissionsApi.me(0,20),retry:false});
  const {data:contests}=useQuery({queryKey:['contests','upcoming'],queryFn:()=>contestsApi.list({limit:4}),retry:false});
  const {data:ratings}=useQuery({queryKey:['ratings','me'],queryFn:()=>ratingsApi.me(0,10),retry:false});
  const {data:problems}=useQuery({queryKey:['problems','list'],queryFn:()=>problemsApi.list({limit:5}),retry:false});

  const accepted=subs?.filter(s=>s.status==='accepted').length??0;
  const rating=ratings?.reduce((a,r)=>a+(r.delta??0),1200)??1200;
  const h=new Date().getHours();
  const gr=h<12?'Доброе утро':h<18?'Добрый день':'Добрый вечер';

  function fmtDate(d?:string|null){
    if(!d)return'—';
    try{return formatDistanceToNow(new Date(d),{addSuffix:true,locale:ru})}catch{return'—'}
  }

  return (
    <div style={{minHeight:'100vh',padding:'32px 32px',background:'var(--bg)'}}>
      {/* Header */}
      <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} transition={{duration:0.45,ease:'easeOut'}} style={{marginBottom:36}}>
        <p style={{fontSize:11,fontWeight:600,letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--text-3)',marginBottom:8}}>{gr}</p>
        <h1 style={{fontSize:36,fontWeight:800,letterSpacing:'-0.03em',color:'var(--text-1)',lineHeight:1.1}}>
          {user?.username??'...'} <span style={{fontSize:28}}>👋</span>
        </h1>
        <p style={{fontSize:14,color:'var(--text-3)',marginTop:6}}>Готов к новым достижениям?</p>
      </motion.div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:28}}>
        <StatCard value={accepted}          label="Решено задач"  Icon={CheckCircle2} color="#34d399" delay={0}    />
        <StatCard value={rating}            label="Рейтинг"       Icon={TrendingUp}   color="#a78bfa" delay={1}    />
        <StatCard value={subs?.length??0}   label="Посылок"       Icon={Code2}        color="#22d3ee" delay={2}    />
        <StatCard value={contests?.length??0} label="Контестов"  Icon={Trophy}       color="#fbbf24" delay={3}    />
      </div>

      {/* Main grid */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:20}}>

        {/* Left */}
        <div style={{display:'flex',flexDirection:'column',gap:20}}>

          {/* Quick actions */}
          <motion.div custom={4} variants={ANIM} initial="hidden" animate="show">
            <Panel>
              <PanelHead icon={<Zap size={14} color="#a78bfa"/>} title="Быстрый старт"/>
              <div style={{padding:16,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
                {[
                  {to:'/problems',  Icon:Code2,   l:'Задачи',    c:'#a78bfa'},
                  {to:'/duels',     Icon:Swords,  l:'Дуэль',     c:'#f87171'},
                  {to:'/contests',  Icon:Trophy,  l:'Контесты',  c:'#fbbf24'},
                  {to:'/ai-mentor', Icon:Bot,     l:'AI Ментор', c:'#22d3ee'},
                  {to:'/training',  Icon:Target,  l:'Тренировка',c:'#34d399'},
                  {to:'/leaderboard',Icon:Flame,  l:'Рейтинг',   c:'#fb923c'},
                ].map(({to,Icon,l,c})=>(
                  <Link key={to} to={to}>
                    <motion.div whileHover={{y:-3,scale:1.02}} whileTap={{scale:0.97}} transition={{duration:0.15}}
                      style={{padding:'16px 12px',borderRadius:14,textAlign:'center',cursor:'pointer',
                        background:'var(--bg-2,var(--bg))',border:'1px solid var(--border)',transition:'border-color 0.2s'}}
                      onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor=c+'50'}
                      onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor='var(--border)'}
                    >
                      <div style={{width:38,height:38,borderRadius:10,background:c+'18',border:`1px solid ${c}25`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px'}}>
                        <Icon size={17} color={c}/>
                      </div>
                      <p style={{fontSize:12,fontWeight:600,color:'var(--text-2)'}}>{l}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </Panel>
          </motion.div>

          {/* Submissions */}
          <motion.div custom={5} variants={ANIM} initial="hidden" animate="show">
            <Panel>
              <PanelHead
                icon={<Clock size={13} color="var(--text-3)"/>}
                title="Последние посылки"
                action={<Link to="/problems"><button style={{fontSize:12,color:'var(--accent)',cursor:'pointer',background:'none',border:'none',display:'flex',alignItems:'center',gap:4}}>Все <ArrowUpRight size={11}/></button></Link>}
              />
              {sl ? (
                <div style={{padding:20,display:'flex',flexDirection:'column',gap:12}}>
                  {[1,2,3].map(i=><SkeletonLine key={i} className="h-10 w-full"/>)}
                </div>
              ) : se||!subs?.length ? (
                <div style={{padding:48,textAlign:'center',color:'var(--text-3)'}}>
                  <Code2 size={28} style={{margin:'0 auto 12px',opacity:0.2}}/>
                  <p style={{fontSize:13}}>Посылок нет. <Link to="/problems" style={{color:'var(--accent)'}}>Реши задачу!</Link></p>
                </div>
              ) : (
                <div>
                  <AnimatePresence>
                    {subs.slice(0,8).map((sub,i)=>(
                      <motion.div key={sub.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
                        style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 20px',borderBottom:'1px solid var(--border)',cursor:'default',transition:'background 0.1s'}}
                        onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='var(--hover)'}
                        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}
                      >
                        <div style={{display:'flex',alignItems:'center',gap:12,minWidth:0}}>
                          <StatusBadge status={sub.status}/>
                          <div style={{minWidth:0}}>
                            <p style={{fontSize:12,fontFamily:'JetBrains Mono,monospace',color:'var(--text-1)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                              {(sub.problem_id??sub.id??'').slice(0,8)}…
                            </p>
                            <p style={{fontSize:11,color:'var(--text-3)'}}>{sub.language??'?'} · {fmtDate(sub.created_at)}</p>
                          </div>
                        </div>
                        {sub.time_ms!=null && <span style={{fontSize:11,fontFamily:'JetBrains Mono,monospace',color:'var(--text-3)',flexShrink:0}}>{sub.time_ms}мс</span>}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </Panel>
          </motion.div>

          {/* Contribution graph */}
          <motion.div custom={6} variants={ANIM} initial="hidden" animate="show">
            <Panel>
              <PanelHead icon={<Zap size={13} color="#a78bfa"/>} title="Активность за год" action={<span style={{fontSize:11,color:'var(--text-3)'}}>{accepted} решено</span>}/>
              <div style={{padding:20}}><ContribGraph submissions={subs}/></div>
            </Panel>
          </motion.div>
        </div>

        {/* Right */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>

          {/* Contests */}
          <motion.div custom={7} variants={ANIM} initial="hidden" animate="show">
            <Panel>
              <PanelHead icon={<Trophy size={13} color="#fbbf24"/>} title="Контесты" action={<Link to="/contests"><button style={{fontSize:12,color:'var(--accent)',cursor:'pointer',background:'none',border:'none'}}>Все</button></Link>}/>
              <div style={{padding:12,display:'flex',flexDirection:'column',gap:8}}>
                {!contests?.length
                  ? <p style={{fontSize:13,textAlign:'center',padding:'20px 0',color:'var(--text-3)'}}>Нет контестов</p>
                  : contests.map(c=>(
                    <Link key={c.id} to={`/contests/${c.slug??c.id}`}>
                      <motion.div whileHover={{x:3}} transition={{duration:0.15}}
                        style={{padding:'12px 14px',borderRadius:12,cursor:'pointer',background:'var(--bg)',border:'1px solid var(--border)',transition:'border-color 0.2s'}}
                        onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor='rgba(124,58,237,0.35)'}
                        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor='var(--border)'}
                      >
                        <p style={{fontSize:13,fontWeight:500,color:'var(--text-1)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.title}</p>
                        <p style={{fontSize:11,fontFamily:'JetBrains Mono,monospace',color:'var(--text-3)',marginTop:2}}>
                          {c.starts_at?new Date(c.starts_at as unknown as string).toLocaleDateString('ru-RU'):'—'}
                        </p>
                      </motion.div>
                    </Link>
                  ))}
              </div>
            </Panel>
          </motion.div>

          {/* Recommended */}
          <motion.div custom={8} variants={ANIM} initial="hidden" animate="show">
            <Panel>
              <PanelHead title="Рекомендуем"/>
              <div style={{padding:12,display:'flex',flexDirection:'column',gap:4}}>
                {!problems?.length
                  ? <p style={{fontSize:13,textAlign:'center',padding:'20px 0',color:'var(--text-3)'}}>Нет задач</p>
                  : problems.slice(0,5).map(p=>(
                    <Link key={p.id} to={`/problems/${p.slug??p.id}`}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 8px',borderRadius:10,cursor:'pointer',transition:'background 0.1s'}}
                        onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='var(--hover)'}
                        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                        <p style={{fontSize:13,color:'var(--text-2)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginRight:8}}>{p.title}</p>
                        <DifficultyBadge difficulty={p.difficulty??'easy'}/>
                      </div>
                    </Link>
                  ))}
              </div>
            </Panel>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() { return <ErrBound><Inner/></ErrBound>; }
