import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { Swords, Play, CheckCircle, XCircle, Loader2, Crown, Minus, ArrowLeft, User, Timer } from 'lucide-react';
import { duelsApi, submissionsApi } from '../api/endpoints';
import { differenceInSeconds, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuthStore }  from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import type { Duel } from '../types';

const LANGUAGES = [
  { value:'python', label:'Python 3' },
  { value:'cpp',    label:'C++ 17'   },
];
const STARTERS: Record<string,string> = {
  python:`import sys\ninput = sys.stdin.readline\n\ndef solve():\n    pass\n\nsolve()\n`,
  cpp:`#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    return 0;\n}\n`,
};

function Countdown({ startedAt, limitMin, onExpire, dark }: { startedAt:string; limitMin:number; onExpire:()=>void; dark:boolean }) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    const calc = () => {
      const elapsed = differenceInSeconds(new Date(), new Date(startedAt+'Z'));
      const rem = Math.max(0, limitMin*60 - elapsed);
      setLeft(rem);
      if (rem===0) onExpire();
    };
    calc(); const id = setInterval(calc,1000); return ()=>clearInterval(id);
  }, [startedAt,limitMin]);

  const m   = Math.floor(left/60), s = left%60;
  const pct = left/(limitMin*60);
  const urgent   = pct < 0.2;
  const critical = pct < 0.05;
  const color    = critical?'#ef4444':urgent?'#f59e0b':'#22c55e';

  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:6 }}>
      <div style={{ display:'flex',alignItems:'center',gap:6 }}>
        <Timer size={13} color={color}/>
        <span style={{ fontFamily:'monospace',fontSize:22,fontWeight:900,color,letterSpacing:'0.05em',animation:critical?'pulse 1s ease-in-out infinite':undefined }}>
          {String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
        </span>
      </div>
      <div style={{ width:100,height:4,borderRadius:2,background:dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)',overflow:'hidden' }}>
        <div style={{ height:'100%',width:`${pct*100}%`,background:color,borderRadius:2,transition:'width 1s linear' }}/>
      </div>
    </div>
  );
}

function PlayerCard({ name, solved, score, solvedAt, startedAt, isMe, dark }: {
  name:string; solved:boolean; score:number; solvedAt?:string; startedAt?:string; isMe:boolean; dark:boolean;
}) {
  const t1 = dark ? 'rgba(255,255,255,0.9)'  : 'rgba(0,0,0,0.88)';
  const t3 = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.28)';

  let timeStr = '';
  if (solved && solvedAt && startedAt) {
    const sec = differenceInSeconds(new Date(solvedAt+'Z'), new Date(startedAt+'Z'));
    timeStr = `за ${Math.floor(sec/60)}м ${sec%60}с`;
  }

  return (
    <div style={{ padding:'12px 14px',borderRadius:13,background:isMe?'rgba(99,102,241,0.08)':'rgba(255,255,255,0.03)',border:`1px solid ${isMe?'rgba(99,102,241,0.35)':dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}`,display:'flex',alignItems:'center',gap:10 }}>
      <div style={{ width:36,height:36,borderRadius:'50%',background:isMe?'linear-gradient(135deg,#6366f1,#4f46e5)':'linear-gradient(135deg,#ef4444,#dc2626)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:900,color:'#fff',flexShrink:0 }}>
        {name[0]?.toUpperCase()??'?'}
      </div>
      <div style={{ flex:1,minWidth:0 }}>
        <p style={{ fontSize:13,fontWeight:700,color:t1,margin:'0 0 2px',display:'flex',alignItems:'center',gap:6 }}>
          {name} {isMe&&<span style={{ fontSize:10,color:'#818cf8',fontWeight:800 }}>(вы)</span>}
        </p>
        {solved
          ? <p style={{ fontSize:11,color:'#22c55e',margin:0,fontWeight:600 }}>✓ Решено {timeStr}</p>
          : <p style={{ fontSize:11,color:t3,margin:0,fontFamily:'monospace' }}>{score.toFixed(0)}%</p>}
      </div>
      {solved
        ? <CheckCircle size={16} color="#22c55e"/>
        : <span style={{ width:10,height:10,borderRadius:'50%',background:'#f59e0b',display:'inline-block',animation:'pulse 1s ease-in-out infinite' }}/>}
    </div>
  );
}

function ResultScreen({ duel, userId, dark }: { duel:Duel; userId?:string; dark:boolean }) {
  const isChallenger = duel.challenger_id===userId;
  const iWon  = (isChallenger&&duel.result==='challenger_win')||(!isChallenger&&duel.result==='opponent_win');
  const isDraw = duel.result==='draw';
  const myScore = isChallenger?duel.challenger_score:duel.opponent_score;
  const opScore = isChallenger?duel.opponent_score:duel.challenger_score;
  const mySolved= isChallenger?!!duel.challenger_solved_at:!!duel.opponent_solved_at;
  const opSolved= isChallenger?!!duel.opponent_solved_at:!!duel.challenger_solved_at;
  const opName  = isChallenger?duel.opponent_username:duel.challenger_username;
  const t1 = dark?'rgba(255,255,255,0.9)':'rgba(0,0,0,0.88)';
  const t2 = dark?'rgba(255,255,255,0.45)':'rgba(0,0,0,0.5)';
  const t3 = dark?'rgba(255,255,255,0.22)':'rgba(0,0,0,0.28)';
  const cardBord = dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)';
  const chipBg   = dark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)';

  const resultColor = isDraw?'#64748b':iWon?'#f59e0b':'#ef4444';
  const ResultIcon  = isDraw?Minus:iWon?Crown:XCircle;

  return (
    <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
      style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:20,padding:'40px 20px',textAlign:'center' }}>
      <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',bounce:0.5,delay:0.1}}
        style={{ width:88,height:88,borderRadius:'50%',background:`${resultColor}18`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 0 40px ${resultColor}28` }}>
        <ResultIcon size={40} color={resultColor}/>
      </motion.div>

      <div>
        <h2 style={{ fontSize:26,fontWeight:900,color:isDraw?t1:resultColor,margin:'0 0 6px' }}>
          {isDraw?'Ничья!':iWon?'Победа! 🎉':'Поражение'}
        </h2>
        {duel.finished_at && (
          <p style={{ fontSize:12,color:t3,margin:0 }}>
            {format(new Date(duel.finished_at+'Z'),'d MMM, HH:mm',{locale:ru})}
          </p>
        )}
      </div>

      <div style={{ width:'100%',maxWidth:280,display:'flex',flexDirection:'column',gap:8 }}>
        {[['Вы',myScore,mySolved],[(opName??'Оппонент'),opScore,opSolved]].map(([name,score,sol])=>(
          <div key={name as string} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:chipBg,border:`1px solid ${cardBord}`,borderRadius:12 }}>
            <span style={{ fontSize:13,color:t2 }}>{name as string}</span>
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              {sol && <CheckCircle size={13} color="#22c55e"/>}
              <span style={{ fontSize:15,fontFamily:'monospace',fontWeight:800,color:t1 }}>{(score as number).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>

      {(!mySolved&&!opSolved) && <p style={{ fontSize:12,color:t3 }}>Никто не решил — победитель определён по баллам</p>}
    </motion.div>
  );
}

export function DuelDetail() {
  const { id }    = useParams<{ id:string }>();
  const { user }  = useAuthStore();
  const { theme } = useThemeStore();
  const dark      = theme === 'dark';
  const qc        = useQueryClient();
  const [lang, setLang]   = useState('python');
  const [code, setCode]   = useState(STARTERS.python);
  const [lastSubId, setLastSubId] = useState<string|null>(null);
  const [polling, setPolling]     = useState(false);

  const t1       = dark ? 'rgba(255,255,255,0.9)'  : 'rgba(0,0,0,0.88)';
  const t2       = dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
  const t3       = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.28)';
  const panelBg  = dark ? 'rgba(4,8,18,0.94)'      : 'rgba(255,255,255,0.97)';
  const panelBord= dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)';
  const chipBg   = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const chipBord = dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.09)';
  const inputBg  = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const inputBord= dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const codeBg   = dark ? '#1e1e2e'                : '#f8f9ff';

  const { data: duel, refetch } = useQuery({
    queryKey:['duel',id], queryFn:()=>duelsApi.get(id!), enabled:!!id,
    refetchInterval:(q)=>{ const d=q.state.data as Duel|undefined; if(!d||d.status==='finished'||d.status==='cancelled') return false; return 5000; },
  });
  const { data: latestSub } = useQuery({
    queryKey:['submission',lastSubId], queryFn:()=>submissionsApi.get(lastSubId!),
    enabled:!!lastSubId&&polling,
    refetchInterval:(q)=>{ const d=q.state.data; if(!d||d.status==='pending'||d.status==='running') return 1000; setPolling(false); qc.invalidateQueries({queryKey:['duel',id]}); qc.invalidateQueries({queryKey:['duels','mine']}); return false; },
  });
  const submitMut = useMutation({
    mutationFn: ()=>submissionsApi.submit({ problem_id:duel!.problem_id!, language:lang, code }),
    onSuccess: (sub)=>{ setLastSubId(sub.id); setPolling(true); },
  });

  useEffect(()=>{ setCode(STARTERS[lang]??''); },[lang]);

  if (!duel) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'60vh' }}>
      <Loader2 size={28} color="#818cf8" style={{ animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const isChallenger = duel.challenger_id===user?.id;
  const myName    = isChallenger?duel.challenger_username:duel.opponent_username;
  const opName    = isChallenger?duel.opponent_username:duel.challenger_username;
  const mySolvedAt= isChallenger?duel.challenger_solved_at:duel.opponent_solved_at;
  const opSolvedAt= isChallenger?duel.opponent_solved_at:duel.challenger_solved_at;
  const myScore   = isChallenger?duel.challenger_score:duel.opponent_score;
  const opScore   = isChallenger?duel.opponent_score:duel.challenger_score;
  const canSubmit = duel.status==='active'&&!!duel.problem_id;

  return (
    <div style={{ display:'flex',height:'calc(100vh - 56px)',overflow:'hidden',background:dark?'#0a0e1a':'#f1f5f9' }}>

      {/* ── Left panel ── */}
      <div style={{ width:'42%',display:'flex',flexDirection:'column',borderRight:`1px solid ${panelBord}`,overflow:'hidden',background:panelBg,backdropFilter:'blur(24px)' }}>

        {/* Header */}
        <div style={{ padding:'14px 18px',borderBottom:`1px solid ${panelBord}`,background:dark?'rgba(4,8,18,0.6)':'rgba(248,250,252,0.9)',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:duel.status==='active'?14:0 }}>
            <Link to="/duels" style={{ display:'flex',alignItems:'center',justifyContent:'center',width:32,height:32,borderRadius:9,background:chipBg,border:`1px solid ${chipBord}`,color:t2,textDecoration:'none',flexShrink:0,transition:'color 0.15s' }}>
              <ArrowLeft size={15}/>
            </Link>
            <div style={{ display:'flex',alignItems:'center',gap:8,flex:1,minWidth:0 }}>
              <Swords size={15} color="#f87171"/>
              <span style={{ fontSize:14,fontWeight:700,color:t1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                {myName??'Вы'} vs {opName??'???'}
              </span>
            </div>
            {duel.status==='active'&&duel.started_at && (
              <Countdown startedAt={duel.started_at} limitMin={duel.time_limit_minutes} onExpire={()=>refetch()} dark={dark}/>
            )}
            {duel.status==='pending' && (
              <span style={{ fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:20,background:'rgba(6,182,212,0.1)',border:'1px solid rgba(6,182,212,0.3)',color:'#22d3ee' }}>Ожидание...</span>
            )}
            {duel.status==='finished' && (
              <span style={{ fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:20,background:'rgba(100,116,139,0.1)',border:'1px solid rgba(100,116,139,0.2)',color:'#94a3b8' }}>Завершена</span>
            )}
          </div>

          {duel.status==='active' && (
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
              <PlayerCard name={myName??'Вы'} solved={!!mySolvedAt} score={myScore} solvedAt={mySolvedAt} startedAt={duel.started_at} isMe dark={dark}/>
              <PlayerCard name={opName??'Оппонент'} solved={!!opSolvedAt} score={opScore} solvedAt={opSolvedAt} startedAt={duel.started_at} isMe={false} dark={dark}/>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex:1,overflowY:'auto',padding:'20px 18px' }}>
          {duel.status==='finished' ? (
            <ResultScreen duel={duel} userId={user?.id} dark={dark}/>
          ) : duel.status==='pending' ? (
            <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:16,textAlign:'center' }}>
              <div style={{ width:64,height:64,borderRadius:'50%',border:`2px dashed ${panelBord}`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                <User size={26} color={t3} style={{ opacity:0.4 }}/>
              </div>
              <p style={{ fontSize:13,color:t2,lineHeight:1.6,maxWidth:260,margin:0 }}>
                Жди пока соперник примет приглашение.<br/>Задача откроется после старта.
              </p>
            </div>
          ) : duel.status==='active'&&duel.problem_id ? (
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
              {duel.problem_title && (
                <h2 style={{ fontSize:18,fontWeight:800,color:t1,margin:0 }}>{duel.problem_title}</h2>
              )}
              <Link to={`/problems/${duel.problem_slug}`}
                style={{ display:'inline-flex',alignItems:'center',gap:6,fontSize:13,color:'#818cf8',textDecoration:'none',fontWeight:600 }}>
                Открыть задачу полностью →
              </Link>
              <div style={{ padding:'12px 14px',borderRadius:12,background:'rgba(99,102,241,0.06)',border:'1px solid rgba(99,102,241,0.2)',fontSize:13,color:t2 }}>
                💡 Пиши код справа и нажми «Отправить» — решение проверится автоматически
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Right panel: editor ── */}
      <div style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden',background:codeBg }}>

        {/* Toolbar */}
        <div style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 16px',borderBottom:`1px solid ${panelBord}`,background:panelBg,backdropFilter:'blur(20px)',flexShrink:0 }}>
          <select value={lang} onChange={e=>setLang(e.target.value)}
            style={{ padding:'7px 12px',background:inputBg,border:`1px solid ${inputBord}`,borderRadius:9,color:t1,fontSize:13,cursor:'pointer',outline:'none',fontFamily:'inherit' }}>
            {LANGUAGES.map(l=><option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <div style={{ flex:1 }}/>
          <button onClick={()=>submitMut.mutate()} disabled={!canSubmit||submitMut.isPending||polling}
            style={{ display:'flex',alignItems:'center',gap:7,padding:'8px 18px',background:canSubmit&&!submitMut.isPending&&!polling?'linear-gradient(135deg,#22c55e,#16a34a)':chipBg,boxShadow:canSubmit&&!submitMut.isPending&&!polling?'0 0 20px rgba(34,197,94,0.4)':'none',border:`1px solid ${chipBord}`,borderRadius:10,color:canSubmit&&!submitMut.isPending&&!polling?'#fff':t3,fontSize:13,fontWeight:700,cursor:canSubmit?'pointer':'not-allowed',transition:'all 0.2s' }}>
            {polling?<><Loader2 size={13} style={{animation:'spin 0.8s linear infinite'}}/> Проверяется...</>:<><Play size={13}/> Отправить</>}
          </button>
        </div>

        <div style={{ flex:1,overflow:'hidden' }}>
          <Editor height="100%" language={lang==='cpp'?'cpp':'python'} value={code} onChange={v=>setCode(v??'')}
            theme={dark?'vs-dark':'vs'}
            options={{ fontSize:14, fontFamily:'"JetBrains Mono","Fira Code",monospace', minimap:{enabled:false}, scrollBeyondLastLine:false, padding:{top:16}, lineNumbers:'on', tabSize:4, readOnly:!canSubmit }}
          />
        </div>

        {/* Result bar */}
        {latestSub && (
          <div style={{ borderTop:`1px solid ${panelBord}`,background:panelBg,padding:'12px 20px',flexShrink:0 }}>
            {polling ? (
              <div style={{ display:'flex',alignItems:'center',gap:8,color:'#06b6d4',fontSize:13 }}>
                <Loader2 size={14} style={{ animation:'spin 0.8s linear infinite' }}/> Проверяется...
              </div>
            ) : latestSub.status==='accepted' ? (
              <div style={{ display:'flex',alignItems:'center',gap:8,color:'#22c55e',fontSize:13,fontWeight:700 }}>
                <CheckCircle size={15}/> Принято! {latestSub.time_ms&&`· ${latestSub.time_ms}мс`}
              </div>
            ) : (
              <div style={{ display:'flex',alignItems:'center',gap:8,color:'#f87171',fontSize:13 }}>
                <XCircle size={15}/> {latestSub.status}
                {latestSub.error_message && <span style={{ fontSize:11,color:t3,marginLeft:8,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:300 }}>{latestSub.error_message}</span>}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
