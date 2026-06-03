import { Component, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useMotionValue, useTransform, AnimatePresence, animate } from 'framer-motion';
import {
  Code2, Trophy, Swords, TrendingUp, CheckCircle,
  Clock, ArrowRight, AlertCircle, RefreshCw, Zap, Bot,
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)'}}>
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <p className="text-[var(--t1)] font-semibold">Ошибка загрузки</p>
        <p className="text-red-400 text-xs font-mono px-4 py-2 rounded-xl" style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)'}}>{this.state.msg}</p>
        <Button icon={<RefreshCw size={13}/>} onClick={()=>this.setState({err:false,msg:''})}>Retry</Button>
      </div>
    );
  }
}

/* ── CountUp ── */
function CountUp({to,delay=0,prefix='',suffix=''}:{to:number;delay?:number;prefix?:string;suffix?:string}) {
  const count   = useMotionValue(0);
  const display = useTransform(count, v => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);
  useEffect(() => {
    const t = setTimeout(()=>{
      animate(count, to, {duration:1.4, ease:'easeOut'});
    }, delay);
    return ()=>clearTimeout(t);
  }, [to]);
  return <motion.span className="tabular-nums">{display}</motion.span>;
}

/* ── Contribution graph ── */
function ContribGraph({submissions}:{submissions?:{created_at?:string}[]}) {
  const active = new Set<string>();
  (submissions??[]).forEach(s=>{
    if(s.created_at) try{ active.add(new Date(s.created_at).toISOString().split('T')[0]); }catch{}
  });

  const today = new Date();
  const weeks: {date:string;level:number}[][] = [];
  const start = new Date(today);
  start.setDate(start.getDate() - 52*7 + 1);

  for(let w=0;w<52;w++){
    const wk:typeof weeks[0]=[];
    for(let d=0;d<7;d++){
      const dt = new Date(start);
      dt.setDate(start.getDate()+w*7+d);
      const key = dt.toISOString().split('T')[0];
      const isActive = active.has(key);
      const seed = (dt.getDate()*7+dt.getMonth()*31)%5;
      wk.push({date:key, level: isActive ? Math.max(2,seed) : (seed>3?1:0)});
    }
    weeks.push(wk);
  }

  const MN=['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
  const labels:{l:string;c:number}[]=[];
  let last=-1;
  weeks.forEach((wk,wi)=>{
    const m=new Date(wk[0].date).getMonth();
    if(m!==last){labels.push({l:MN[m],c:wi});last=m;}
  });

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex gap-[3px] mb-1 ml-5">
          {weeks.map((_,wi)=>{
            const lb=labels.find(l=>l.c===wi);
            return <div key={wi} className="w-[11px] text-[8px] shrink-0" style={{color:'var(--t3)'}}>{lb?.l??''}</div>;
          })}
        </div>
        <div className="flex gap-[3px]">
          <div className="flex flex-col gap-[3px] mr-1.5">
            {['Пн','','Ср','','Пт','','Вс'].map((d,i)=>(
              <div key={i} className="h-[11px] text-[8px] leading-[11px] w-[14px] text-right" style={{color:'var(--t3)'}}>{d}</div>
            ))}
          </div>
          {weeks.map((wk,wi)=>(
            <div key={wi} className="flex flex-col gap-[3px]">
              {wk.map(({date,level})=>(
                <motion.div key={date}
                  whileHover={{scale:1.5,zIndex:10}}
                  transition={{duration:0.1}}
                  className={`cg-cell cg-${level}`}
                  title={date}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 mt-2 ml-5 text-[8px]" style={{color:'var(--t3)'}}>
          <span>Меньше</span>
          {[0,1,2,3,4].map(l=><div key={l} className={`cg-cell cg-${l} shrink-0`}/>)}
          <span>Больше</span>
        </div>
      </div>
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({value,label,icon:Icon,g,delay}:{value:number;label:string;icon:React.ElementType;g:string;delay:number}) {
  return (
    <motion.div
      initial={{opacity:0,y:24}}
      animate={{opacity:1,y:0}}
      transition={{delay,duration:0.5,ease:[0.16,1,0.3,1]}}
      whileHover={{y:-3,transition:{duration:0.2}}}
      className="relative p-5 rounded-2xl overflow-hidden cursor-default"
      style={{background:'var(--s0)', border:'1px solid var(--b0)', boxShadow:'var(--sh)'}}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
        style={{background:'radial-gradient(circle at 50% 120%,rgba(99,102,241,0.07) 0%,transparent 70%)'}}/>
      <div className="absolute top-0 left-0 right-0 h-px opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{background:'linear-gradient(90deg,transparent,rgba(129,140,248,0.4),transparent)'}}/>
      <div className="relative flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${g} shadow-xl shrink-0`}>
          <Icon size={20} className="text-white"/>
        </div>
        <div>
          <div className="text-[22px] font-black tracking-tight text-[var(--t1)]">
            <CountUp to={value} delay={delay*1000+400}/>
          </div>
          <div className="text-xs text-[var(--t3)] mt-0.5">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Inner ── */
function Inner() {
  const {user}=useAuthStore();
  const {data:submissions,isLoading:sl,isError:se}=useQuery({queryKey:['submissions','me'],queryFn:()=>submissionsApi.me(0,20),retry:false});
  const {data:contests,isLoading:cl}=useQuery({queryKey:['contests','upcoming'],queryFn:()=>contestsApi.list({limit:3}),retry:false});
  const {data:ratings}=useQuery({queryKey:['ratings','me'],queryFn:()=>ratingsApi.me(0,10),retry:false});
  const {data:problems,isLoading:pl}=useQuery({queryKey:['problems','list'],queryFn:()=>problemsApi.list({limit:5}),retry:false});

  const accepted=submissions?.filter(s=>s.status==='accepted').length??0;
  const rating=ratings?.reduce((a,r)=>a+(r.delta??0),1200)??1200;
  const h=new Date().getHours();
  const gr=h<12?'Доброе утро':h<18?'Добрый день':'Добрый вечер';

  function fmtDate(d?:string|null){
    if(!d)return'—';
    try{return formatDistanceToNow(new Date(d),{addSuffix:true,locale:ru})}catch{return'—'}
  }

  const panel = (children:ReactNode) => (
    <div className="rounded-2xl overflow-hidden" style={{background:'var(--s0)',border:'1px solid var(--b0)',boxShadow:'var(--sh)'}}>
      {children}
    </div>
  );

  const panelHeader=(icon:ReactNode, title:string, action?:ReactNode)=>(
    <div className="px-5 py-4 border-b flex items-center justify-between" style={{borderColor:'var(--b0)'}}>
      <h2 className="text-[13px] font-semibold text-[var(--t1)] flex items-center gap-2">{icon}{title}</h2>
      {action}
    </div>
  );

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}
        transition={{duration:0.5,ease:[0.16,1,0.3,1]}} className="mb-8"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--t1)]">
              {gr},{' '}
              <span className="gradient-text">{user?.username??'...'}</span> 👋
            </h1>
            <p className="text-[var(--t3)] text-sm mt-1">Готов к задачам сегодня?</p>
          </div>
          <div className="flex gap-2">
            <Link to="/problems"><Button variant="outline" size="sm" icon={<Code2 size={13}/>}>Задачи</Button></Link>
            <Link to="/duels"><Button size="sm" icon={<Swords size={13}/>}>Дуэль</Button></Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard value={accepted}           label="Решено задач"  icon={CheckCircle} g="from-emerald-500 to-teal-500"  delay={0}    />
        <StatCard value={rating}             label="Рейтинг"       icon={TrendingUp}  g="from-indigo-500 to-violet-600" delay={0.05} />
        <StatCard value={submissions?.length??0} label="Посылок" icon={Code2}        g="from-cyan-500   to-sky-500"    delay={0.1}  />
        <StatCard value={contests?.length??0} label="Контестов"   icon={Trophy}       g="from-amber-400  to-orange-500" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">

        {/* Left 2-col */}
        <motion.div
          initial={{opacity:0,y:28}} animate={{opacity:1,y:0}}
          transition={{delay:0.2,duration:0.5,ease:[0.16,1,0.3,1]}}
          className="lg:col-span-2 flex flex-col gap-5"
        >
          {/* Submissions */}
          {panel(
            <>
              {panelHeader(
                <Clock size={14} className="text-[var(--t3)]" />, 'Последние посылки',
                <Link to="/problems"><Button variant="ghost" size="sm" icon={<ArrowRight size={12}/>}>Все задачи</Button></Link>
              )}
              {sl ? (
                <div className="p-5 flex flex-col gap-3">{[1,2,3].map(i=><SkeletonLine key={i} className="w-full h-10"/>)}</div>
              ) : se||!submissions?.length ? (
                <div className="py-14 text-center text-[var(--t3)]">
                  <Code2 size={32} className="mx-auto mb-3 opacity-20"/>
                  <p className="text-sm">Посылок нет. <Link to="/problems" className="text-indigo-400 hover:underline">Реши задачу!</Link></p>
                </div>
              ) : (
                <div className="divide-y" style={{borderColor:'var(--b0)'}}>
                  <AnimatePresence>
                    {submissions.slice(0,8).map((sub,i)=>(
                      <motion.div key={sub.id}
                        initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}}
                        transition={{delay:i*0.04}}
                        className="px-5 py-3.5 flex items-center justify-between transition-colors group"
                        style={{'--hv-bg':'var(--hv)'} as React.CSSProperties}
                        onMouseEnter={e=>(e.currentTarget.style.background='var(--hv)')}
                        onMouseLeave={e=>(e.currentTarget.style.background='')}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <StatusBadge status={sub.status}/>
                          <div className="min-w-0">
                            <p className="text-[13px] font-mono text-[var(--t1)] truncate">{(sub.problem_id??sub.id??'').slice(0,8)}…</p>
                            <p className="text-xs text-[var(--t3)]">{sub.language??'?'} · {fmtDate(sub.created_at)}</p>
                          </div>
                        </div>
                        {sub.time_ms!=null && <span className="text-[11px] text-[var(--t3)] font-mono shrink-0">{sub.time_ms}мс</span>}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}

          {/* Contribution graph */}
          {panel(
            <>
              {panelHeader(
                <Zap size={14} className="text-indigo-400"/>, 'Активность за год',
                <span className="text-[11px] text-[var(--t3)]">{accepted} решено</span>
              )}
              <div className="p-5"><ContribGraph submissions={submissions}/></div>
            </>
          )}
        </motion.div>

        {/* Right column */}
        <motion.div
          initial={{opacity:0,y:28}} animate={{opacity:1,y:0}}
          transition={{delay:0.3,duration:0.5,ease:[0.16,1,0.3,1]}}
          className="flex flex-col gap-4"
        >
          {/* Contests */}
          {panel(
            <>
              {panelHeader(<Trophy size={13} className="text-amber-400"/>, 'Контесты', <Link to="/contests"><Button variant="ghost" size="sm">Все</Button></Link>)}
              <div className="p-4 flex flex-col gap-2">
                {cl ? <SkeletonLine className="w-full h-14"/> :
                 !contests?.length ? <p className="text-[var(--t3)] text-sm text-center py-5">Контестов нет</p> :
                 contests.map(c=>(
                  <Link key={c.id} to={`/contests/${c.slug??c.id}`}>
                    <div className="p-3 rounded-xl transition-all cursor-pointer group"
                      style={{background:'var(--s1)',border:'1px solid var(--b0)'}}
                      onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(129,140,248,0.3)')}
                      onMouseLeave={e=>(e.currentTarget.style.borderColor='var(--b0)')}>
                      <p className="text-[13px] font-medium text-[var(--t1)] group-hover:text-indigo-400 transition-colors truncate">{c.title??'Без названия'}</p>
                      <p className="text-[11px] text-[var(--t3)] mt-0.5 font-mono">
                        {c.starts_at ? new Date(c.starts_at as unknown as string).toLocaleDateString('ru-RU') : '—'}
                      </p>
                    </div>
                  </Link>
                 ))}
              </div>
            </>
          )}

          {/* Quick actions */}
          {panel(
            <>
              {panelHeader(<Zap size={13} className="text-indigo-400"/>, 'Быстрый старт')}
              <div className="p-4 flex flex-col gap-1">
                {[
                  {to:'/problems',  Icon:Code2,   l:'Решить задачу',  c:'text-indigo-400',  bg:'rgba(99,102,241,0.08)'},
                  {to:'/duels',     Icon:Swords,  l:'Начать дуэль',   c:'text-red-400',     bg:'rgba(239,68,68,0.08)'},
                  {to:'/ai-mentor', Icon:Bot,     l:'AI Наставник',   c:'text-cyan-400',    bg:'rgba(6,182,212,0.08)'},
                  {to:'/training',  Icon:TrendingUp,l:'Тренировка',   c:'text-emerald-400', bg:'rgba(16,185,129,0.08)'},
                ].map(({to,Icon,l,c,bg})=>(
                  <Link key={to} to={to}>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl transition-colors group cursor-pointer"
                      onMouseEnter={e=>(e.currentTarget.style.background='var(--hv)')}
                      onMouseLeave={e=>(e.currentTarget.style.background='')}>
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{background:bg}}>
                        <Icon size={13} className={c}/>
                      </div>
                      <span className="text-[13px] text-[var(--t2)] group-hover:text-[var(--t1)] transition-colors flex-1">{l}</span>
                      <ArrowRight size={11} className="text-[var(--t3)] opacity-0 group-hover:opacity-100 transition-opacity"/>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Recommended */}
          {panel(
            <>
              {panelHeader(null,'Рекомендуем')}
              <div className="p-4 flex flex-col gap-1">
                {pl ? <SkeletonLine className="w-full h-10"/> :
                 !problems?.length ? <p className="text-[var(--t3)] text-xs text-center py-3">Нет задач</p> :
                 problems.slice(0,4).map(p=>(
                  <Link key={p.id} to={`/problems/${p.slug??p.id}`}>
                    <div className="flex items-center justify-between p-2 rounded-lg transition-colors group cursor-pointer"
                      onMouseEnter={e=>(e.currentTarget.style.background='var(--hv)')}
                      onMouseLeave={e=>(e.currentTarget.style.background='')}>
                      <p className="text-[13px] text-[var(--t2)] group-hover:text-[var(--t1)] transition-colors truncate flex-1 mr-2">{p.title??'Задача'}</p>
                      <DifficultyBadge difficulty={p.difficulty??'easy'}/>
                    </div>
                  </Link>
                 ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export function Dashboard() { return <ErrBound><Inner/></ErrBound>; }
