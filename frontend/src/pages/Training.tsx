import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Play, CheckCircle, Circle, Trophy,
  ArrowLeft, ArrowRight, Flame, Target, Star,
  ChevronRight, Loader2, Zap, BarChart2,
} from 'lucide-react';
import { trainingApi, problemsApi } from '../api/endpoints';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useThemeStore } from '../store/themeStore';
import { BackgroundGraph } from '../components/BackgroundGraph';
import type { TrainingPlan, ProblemShort } from '../types';

const TOPICS = [
  { id:'Массивы',                       icon:'📊', color:'#3b82f6' },
  { id:'Строки',                        icon:'🔤', color:'#22c55e' },
  { id:'Математика',                    icon:'🔢', color:'#f59e0b' },
  { id:'Ввод/вывод',                    icon:'📥', color:'#06b6d4' },
  { id:'Сортировка',                    icon:'↕️', color:'#f97316' },
  { id:'Поиск',                         icon:'🔍', color:'#ec4899' },
  { id:'Динамическое программирование', icon:'🧩', color:'#a855f7' },
  { id:'Жадные алгоритмы',              icon:'⚡', color:'#ef4444' },
  { id:'Рекурсия',                      icon:'🔄', color:'#6366f1' },
  { id:'Графы',                         icon:'🕸️', color:'#14b8a6' },
  { id:'Деревья',                       icon:'🌳', color:'#10b981' },
  { id:'Брутфорс',                      icon:'💪', color:'#f43f5e' },
];

const DIFFS = [
  { value:'',       label:'Любая',   color:'#818cf8' },
  { value:'easy',   label:'Лёгкая',  color:'#22c55e' },
  { value:'medium', label:'Средняя', color:'#f59e0b' },
  { value:'hard',   label:'Сложная', color:'#ef4444' },
  { value:'expert', label:'Эксперт', color:'#a855f7' },
];

const MODULE_SIZE = 5;

interface PlanItem {
  id: string; plan_id: string; problem_id: string;
  problem?: { id:string; title:string; slug:string; difficulty:string };
  order_num: number;
  status: 'pending'|'in_progress'|'completed'|'skipped';
  completed_at?: string;
}

// ── Module card ────────────────────────────────────────────────────
function ModuleCard({ plan, onOpen, dark }: { plan: TrainingPlan; onOpen: () => void; dark: boolean }) {
  const t1      = dark ? 'rgba(255,255,255,0.9)'  : 'rgba(0,0,0,0.88)';
  const t2      = dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
  const t3      = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.28)';
  const cardBg  = dark ? 'rgba(6,12,28,0.75)'     : 'rgba(255,255,255,0.97)';
  const cardBord= dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';

  const { data: items } = useQuery({ queryKey:['training-items',plan.id], queryFn:()=>trainingApi.items(plan.id) });
  const list = (items??[]) as PlanItem[];
  const total = list.length, done = list.filter(i=>i.status==='completed').length;
  const pct   = total>0 ? Math.round(done/total*100) : 0;
  const isDone= total>0 && done===total;

  return (
    <motion.div whileHover={{y:-3}} transition={{duration:0.18}} onClick={onOpen}
      style={{ background:cardBg, border:`1px solid ${isDone?'rgba(34,197,94,0.35)':cardBord}`, borderRadius:18, overflow:'hidden', position:'relative', backdropFilter:'blur(20px)', cursor:'pointer', transition:'border-color 0.2s, box-shadow 0.2s', boxShadow:dark?'none':'0 3px 16px rgba(0,0,0,0.06)' }}
      onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.boxShadow=dark?`0 0 24px ${isDone?'rgba(34,197,94,0.15)':'rgba(99,102,241,0.15)'}`:  '0 8px 28px rgba(0,0,0,0.1)';}}
      onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.boxShadow=dark?'none':'0 3px 16px rgba(0,0,0,0.06)';}}>
      {/* Progress line at top */}
      <div style={{ height:3, background:'rgba(255,255,255,0.05)' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:isDone?'linear-gradient(90deg,#22c55e,#16a34a)':'linear-gradient(90deg,#6366f1,#06b6d4)', transition:'width 0.5s', borderRadius:3 }}/>
      </div>

      <div style={{ padding:'18px 20px' }}>
        <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,marginBottom:14 }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:42,height:42,borderRadius:12,background:isDone?'rgba(34,197,94,0.15)':'rgba(99,102,241,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20 }}>
              {isDone?'✅':'📚'}
            </div>
            <div>
              <p style={{ fontSize:14,fontWeight:700,color:t1,margin:'0 0 3px' }}>{plan.title}</p>
              <p style={{ fontSize:11,color:t3,margin:0 }}>{formatDistanceToNow(new Date(plan.created_at),{addSuffix:true,locale:ru})}</p>
            </div>
          </div>
          <span style={{ fontSize:11,fontWeight:800,padding:'3px 10px',borderRadius:20,background:isDone?'rgba(34,197,94,0.12)':'rgba(99,102,241,0.12)',color:isDone?'#22c55e':'#818cf8',border:`1px solid ${isDone?'rgba(34,197,94,0.3)':'rgba(99,102,241,0.3)'}`,whiteSpace:'nowrap' }}>
            {isDone?'Готово':` ${done}/${total}`}
          </span>
        </div>

        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ flex:1,marginRight:16 }}>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,color:t3,marginBottom:5 }}>
              <span>Прогресс</span><span style={{ fontFamily:'monospace',fontWeight:700,color:isDone?'#22c55e':'#818cf8' }}>{pct}%</span>
            </div>
            <div style={{ height:5,background:dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)',borderRadius:3,overflow:'hidden' }}>
              <motion.div animate={{width:`${pct}%`}} transition={{duration:0.5}}
                style={{ height:'100%',background:isDone?'linear-gradient(90deg,#22c55e,#16a34a)':'linear-gradient(90deg,#6366f1,#06b6d4)',borderRadius:3 }}/>
            </div>
          </div>
          <span style={{ display:'flex',alignItems:'center',gap:4,fontSize:12,fontWeight:700,color:isDone?'#22c55e':'#818cf8',flexShrink:0 }}>
            {isDone?'Результаты':'Продолжить'} <ChevronRight size={13}/>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Setup screen ──────────────────────────────────────────────────
function SetupScreen({ onStart, onBack, dark, error }: { onStart:(t:string,d:string,c:string)=>void; onBack:()=>void; dark:boolean; error:string|null }) {
  const [topic,  setTopic]  = useState('');
  const [diff,   setDiff]   = useState('');
  const [concern,setConcern]= useState('');

  const t1      = dark ? 'rgba(255,255,255,0.9)'  : 'rgba(0,0,0,0.88)';
  const t2      = dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
  const t3      = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.28)';
  const inputBg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const inputBord=dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const chipBg  = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const chipBord= dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.09)';

  return (
    <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}>
      <button onClick={onBack} style={{ display:'flex',alignItems:'center',gap:6,background:'none',border:'none',color:t2,fontSize:13,cursor:'pointer',marginBottom:24,padding:0,transition:'color 0.15s' }}
        onMouseEnter={e=>e.currentTarget.style.color=t1} onMouseLeave={e=>e.currentTarget.style.color=t2}>
        <ArrowLeft size={15}/> Назад
      </button>

      <h2 style={{ fontSize:24,fontWeight:900,color:t1,margin:'0 0 6px' }}>Новый модуль</h2>
      <p style={{ fontSize:14,color:t2,margin:'0 0 28px' }}>Выбери тему — подберём задачи специально для тебя</p>

      {/* Topics */}
      <div style={{ marginBottom:24 }}>
        <p style={{ fontSize:11,fontWeight:800,color:t3,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12 }}>Тема <span style={{color:'#f87171'}}>*</span></p>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:10 }}>
          {TOPICS.map(tp=>(
            <button key={tp.id} onClick={()=>setTopic(tp.id)}
              style={{ padding:'14px 12px',borderRadius:14,border:`2px solid ${topic===tp.id?tp.color:dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}`,background:topic===tp.id?`${tp.color}14`:chipBg,cursor:'pointer',textAlign:'left',transition:'all 0.15s',display:'flex',alignItems:'center',gap:9 }}>
              <span style={{ fontSize:18 }}>{tp.icon}</span>
              <span style={{ fontSize:12,fontWeight:topic===tp.id?800:500,color:topic===tp.id?tp.color:t2,lineHeight:1.3 }}>{tp.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div style={{ marginBottom:24 }}>
        <p style={{ fontSize:11,fontWeight:800,color:t3,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12 }}>Сложность задач</p>
        <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
          {DIFFS.map(d=>(
            <button key={d.value} onClick={()=>setDiff(d.value)}
              style={{ padding:'8px 16px',borderRadius:24,border:`2px solid ${diff===d.value?d.color:dark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'}`,background:diff===d.value?`${d.color}14`:chipBg,color:diff===d.value?d.color:t2,fontSize:13,fontWeight:diff===d.value?700:500,cursor:'pointer',transition:'all 0.15s' }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Concern textarea */}
      <div style={{ marginBottom:28 }}>
        <p style={{ fontSize:11,fontWeight:800,color:t3,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4 }}>Что вызывает затруднения?</p>
        <p style={{ fontSize:12,color:t3,marginBottom:10 }}>Необязательно — поможет подобрать нужные задачи</p>
        <textarea rows={3} value={concern} onChange={e=>setConcern(e.target.value)}
          placeholder="Например: путаюсь с индексами двумерных массивов..."
          style={{ width:'100%',background:inputBg,border:`1px solid ${inputBord}`,borderRadius:13,color:t1,fontSize:13,padding:'12px 14px',outline:'none',fontFamily:'inherit',resize:'none',boxSizing:'border-box',lineHeight:1.6,transition:'border-color 0.15s' }}
          onFocus={e=>e.target.style.borderColor='rgba(99,102,241,0.5)'} onBlur={e=>e.target.style.borderColor=inputBord}/>
      </div>

      {error && (
        <div style={{ marginBottom:16,padding:'11px 14px',borderRadius:12,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',fontSize:13 }}>
          {error}
        </div>
      )}

      <button onClick={()=>onStart(topic,diff,concern)} disabled={!topic}
        style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:9,padding:'14px',background:topic?'linear-gradient(135deg,#6366f1,#4f46e5)':'rgba(99,102,241,0.08)',boxShadow:topic?'0 0 28px rgba(99,102,241,0.4)':'none',border:'none',borderRadius:14,color:topic?'#fff':'#818cf8',fontSize:15,fontWeight:800,cursor:topic?'pointer':'not-allowed',transition:'all 0.2s' }}>
        <Play size={17}/> Создать модуль ({MODULE_SIZE} задач)
      </button>
    </motion.div>
  );
}

// ── Practice screen ────────────────────────────────────────────────
function PracticeScreen({ planId, onBack, onComplete, dark }: { planId:string; onBack:()=>void; onComplete:()=>void; dark:boolean }) {
  const [activeIdx, setActiveIdx] = useState(0);

  const t1      = dark ? 'rgba(255,255,255,0.9)'  : 'rgba(0,0,0,0.88)';
  const t2      = dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
  const t3      = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.28)';
  const cardBg  = dark ? 'rgba(6,12,28,0.8)'      : 'rgba(255,255,255,0.97)';
  const cardBord= dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const chipBg  = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const chipBord= dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.08)';

  const { data: planData } = useQuery({ queryKey:['training-plan',planId], queryFn:()=>trainingApi.get(planId) });
  const { data: itemsData, isLoading } = useQuery({ queryKey:['training-items',planId], queryFn:()=>trainingApi.items(planId), refetchInterval:5000 });
  const items = (itemsData??[]) as PlanItem[];
  const total = items.length, done = items.filter(i=>i.status==='completed').length;
  const pct   = total>0 ? Math.round(done/total*100) : 0;
  const activeItem = items[activeIdx];

  if (total>0 && done===total) onComplete();

  const DIFF_COLOR: Record<string,string> = { easy:'#22c55e', medium:'#f59e0b', hard:'#ef4444', expert:'#a855f7' };
  const DIFF_LABEL: Record<string,string> = { easy:'Лёгкая', medium:'Средняя', hard:'Сложная', expert:'Эксперт' };

  if (isLoading) return (
    <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
      {[1,2,3].map(i=><div key={i} style={{ height:64,borderRadius:14,background:chipBg }}/>)}
    </div>
  );

  return (
    <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}}>
      {/* Header */}
      <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:18 }}>
        <button onClick={onBack} style={{ width:36,height:36,borderRadius:10,background:chipBg,border:`1px solid ${chipBord}`,color:t2,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'color 0.15s' }}
          onMouseEnter={e=>e.currentTarget.style.color=t1} onMouseLeave={e=>e.currentTarget.style.color=t2}>
          <ArrowLeft size={16}/>
        </button>
        <div style={{ flex:1,minWidth:0 }}>
          <p style={{ fontSize:16,fontWeight:700,color:t1,margin:'0 0 2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{planData?.title}</p>
          <p style={{ fontSize:12,color:t3,margin:0 }}>{done} из {total} задач выполнено</p>
        </div>
        <span style={{ fontSize:18,fontWeight:900,fontFamily:'monospace',color:'#818cf8' }}>{pct}%</span>
      </div>

      {/* Progress bar */}
      <div style={{ height:6,background:dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)',borderRadius:4,overflow:'hidden',marginBottom:22 }}>
        <motion.div animate={{width:`${pct}%`}} transition={{duration:0.5}}
          style={{ height:'100%',background:'linear-gradient(90deg,#6366f1,#06b6d4)',borderRadius:4 }}/>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'260px 1fr',gap:16 }}>
        {/* Task list */}
        <div style={{ background:cardBg,border:`1px solid ${cardBord}`,borderRadius:16,overflow:'hidden',backdropFilter:'blur(20px)' }}>
          <div style={{ padding:'12px 16px',borderBottom:`1px solid ${cardBord}` }}>
            <p style={{ fontSize:10,fontWeight:800,color:t3,textTransform:'uppercase',letterSpacing:'0.1em',margin:0 }}>Задачи модуля</p>
          </div>
          {items.map((item,i)=>{
            const isActive = i===activeIdx, isDone = item.status==='completed';
            const dc = DIFF_COLOR[item.problem?.difficulty??'easy'];
            return (
              <button key={item.id} onClick={()=>setActiveIdx(i)}
                style={{ width:'100%',display:'flex',alignItems:'center',gap:10,padding:'13px 16px',borderBottom:`1px solid ${cardBord}`,borderLeft:`3px solid ${isActive?'#6366f1':'transparent'}`,background:isActive?'rgba(99,102,241,0.08)':'transparent',border:'none',cursor:'pointer',textAlign:'left',transition:'background 0.15s' }}
                onMouseEnter={e=>{if(!isActive)(e.currentTarget as HTMLButtonElement).style.background=dark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)';}}
                onMouseLeave={e=>{if(!isActive)(e.currentTarget as HTMLButtonElement).style.background='transparent';}}>
                {isDone
                  ? <CheckCircle size={18} color="#22c55e" style={{flexShrink:0}}/>
                  : isActive
                  ? <div style={{ width:18,height:18,borderRadius:'50%',border:'2px solid #6366f1',background:'rgba(99,102,241,0.2)',flexShrink:0 }}/>
                  : <Circle size={18} color={t3} style={{flexShrink:0}}/>}
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontSize:13,fontWeight:600,color:isDone?t3:t1,margin:'0 0 2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',textDecoration:isDone?'line-through':undefined }}>
                    {i+1}. {item.problem?.title??'...'}
                  </p>
                  {item.problem?.difficulty && (
                    <span style={{ fontSize:10,fontWeight:700,color:dc }}>{DIFF_LABEL[item.problem.difficulty]??item.problem.difficulty}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active task */}
        {activeItem && (
          <div style={{ background:cardBg,border:`1px solid ${cardBord}`,borderRadius:16,padding:'22px',display:'flex',flexDirection:'column',gap:16,backdropFilter:'blur(20px)' }}>
            {activeItem.status==='completed' ? (
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,gap:12,textAlign:'center',padding:'40px 0' }}>
                <div style={{ width:68,height:68,borderRadius:'50%',background:'rgba(34,197,94,0.12)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <CheckCircle size={34} color="#22c55e"/>
                </div>
                <p style={{ fontSize:17,fontWeight:700,color:t1,margin:0 }}>Задача решена!</p>
                <p style={{ fontSize:13,color:t2,margin:0 }}>{activeItem.problem?.title}</p>
                {activeIdx<items.length-1 && (
                  <button onClick={()=>setActiveIdx(activeIdx+1)}
                    style={{ display:'flex',alignItems:'center',gap:7,padding:'10px 18px',background:'linear-gradient(135deg,#6366f1,#4f46e5)',border:'none',borderRadius:12,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',boxShadow:'0 0 20px rgba(99,102,241,0.3)' }}>
                    <ArrowRight size={14}/> Следующая задача
                  </button>
                )}
              </div>
            ) : (
              <>
                <div>
                  <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:6 }}>
                    <h3 style={{ fontSize:18,fontWeight:800,color:t1,margin:0,flex:1 }}>{activeItem.problem?.title??'...'}</h3>
                    {activeItem.problem?.difficulty && (
                      <span style={{ fontSize:11,fontWeight:800,padding:'3px 10px',borderRadius:20,background:`${DIFF_COLOR[activeItem.problem.difficulty]}14`,color:DIFF_COLOR[activeItem.problem.difficulty],border:`1px solid ${DIFF_COLOR[activeItem.problem.difficulty]}44`,whiteSpace:'nowrap' }}>
                        {DIFF_LABEL[activeItem.problem.difficulty]}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize:12,color:t3,margin:0 }}>Задача {activeIdx+1} из {total}</p>
                </div>

                <div style={{ padding:'14px 16px',borderRadius:13,background:'rgba(99,102,241,0.06)',border:'1px solid rgba(99,102,241,0.2)',fontSize:13,color:t2,lineHeight:1.5 }}>
                  💡 Открой задачу, реши её и вернись — прогресс обновится автоматически
                </div>

                <div style={{ padding:'11px 14px',borderRadius:12,background:dark?'rgba(34,197,94,0.06)':'rgba(34,197,94,0.05)',border:'1px solid rgba(34,197,94,0.2)',fontSize:12,color:'#22c55e',display:'flex',alignItems:'center',gap:8 }}>
                  <CheckCircle size={13}/> Статус обновляется каждые 5 секунд
                </div>

                {activeItem.problem?.slug && (
                  <Link to={`/problems/${activeItem.problem.slug}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none',marginTop:'auto' }}>
                    <button style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'13px',background:'linear-gradient(135deg,#6366f1,#4f46e5)',boxShadow:'0 0 24px rgba(99,102,241,0.35)',border:'none',borderRadius:13,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',transition:'transform 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'}
                      onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                      <Play size={15}/> Открыть задачу
                    </button>
                  </Link>
                )}

                <div style={{ display:'flex',justifyContent:'space-between',paddingTop:12,borderTop:`1px solid ${cardBord}` }}>
                  <button onClick={()=>setActiveIdx(Math.max(0,activeIdx-1))} disabled={activeIdx===0}
                    style={{ display:'flex',alignItems:'center',gap:5,fontSize:13,color:activeIdx===0?t3:t2,background:'none',border:'none',cursor:activeIdx===0?'not-allowed':'pointer',opacity:activeIdx===0?0.35:1,transition:'color 0.15s' }}
                    onMouseEnter={e=>{if(activeIdx>0)e.currentTarget.style.color=t1;}}
                    onMouseLeave={e=>{if(activeIdx>0)e.currentTarget.style.color=t2;}}>
                    <ArrowLeft size={14}/> Предыдущая
                  </button>
                  <button onClick={()=>setActiveIdx(Math.min(items.length-1,activeIdx+1))} disabled={activeIdx===items.length-1}
                    style={{ display:'flex',alignItems:'center',gap:5,fontSize:13,color:activeIdx===items.length-1?t3:t2,background:'none',border:'none',cursor:activeIdx===items.length-1?'not-allowed':'pointer',opacity:activeIdx===items.length-1?0.35:1,transition:'color 0.15s' }}
                    onMouseEnter={e=>{if(activeIdx<items.length-1)e.currentTarget.style.color=t1;}}
                    onMouseLeave={e=>{if(activeIdx<items.length-1)e.currentTarget.style.color=t2;}}>
                    Следующая <ArrowRight size={14}/>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Complete screen ────────────────────────────────────────────────
function CompleteScreen({ plan, onNewModule, onBack }: { plan: TrainingPlan|null; onNewModule:()=>void; onBack:()=>void }) {
  const { data: items } = useQuery({ queryKey:['training-items',plan?.id], queryFn:()=>trainingApi.items(plan!.id), enabled:!!plan });
  const list = (items??[]) as PlanItem[];
  const completed = list.filter(i=>i.status==='completed');
  const stars = Math.min(5, Math.round(completed.length/list.length*5));

  return (
    <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
      style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 0',textAlign:'center' }}>
      <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',bounce:0.5,delay:0.1}}
        style={{ width:110,height:110,borderRadius:'50%',background:'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(251,191,36,0.1))',border:'2px solid rgba(245,158,11,0.4)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:24,boxShadow:'0 0 60px rgba(245,158,11,0.2)' }}>
        <Trophy size={52} color="#f59e0b"/>
      </motion.div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}}>
        <h2 style={{ fontSize:32,fontWeight:900,background:'linear-gradient(90deg,#f59e0b,#fbbf24)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',margin:'0 0 8px' }}>Модуль завершён! 🎉</h2>
        <p style={{ fontSize:16,color:'rgba(255,255,255,0.45)',margin:'0 0 6px' }}>{plan?.title}</p>
        <p style={{ fontSize:14,color:'rgba(255,255,255,0.35)',margin:'0 0 28px' }}>
          Ты решил {completed.length} из {list.length} задач. Отличная работа!
        </p>

        <div style={{ display:'flex',justifyContent:'center',gap:8,marginBottom:32 }}>
          {Array(5).fill(0).map((_,i)=>(
            <motion.div key={i} initial={{scale:0}} animate={{scale:1}} transition={{delay:0.5+i*0.1}}>
              <Star size={30} color={i<stars?'#f59e0b':'rgba(255,255,255,0.1)'} style={{ fill:i<stars?'#f59e0b':'transparent' }}/>
            </motion.div>
          ))}
        </div>

        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:10 }}>
          <button onClick={onNewModule}
            style={{ display:'flex',alignItems:'center',gap:8,padding:'13px 28px',background:'linear-gradient(135deg,#f59e0b,#d97706)',boxShadow:'0 0 30px rgba(245,158,11,0.4)',border:'none',borderRadius:14,color:'#fff',fontSize:15,fontWeight:800,cursor:'pointer',transition:'transform 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
            <Flame size={17}/> Начать новый модуль
          </button>
          <button onClick={onBack}
            style={{ display:'flex',alignItems:'center',gap:7,padding:'11px 22px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:13,color:'rgba(255,255,255,0.7)',fontSize:14,fontWeight:600,cursor:'pointer' }}>
            <ArrowLeft size={14}/> Мои тренировки
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export function Training() {
  const { theme } = useThemeStore();
  const dark      = theme === 'dark';
  const qc        = useQueryClient();
  const [mode, setMode] = useState<'home'|'setup'|'practice'|'complete'>('home');
  const [activePlanId, setActivePlanId] = useState<string|null>(null);
  const [creating, setCreating]         = useState(false);
  const [noProblemsError, setNoProbErr] = useState<string|null>(null);

  const pageBg  = dark ? '#04080f'                : '#f1f5f9';
  const t1      = dark ? 'rgba(255,255,255,0.9)'  : 'rgba(0,0,0,0.88)';
  const t2      = dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
  const t3      = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.28)';
  const cardBg  = dark ? 'rgba(6,12,28,0.72)'     : 'rgba(255,255,255,0.97)';
  const cardBord= dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const chipBg  = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const chipBord= dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.09)';

  const { data: plans, isLoading } = useQuery({ queryKey:['training-plans'], queryFn:trainingApi.list });
  const activePlan = activePlanId ? (plans as TrainingPlan[]??[]).find(p=>p.id===activePlanId)??null : null;

  const handleStart = async (topic:string, difficulty:string, concern:string) => {
    setCreating(true); setNoProbErr(null);
    try {
      const params: Record<string,string|number> = { limit:MODULE_SIZE*3, topic };
      if (difficulty) params.difficulty = difficulty;
      const all = await problemsApi.list(params as Parameters<typeof problemsApi.list>[0]);
      const problems = all as ProblemShort[];
      if (!problems.length) { setNoProbErr(`По теме "${topic}" задач пока нет.`); return; }
      const desc = concern.trim() ? `${topic} · ${concern.trim().slice(0,100)}` : topic;
      const plan = await trainingApi.create({ title:`${topic} — Модуль`, description:desc });
      const shuffled = [...problems].sort(()=>Math.random()-0.5).slice(0,MODULE_SIZE);
      for (let i=0;i<shuffled.length;i++) await trainingApi.addItem({ plan_id:plan.id, problem_id:shuffled[i].id, order_num:i });
      await qc.invalidateQueries({ queryKey:['training-plans'] });
      setActivePlanId(plan.id); setMode('practice');
    } catch(e) { console.error(e); } finally { setCreating(false); }
  };

  const completedCount = (plans as TrainingPlan[]??[]).length;

  return (
    <div style={{ position:'relative', minHeight:'calc(100vh - 56px)', background:pageBg }}>
      <BackgroundGraph noSphere light={!dark}/>

      <div style={{ position:'relative', zIndex:1, maxWidth:1100, margin:'0 auto', padding:'36px 36px 60px' }}>

        {mode==='home' && (
          <>
            {/* Header */}
            <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} transition={{duration:0.4}}
              style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16,marginBottom:28 }}>
              <div>
                <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:6 }}>
                  <div style={{ width:44,height:44,borderRadius:13,background:'rgba(34,197,94,0.15)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                    <BookOpen size={22} color="#22c55e"/>
                  </div>
                  <h1 style={{ fontSize:32,fontWeight:900,color:t1,margin:0,letterSpacing:'-0.02em' }}>Тренировки</h1>
                </div>
                <p style={{ fontSize:14,color:t2,margin:0,paddingLeft:56 }}>Выбери тему — подберём задачи специально для тебя</p>
              </div>
              <button onClick={()=>setMode('setup')}
                style={{ display:'flex',alignItems:'center',gap:8,padding:'11px 20px',background:'linear-gradient(135deg,#22c55e,#16a34a)',boxShadow:'0 0 24px rgba(34,197,94,0.35)',border:'none',borderRadius:13,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',transition:'transform 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                <Target size={16}/> Начать тренировку
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.07,duration:0.4}}
              style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:28 }}>
              {[
                {label:'Модулей создано', val:completedCount,icon:BookOpen,color:'#22c55e'},
                {label:'В процессе',val:(plans as TrainingPlan[]??[]).filter(p=>{const items=(p as {items?:PlanItem[]}).items;return items?items.some(i=>i.status!=='completed'):false}).length,icon:Zap,color:'#f59e0b'},
                {label:'Завершено',val:0,icon:BarChart2,color:'#818cf8'},
              ].map(s=>(
                <div key={s.label} style={{ background:cardBg,border:`1px solid ${cardBord}`,borderRadius:16,padding:'16px 18px',backdropFilter:'blur(20px)',display:'flex',alignItems:'center',gap:12,boxShadow:dark?'none':'0 2px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ width:38,height:38,borderRadius:11,background:`${s.color}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><s.icon size={18} color={s.color}/></div>
                  <div>
                    <p style={{ fontSize:22,fontWeight:900,fontFamily:'monospace',color:s.color,margin:0,lineHeight:1 }}>{s.val}</p>
                    <p style={{ fontSize:11,color:t3,margin:'3px 0 0' }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Quick start */}
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.12,duration:0.4}}>
              <p style={{ fontSize:11,fontWeight:800,color:t3,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:14 }}>Быстрый старт по теме</p>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:10,marginBottom:28 }}>
                {TOPICS.slice(0,8).map((tp,i)=>(
                  <motion.button key={tp.id} whileHover={{scale:1.04}} whileTap={{scale:0.97}}
                    onClick={()=>handleStart(tp.id,'','')} disabled={creating}
                    style={{ padding:'16px 12px',borderRadius:15,border:`1px solid ${tp.color}22`,background:`${tp.color}0a`,cursor:'pointer',textAlign:'left',display:'flex',flexDirection:'column',gap:8,transition:'border-color 0.2s, box-shadow 0.2s' }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=`${tp.color}55`;(e.currentTarget as HTMLButtonElement).style.boxShadow=`0 0 16px ${tp.color}22`;}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=`${tp.color}22`;(e.currentTarget as HTMLButtonElement).style.boxShadow='none';}}>
                    <span style={{ fontSize:22 }}>{tp.icon}</span>
                    <span style={{ fontSize:12,fontWeight:700,color:t1,lineHeight:1.3 }}>{tp.id}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* My modules */}
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.18,duration:0.4}}>
              <p style={{ fontSize:11,fontWeight:800,color:t3,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:14 }}>Мои модули</p>
              {isLoading ? (
                <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14 }}>
                  {[1,2].map(i=><div key={i} style={{ height:120,borderRadius:18,background:chipBg,border:`1px solid ${chipBord}` }}/>)}
                </div>
              ) : (plans as TrainingPlan[]??[]).length===0 ? (
                <div style={{ padding:'40px',textAlign:'center',border:`1px dashed ${chipBord}`,borderRadius:18 }}>
                  <BookOpen size={40} style={{ color:t3,opacity:0.3,margin:'0 auto 12px' }}/>
                  <p style={{ fontSize:13,color:t2,margin:0 }}>Ещё нет модулей — начни первую тренировку</p>
                </div>
              ) : (
                <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14 }}>
                  {(plans as TrainingPlan[]).map(p=>(
                    <ModuleCard key={p.id} plan={p} onOpen={()=>{setActivePlanId(p.id);setMode('practice');}} dark={dark}/>
                  ))}
                </div>
              )}
            </motion.div>

            {noProblemsError && (
              <div style={{ marginTop:16,padding:'11px 14px',borderRadius:12,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',fontSize:13 }}>
                {noProblemsError}
              </div>
            )}
          </>
        )}

        <AnimatePresence mode="wait">
          {mode==='setup' && (
            <motion.div key="setup">
              <SetupScreen onStart={handleStart} onBack={()=>{setMode('home');setNoProbErr(null);}} dark={dark} error={noProblemsError}/>
            </motion.div>
          )}
          {mode==='practice' && activePlanId && (
            <motion.div key="practice">
              <PracticeScreen planId={activePlanId} onBack={()=>setMode('home')} onComplete={()=>setMode('complete')} dark={dark}/>
            </motion.div>
          )}
          {mode==='complete' && (
            <motion.div key="complete">
              <CompleteScreen plan={activePlan} onNewModule={()=>{setActivePlanId(null);setMode('setup');}} onBack={()=>setMode('home')}/>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Creating overlay */}
      {creating && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50 }}>
          <div style={{ background:dark?'rgba(6,12,28,0.95)':'rgba(255,255,255,0.98)',border:`1px solid ${dark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'}`,borderRadius:20,padding:'36px 44px',display:'flex',flexDirection:'column',alignItems:'center',gap:16,boxShadow:'0 40px 120px rgba(0,0,0,0.4)' }}>
            <div style={{ width:56,height:56,borderRadius:16,background:'rgba(99,102,241,0.15)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Loader2 size={28} color="#818cf8" style={{ animation:'spin 1s linear infinite' }}/>
            </div>
            <p style={{ fontSize:16,fontWeight:700,color:t1,margin:0 }}>Создаём модуль...</p>
            <p style={{ fontSize:13,color:t2,margin:0 }}>Подбираем задачи по теме</p>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
