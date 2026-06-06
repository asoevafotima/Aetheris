import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords, Plus, Clock, X, Check, Search, Send,
  Crown, Minus, Zap, Shield, Timer, ChevronRight,
} from 'lucide-react';
import { duelsApi, usersApi } from '../api/endpoints';
import { formatDistanceToNow, differenceInSeconds } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuthStore }  from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { BackgroundGraph } from '../components/BackgroundGraph';
import type { Duel, User } from '../types';

// ── difficulty config ──────────────────────────────────────────────
const DIFFS = [
  { value:'easy',   label:'Лёгкая',  color:'#22c55e', bg:'rgba(34,197,94,0.12)',  border:'rgba(34,197,94,0.3)',  time:15, icon:'🌱' },
  { value:'medium', label:'Средняя', color:'#f59e0b', bg:'rgba(245,158,11,0.12)', border:'rgba(245,158,11,0.3)', time:25, icon:'⚡' },
  { value:'hard',   label:'Сложная', color:'#ef4444', bg:'rgba(239,68,68,0.12)',  border:'rgba(239,68,68,0.3)',  time:40, icon:'🔥' },
  { value:'expert', label:'Эксперт', color:'#a855f7', bg:'rgba(168,85,247,0.12)', border:'rgba(168,85,247,0.3)', time:60, icon:'💀' },
];

// ── status config ──────────────────────────────────────────────────
const STATUS_CFG: Record<string,{label:string;color:string;bg:string;border:string}> = {
  active:    { label:'Идёт',      color:'#22c55e', bg:'rgba(34,197,94,0.12)',   border:'rgba(34,197,94,0.3)'   },
  pending:   { label:'Ожидание',  color:'#06b6d4', bg:'rgba(6,182,212,0.12)',   border:'rgba(6,182,212,0.3)'   },
  finished:  { label:'Завершена', color:'#64748b', bg:'rgba(100,116,139,0.1)',  border:'rgba(100,116,139,0.2)' },
  cancelled: { label:'Отменена',  color:'#64748b', bg:'rgba(100,116,139,0.1)',  border:'rgba(100,116,139,0.2)' },
};

// ── timer ──────────────────────────────────────────────────────────
function DuelTimer({ startedAt, limitMin, dark }: { startedAt: string; limitMin: number; dark: boolean }) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    const calc = () => { const el = differenceInSeconds(new Date(), new Date(startedAt+'Z')); setLeft(Math.max(0, limitMin*60 - el)); };
    calc(); const id = setInterval(calc, 1000); return () => clearInterval(id);
  }, [startedAt, limitMin]);
  const m = Math.floor(left / 60), s = left % 60;
  const urgent = left < 120;
  return (
    <span style={{ fontFamily:'monospace', fontSize:15, fontWeight:900, letterSpacing:'0.05em', color: urgent ? '#ef4444' : '#22c55e', animation: urgent ? 'pulse 1s ease-in-out infinite' : 'none', display:'flex',alignItems:'center',gap:5 }}>
      <Timer size={13} /> {String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
    </span>
  );
}

// ── duel card ──────────────────────────────────────────────────────
function DuelCard({ duel, dark }: { duel: Duel; dark: boolean }) {
  const { user } = useAuthStore();
  const isChallenger = duel.challenger_id === user?.id;
  const myName  = isChallenger ? duel.challenger_username : duel.opponent_username;
  const oppName = isChallenger ? duel.opponent_username   : duel.challenger_username;
  const diff    = DIFFS.find(d => d.value === duel.difficulty) ?? DIFFS[0];
  const sCfg    = STATUS_CFG[duel.status] ?? STATUS_CFG.pending;

  const t1      = dark ? 'rgba(255,255,255,0.9)'  : 'rgba(0,0,0,0.88)';
  const t2      = dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
  const t3      = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.28)';
  const cardBg  = dark ? 'rgba(6,12,28,0.78)'     : 'rgba(255,255,255,0.97)';
  const cardBord= dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const chipBg  = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const chipBord= dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.08)';

  // result
  const result = duel.status === 'finished' && duel.result
    ? duel.result === 'draw' ? 'draw'
      : (isChallenger && duel.result==='challenger_win') || (!isChallenger && duel.result==='opponent_win') ? 'win' : 'loss'
    : null;

  const resultCfg = result === 'win'  ? { label:'Победа',  color:'#f59e0b', bg:'rgba(245,158,11,0.12)', icon: Crown }
                  : result === 'loss' ? { label:'Поражение',color:'#ef4444', bg:'rgba(239,68,68,0.12)',  icon: X     }
                  : result === 'draw' ? { label:'Ничья',    color:'#64748b', bg:'rgba(100,116,139,0.1)', icon: Minus }
                  : null;

  return (
    <Link to={`/duels/${duel.id}`} style={{ textDecoration:'none' }}>
      <motion.div
        whileHover={{ y:-4 }} transition={{ duration:0.18 }}
        style={{
          background:cardBg, border:`1px solid ${duel.status==='active'?'rgba(34,197,94,0.3)':cardBord}`,
          borderRadius:18, overflow:'hidden', position:'relative',
          backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
          boxShadow: dark ? (duel.status==='active'?'0 0 30px rgba(34,197,94,0.15)':'none') : '0 4px 20px rgba(0,0,0,0.06)',
          cursor:'pointer', transition:'border-color 0.2s, box-shadow 0.2s, transform 0.18s',
        }}
      >
        {/* Top accent line */}
        <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${diff.color},transparent)`,opacity:duel.status==='finished'?0.25:0.8 }} />

        <div style={{ padding:'18px 18px 14px' }}>
          {/* Header row */}
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14 }}>
            <span style={{ fontSize:11,fontWeight:800,padding:'3px 10px',borderRadius:20,background:diff.bg,color:diff.color,border:`1px solid ${diff.border}` }}>
              {diff.icon} {diff.label}
            </span>
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              {duel.status==='active' && duel.started_at && <DuelTimer startedAt={duel.started_at} limitMin={duel.time_limit_minutes} dark={dark} />}
              {duel.status!=='active' && (
                <span style={{ fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,background:sCfg.bg,color:sCfg.color,border:`1px solid ${sCfg.border}` }}>
                  {sCfg.label}
                </span>
              )}
              {resultCfg && (
                <span style={{ fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,background:resultCfg.bg,color:resultCfg.color,border:`1px solid ${resultCfg.color}44`,display:'flex',alignItems:'center',gap:4 }}>
                  <resultCfg.icon size={10}/> {resultCfg.label}
                </span>
              )}
            </div>
          </div>

          {/* VS players */}
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,marginBottom:12,padding:'14px 16px',background:chipBg,border:`1px solid ${chipBord}`,borderRadius:14 }}>
            <div style={{ textAlign:'center',flex:1,minWidth:0 }}>
              <div style={{ width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:900,color:'#fff',margin:'0 auto 6px' }}>
                {(myName??'?')[0]?.toUpperCase()}
              </div>
              <p style={{ fontSize:12,fontWeight:700,color:'#818cf8',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{myName??'Вы'}</p>
              {duel.status==='finished' && <p style={{ fontSize:11,fontFamily:'monospace',color:t3,margin:'2px 0 0' }}>{duel.challenger_score?.toFixed(0)}%</p>}
            </div>

            <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:2,flexShrink:0 }}>
              <Swords size={18} color={dark?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.15)'} />
              <span style={{ fontSize:9,fontWeight:900,color:t3,letterSpacing:'0.12em' }}>VS</span>
            </div>

            <div style={{ textAlign:'center',flex:1,minWidth:0 }}>
              <div style={{ width:36,height:36,borderRadius:'50%',background: oppName ? 'linear-gradient(135deg,#ef4444,#dc2626)' : chipBg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:900,color:'#fff',margin:'0 auto 6px',border:`1px solid ${chipBord}` }}>
                {oppName ? (oppName[0]?.toUpperCase()) : '?'}
              </div>
              <p style={{ fontSize:12,fontWeight:700,color:oppName?'#f87171':t3,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{oppName??'Ожидание...'}</p>
              {duel.status==='finished' && <p style={{ fontSize:11,fontFamily:'monospace',color:t3,margin:'2px 0 0' }}>{duel.opponent_score?.toFixed(0)}%</p>}
            </div>
          </div>

          {/* Problem title */}
          {duel.problem_title && (
            <p style={{ fontSize:12,color:t2,margin:'0 0 10px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:5 }}>
              <span style={{ color:t3 }}>📝</span> {duel.problem_title}
            </p>
          )}

          {/* Footer */}
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <span style={{ display:'flex',alignItems:'center',gap:5,fontSize:11,color:t3 }}>
              <Clock size={11} /> {formatDistanceToNow(new Date(duel.created_at), { addSuffix:true, locale:ru })}
            </span>
            <ChevronRight size={15} color={t3} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ── invite panel ──────────────────────────────────────────────────
function InvitePanel({ duelId, onDone, dark }: { duelId: string; onDone: () => void; dark: boolean }) {
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState<User | null>(null);
  const qc = useQueryClient();

  const t1 = dark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.88)';
  const t2 = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
  const t3 = dark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.32)';
  const inputBg  = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const inputBord= dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';

  const { data: results } = useQuery({
    queryKey: ['users-search', search],
    queryFn: () => usersApi.search(search),
    enabled: search.length >= 2,
  });

  const inviteMut = useMutation({
    mutationFn: () => duelsApi.invite({ duel_id: duelId, to_user_id: selected!.id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['duels'] }); onDone(); },
  });

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
      <p style={{ fontSize:13,color:t2,margin:0 }}>Найди соперника по нику:</p>
      <div style={{ position:'relative' }}>
        <Search size={14} style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:t3 }} />
        <input placeholder="Никнейм..."
          value={search} onChange={e=>{setSearch(e.target.value);setSelected(null);}}
          style={{ width:'100%',paddingLeft:34,paddingRight:12,paddingTop:10,paddingBottom:10,background:inputBg,border:`1px solid ${inputBord}`,borderRadius:11,color:t1,fontSize:13,outline:'none',fontFamily:'inherit',boxSizing:'border-box' }} />
      </div>
      {results && (results as User[]).length>0 && !selected && (
        <div style={{ border:`1px solid ${inputBord}`,borderRadius:11,overflow:'hidden' }}>
          {(results as User[]).map(u=>(
            <button key={u.id} onClick={()=>setSelected(u)}
              style={{ width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'none',border:'none',cursor:'pointer',textAlign:'left',borderBottom:`1px solid ${inputBord}`,transition:'background 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.background=dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)'}
              onMouseLeave={e=>e.currentTarget.style.background='none'}>
              <div style={{ width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:900,color:'#fff' }}>
                {u.username[0].toUpperCase()}
              </div>
              <span style={{ fontSize:13,color:t1 }}>{u.username}</span>
            </button>
          ))}
        </div>
      )}
      {selected && (
        <div style={{ display:'flex',alignItems:'center',gap:10,padding:'11px 14px',borderRadius:11,background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.3)' }}>
          <div style={{ width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:900,color:'#fff' }}>
            {selected.username[0].toUpperCase()}
          </div>
          <span style={{ fontSize:13,fontWeight:700,color:'#818cf8',flex:1 }}>{selected.username}</span>
          <button onClick={()=>setSelected(null)} style={{ background:'none',border:'none',color:t3,cursor:'pointer' }}><X size={14}/></button>
        </div>
      )}
      <button onClick={()=>inviteMut.mutate()} disabled={!selected||inviteMut.isPending}
        style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'11px 16px',background:selected?'linear-gradient(135deg,#6366f1,#4f46e5)':'rgba(255,255,255,0.05)',border:`1px solid ${selected?'transparent':'rgba(255,255,255,0.1)'}`,borderRadius:12,color:selected?'#fff':t3,fontSize:13,fontWeight:700,cursor:selected?'pointer':'not-allowed',boxShadow:selected?'0 0 20px rgba(99,102,241,0.4)':'none',transition:'all 0.15s' }}>
        <Send size={14}/> {inviteMut.isPending?'Отправка...':'Отправить приглашение'}
      </button>
    </div>
  );
}

// ── create modal ──────────────────────────────────────────────────
function CreateModal({ onClose, dark }: { onClose: () => void; dark: boolean }) {
  const qc = useQueryClient();
  const [diff, setDiff] = useState('easy');
  const [createdDuel, setCreatedDuel] = useState<Duel | null>(null);

  const t1 = dark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.88)';
  const t2 = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
  const t3 = dark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.32)';
  const modalBg  = dark ? 'rgba(4,8,20,0.98)'     : 'rgba(255,255,255,0.99)';
  const modalBord= dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.1)';
  const chipBg   = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

  const createMut = useMutation({
    mutationFn: () => duelsApi.create({ difficulty: diff }),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['duels'] }); setCreatedDuel(d); },
  });

  const chosen = DIFFS.find(d => d.value === diff)!;

  return (
    <div style={{ position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        onClick={onClose} style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(8px)' }} />
      <motion.div
        initial={{opacity:0,scale:0.93,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.93,y:20}}
        style={{ position:'relative',width:'100%',maxWidth:460,background:modalBg,border:`1px solid ${modalBord}`,borderRadius:22,overflow:'hidden',boxShadow:'0 40px 120px rgba(0,0,0,0.4)' }}
      >
        {/* Header */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px',borderBottom:`1px solid ${modalBord}` }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ width:38,height:38,borderRadius:11,background:'rgba(239,68,68,0.15)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Swords size={18} color="#f87171" />
            </div>
            <div>
              <p style={{ fontSize:16,fontWeight:800,color:t1,margin:0 }}>{createdDuel?'Пригласи соперника':'Создать дуэль'}</p>
              <p style={{ fontSize:12,color:t3,margin:0 }}>1 на 1 — кто быстрее решит</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32,height:32,borderRadius:9,background:'none',border:`1px solid ${modalBord}`,color:t2,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <X size={15}/>
          </button>
        </div>

        <div style={{ padding:'22px 24px',display:'flex',flexDirection:'column',gap:18 }}>
          {!createdDuel ? (
            <>
              <p style={{ fontSize:13,color:t2,margin:0 }}>Выбери сложность — задача подберётся автоматически:</p>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                {DIFFS.map(d=>(
                  <button key={d.value} onClick={()=>setDiff(d.value)}
                    style={{ padding:'16px 14px',borderRadius:14,border:`2px solid ${diff===d.value?d.color:dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}`,background:diff===d.value?d.bg:chipBg,cursor:'pointer',textAlign:'left',transition:'all 0.15s' }}>
                    <p style={{ fontSize:22,margin:'0 0 6px' }}>{d.icon}</p>
                    <p style={{ fontSize:14,fontWeight:800,color:diff===d.value?d.color:t1,margin:'0 0 3px' }}>{d.label}</p>
                    <p style={{ fontSize:11,color:t3,margin:0,fontFamily:'monospace' }}>{d.time} минут</p>
                  </button>
                ))}
              </div>
              <div style={{ padding:'12px 14px',borderRadius:12,background:chipBg,border:`1px solid ${dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}`,fontSize:12,color:t2 }}>
                ⏱ Лимит: <span style={{ fontWeight:800,color:chosen.color }}>{chosen.time} мин</span> · Задача выбирается случайно
              </div>
              <button onClick={()=>createMut.mutate()} disabled={createMut.isPending}
                style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'13px 20px',background:'linear-gradient(135deg,#ef4444,#dc2626)',boxShadow:'0 0 28px rgba(239,68,68,0.4)',border:'none',borderRadius:13,color:'#fff',fontSize:14,fontWeight:800,cursor:'pointer',transition:'transform 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                <Swords size={16}/> {createMut.isPending?'Создание...':'Начать дуэль!'}
              </button>
            </>
          ) : (
            <>
              <div style={{ padding:'12px 14px',borderRadius:12,background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',fontSize:13,color:'#22c55e',display:'flex',alignItems:'center',gap:8 }}>
                <Shield size={15}/> Дуэль создана! Задача: <strong>{createdDuel.problem_title??'—'}</strong>
              </div>
              <InvitePanel duelId={createdDuel.id} onDone={onClose} dark={dark} />
              <button onClick={onClose} style={{ fontSize:12,color:t3,background:'none',border:'none',cursor:'pointer',textAlign:'center' }}>
                Пригласить позже
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── incoming invites ──────────────────────────────────────────────
function IncomingInvites({ dark }: { dark: boolean }) {
  const qc = useQueryClient();
  const t1 = dark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.88)';
  const t3 = dark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.32)';

  const { data: invites } = useQuery({
    queryKey: ['duel-invitations'],
    queryFn: duelsApi.invitations,
    refetchInterval: 15_000,
  });

  const acceptMut  = useMutation({ mutationFn:(id:string)=>duelsApi.acceptInvite(id),  onSuccess:()=>qc.invalidateQueries({queryKey:['duels','duel-invitations']}) });
  const declineMut = useMutation({ mutationFn:(id:string)=>duelsApi.declineInvite(id), onSuccess:()=>qc.invalidateQueries({queryKey:['duel-invitations']}) });

  const list = (invites??[]) as {id:string;from_user:User;duel:Duel}[];
  if (!list.length) return null;

  return (
    <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} style={{ marginBottom:24 }}>
      <p style={{ fontSize:11,fontWeight:800,color:'#06b6d4',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10 }}>
        Входящие приглашения · {list.length}
      </p>
      <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
        {list.map(inv=>{
          const diff = DIFFS.find(d=>d.value===inv.duel?.difficulty)??DIFFS[0];
          return (
            <motion.div key={inv.id} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}}
              style={{ display:'flex',alignItems:'center',gap:12,padding:'14px 16px',borderRadius:14,background:'rgba(6,182,212,0.08)',border:'1px solid rgba(6,182,212,0.25)',backdropFilter:'blur(12px)' }}>
              <div style={{ width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#0891b2,#06b6d4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:900,color:'#fff',flexShrink:0 }}>
                {(inv.from_user?.username??'?')[0].toUpperCase()}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <p style={{ fontSize:14,fontWeight:700,color:t1,margin:'0 0 3px' }}>
                  <span style={{ color:'#22d3ee' }}>{inv.from_user?.username??'...'}</span> вызывает на дуэль
                </p>
                <p style={{ fontSize:11,color:t3,margin:0 }}>
                  <span style={{ color:diff.color,fontWeight:700 }}>{diff.icon} {diff.label}</span> · {inv.duel?.time_limit_minutes} мин
                </p>
              </div>
              <div style={{ display:'flex',gap:8,flexShrink:0 }}>
                <button onClick={()=>declineMut.mutate(inv.id)}
                  style={{ width:34,height:34,borderRadius:9,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'background 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.2)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(239,68,68,0.1)'}>
                  <X size={14}/>
                </button>
                <button onClick={()=>acceptMut.mutate(inv.id)}
                  style={{ width:34,height:34,borderRadius:9,background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.35)',color:'#22c55e',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'background 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(34,197,94,0.28)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(34,197,94,0.15)'}>
                  <Check size={14}/>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── main ──────────────────────────────────────────────────────────
export function Duels() {
  const { user }  = useAuthStore();
  const { theme } = useThemeStore();
  const dark      = theme === 'dark';
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<'open'|'mine'>('open');

  const pageBg  = dark ? '#04080f'                : '#f1f5f9';
  const t1      = dark ? 'rgba(255,255,255,0.9)'  : 'rgba(0,0,0,0.88)';
  const t2      = dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
  const t3      = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.28)';
  const cardBg  = dark ? 'rgba(6,12,28,0.7)'      : 'rgba(255,255,255,0.97)';
  const cardBord= dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const chipBg  = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const chipBord= dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.09)';

  const { data: activeDuels, isLoading: activeLoading } = useQuery({
    queryKey: ['duels','active'], queryFn: ()=>duelsApi.listActive(0,20), refetchInterval:15_000,
  });
  const { data: myDuels, isLoading: myLoading } = useQuery({
    queryKey: ['duels','mine'], queryFn: ()=>duelsApi.mine(0,20), refetchInterval:15_000,
  });

  const displayDuels = ((tab==='open' ? activeDuels : myDuels) as Duel[] ?? []);
  const isLoading    = tab==='open' ? activeLoading : myLoading;

  const activeCount  = (activeDuels as Duel[]??[]).filter(d=>d.status==='active').length;
  const myWins       = (myDuels as Duel[]??[]).filter(d=>{ const ic=d.challenger_id===user?.id; return d.status==='finished'&&((ic&&d.result==='challenger_win')||(!ic&&d.result==='opponent_win')); }).length;

  return (
    <div style={{ position:'relative',minHeight:'calc(100vh - 56px)',background:pageBg }}>
      <BackgroundGraph noSphere light={!dark} />

      <div style={{ position:'relative',zIndex:1,maxWidth:1200,margin:'0 auto',padding:'36px 36px 60px' }}>

        {/* Header */}
        <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} transition={{duration:0.4}}
          style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16,marginBottom:28 }}>
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:6 }}>
              <div style={{ width:44,height:44,borderRadius:13,background:'rgba(239,68,68,0.15)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Swords size={22} color="#f87171" />
              </div>
              <h1 style={{ fontSize:32,fontWeight:900,color:t1,margin:0,letterSpacing:'-0.02em' }}>Дуэли</h1>
            </div>
            <p style={{ fontSize:14,color:t2,margin:0,paddingLeft:56 }}>1 на 1 — кто быстрее решит задачу</p>
          </div>
          {user && (
            <button onClick={()=>setShowCreate(true)}
              style={{ display:'flex',alignItems:'center',gap:8,padding:'11px 20px',background:'linear-gradient(135deg,#ef4444,#dc2626)',boxShadow:'0 0 24px rgba(239,68,68,0.35)',border:'none',borderRadius:13,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',transition:'transform 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
              <Plus size={16}/> Создать дуэль
            </button>
          )}
        </motion.div>

        {/* Stats strip */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.07,duration:0.4}}
          style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:28 }}>
          {[
            {label:'Всего моих',  val:(myDuels as Duel[]??[]).length,          icon:Swords, color:'#f87171' },
            {label:'Активных',    val:activeCount,                              icon:Zap,    color:'#22c55e' },
            {label:'Побед',       val:myWins,                                   icon:Crown,  color:'#f59e0b' },
            {label:'В очереди',   val:(myDuels as Duel[]??[]).filter(d=>d.status==='pending').length, icon:Timer, color:'#06b6d4' },
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

        {/* Incoming invites */}
        {user && <IncomingInvites dark={dark} />}

        {/* Tabs */}
        <div style={{ display:'flex',gap:6,marginBottom:24 }}>
          {([['open','⚔️ Открытые','#f87171'],['mine','📋 Мои дуэли','#818cf8']] as const).map(([t,label,color])=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{ padding:'8px 18px',borderRadius:24,background:tab===t?`${color}18`:chipBg,border:`1px solid ${tab===t?color+'44':chipBord}`,color:tab===t?color:t2,fontSize:13,fontWeight:tab===t?700:500,cursor:'pointer',transition:'all 0.15s' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16 }}>
            {Array(6).fill(0).map((_,i)=>(
              <div key={i} style={{ height:200,borderRadius:18,background:chipBg,border:`1px solid ${chipBord}` }}/>
            ))}
          </div>
        ) : displayDuels.length===0 ? (
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 0',gap:16 }}>
            <Swords size={52} style={{ color:t3,opacity:0.3 }}/>
            <p style={{ fontSize:18,color:t2,margin:0 }}>{tab==='open'?'Нет открытых дуэлей':'Ты ещё не участвовал в дуэлях'}</p>
            {user && (
              <button onClick={()=>setShowCreate(true)}
                style={{ padding:'9px 20px',background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:12,color:'#f87171',fontSize:13,fontWeight:600,cursor:'pointer' }}>
                Создать первую дуэль
              </button>
            )}
          </div>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16 }}>
            <AnimatePresence>
              {displayDuels.map((d,i)=>(
                <motion.div key={d.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.04,duration:0.3}}>
                  <DuelCard duel={d} dark={dark}/>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && <CreateModal onClose={()=>setShowCreate(false)} dark={dark}/>}
      </AnimatePresence>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>
    </div>
  );
}
