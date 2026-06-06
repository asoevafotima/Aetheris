import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Calendar, ArrowRight, Clock, Plus, X,
  Lock, Globe, Search, CheckSquare, Square, AlertCircle,
  Users, Zap, Timer, Shield,
} from 'lucide-react';
import { contestsApi, problemsApi, testCasesApi, teamsApi } from '../api/endpoints';
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuthStore }  from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { BackgroundGraph } from '../components/BackgroundGraph';
import type { Contest, ProblemShort, Team } from '../types';

// ── helpers ───────────────────────────────────────────────────────
function toInputDT(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth()+1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
}
function defaultDates() {
  const start = new Date(); start.setDate(start.getDate() + 1); start.setHours(12, 0, 0, 0);
  const end = new Date(start); end.setHours(end.getHours() + 2);
  return { starts_at: toInputDT(start), ends_at: toInputDT(end) };
}

function contestStatus(c: Contest): 'live' | 'upcoming' | 'finished' {
  const s = new Date(c.starts_at), e = new Date(c.ends_at);
  if (isFuture(s)) return 'upcoming';
  if (isPast(e))   return 'finished';
  return 'live';
}

const STATUS_CFG = {
  live:     { label: 'Идёт',       color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)',  glow: 'rgba(34,197,94,0.2)'  },
  upcoming: { label: 'Предстоит',  color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', glow: 'rgba(99,102,241,0.2)' },
  finished: { label: 'Завершён',   color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)',glow: 'transparent'          },
};

// ── problem types ──────────────────────────────────────────────────
interface NewProblemForm {
  title: string; description: string; input_format: string;
  output_format: string; constraints: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  topic: string;
  tests: { input: string; output: string }[];
  [key: string]: string | { input: string; output: string }[];
}
const PROBLEM_TOPICS = ['Массивы','Строки','Математика','Ввод/вывод','Сортировка','Поиск','Динамическое программирование','Жадные алгоритмы','Рекурсия','Графы','Деревья','Брутфорс'];
const EMPTY_PROBLEM: NewProblemForm = { title:'',description:'',input_format:'',output_format:'',constraints:'',difficulty:'easy',topic:'',tests:[{input:'',output:''}] };

// ── team registration modal ───────────────────────────────────────
function TeamRegisterModal({ contest, dark, onClose }: { contest: Contest; dark: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [selectedTeam, setSelectedTeam] = useState('');
  const t1 = dark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.88)';
  const t2 = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
  const t3 = dark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.32)';
  const modalBg   = dark ? 'rgba(4,8,20,0.98)'     : 'rgba(255,255,255,0.99)';
  const modalBord = dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.1)';
  const chipBg    = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const chipBord  = dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.08)';

  const { data: myTeams } = useQuery({ queryKey: ['my-teams'], queryFn: () => teamsApi.list(0, 50) });

  const regMut = useMutation({
    mutationFn: () => selectedTeam
      ? contestsApi.registerTeam(contest.id, selectedTeam)
      : contestsApi.register(contest.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-registration', contest.id] }); onClose(); },
  });

  const teams = (myTeams ?? []) as Team[];

  return (
    <div style={{ position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}
        style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)' }}/>
      <motion.div initial={{opacity:0,scale:0.94,y:20}} animate={{opacity:1,scale:1,y:0}}
        style={{ position:'relative',width:'100%',maxWidth:440,background:modalBg,border:`1px solid ${modalBord}`,borderRadius:20,overflow:'hidden',boxShadow:'0 40px 120px rgba(0,0,0,0.4)' }}>
        <div style={{ height:2,background:'linear-gradient(90deg,#6366f1,#22c55e,transparent)' }}/>
        <div style={{ padding:'20px 24px 24px' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
            <div>
              <p style={{ fontSize:16,fontWeight:800,color:t1,margin:0 }}>Регистрация командой</p>
              <p style={{ fontSize:12,color:t3,margin:'3px 0 0' }}>{contest.title}</p>
            </div>
            <button onClick={onClose} style={{ width:30,height:30,borderRadius:8,background:'none',border:`1px solid ${modalBord}`,color:t2,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <X size={14}/>
            </button>
          </div>

          <p style={{ fontSize:13,color:t2,marginBottom:14 }}>Выбери свою команду для участия:</p>

          {teams.length === 0 ? (
            <div style={{ padding:'20px',textAlign:'center',background:chipBg,border:`1px solid ${chipBord}`,borderRadius:14 }}>
              <Users size={28} style={{ color:t3,margin:'0 auto 8px' }}/>
              <p style={{ fontSize:13,color:t2,margin:'0 0 12px' }}>У тебя нет команды</p>
              <a href="/teams" style={{ fontSize:12,color:'#818cf8',textDecoration:'none',fontWeight:600 }}>Создать или вступить в команду →</a>
            </div>
          ) : (
            <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:16 }}>
              {teams.map(team => (
                <button key={team.id} onClick={() => setSelectedTeam(team.id)}
                  style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:13,border:`2px solid ${selectedTeam===team.id?'#6366f1':chipBord}`,background:selectedTeam===team.id?'rgba(99,102,241,0.1)':chipBg,cursor:'pointer',textAlign:'left',transition:'all 0.15s' }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#6366f1,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:900,color:'#fff',flexShrink:0 }}>
                    {team.name[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:14,fontWeight:700,color:t1,margin:0 }}>{team.name}</p>
                    <p style={{ fontSize:11,color:t3,margin:'2px 0 0' }}>Рейтинг: {Math.round(team.rating)}</p>
                  </div>
                  {selectedTeam===team.id && <Shield size={15} color="#818cf8"/>}
                </button>
              ))}
            </div>
          )}

          <button onClick={() => regMut.mutate()} disabled={teams.length>0&&!selectedTeam||regMut.isPending}
            style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px',background:selectedTeam?'linear-gradient(135deg,#22c55e,#16a34a)':'rgba(34,197,94,0.08)',boxShadow:selectedTeam?'0 0 20px rgba(34,197,94,0.4)':'none',border:'none',borderRadius:13,color:selectedTeam?'#fff':'#22c55e',fontSize:13,fontWeight:700,cursor:selectedTeam?'pointer':'not-allowed',transition:'all 0.2s' }}>
            <Shield size={14}/> {regMut.isPending ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── contest card ──────────────────────────────────────────────────
function ContestCard({ contest, dark }: { contest: Contest; dark: boolean }) {
  const status = contestStatus(contest);
  const cfg    = STATUS_CFG[status];
  const start  = new Date(contest.starts_at);
  const end    = new Date(contest.ends_at);
  const { isAuthenticated } = useAuthStore();
  const qc = useQueryClient();
  const [showTeamModal, setShowTeamModal] = useState(false);

  const isTeamContest = !!(contest as { is_team_contest?: boolean }).is_team_contest;

  const t1  = dark ? 'rgba(255,255,255,0.9)'  : 'rgba(0,0,0,0.88)';
  const t2  = dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
  const t3  = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.28)';
  const cardBg   = dark ? 'rgba(6,12,28,0.75)'      : 'rgba(255,255,255,0.97)';
  const cardBord = dark ? 'rgba(255,255,255,0.07)'   : 'rgba(0,0,0,0.08)';
  const chipBg   = dark ? 'rgba(255,255,255,0.06)'   : 'rgba(0,0,0,0.04)';
  const chipBord = dark ? 'rgba(255,255,255,0.1)'    : 'rgba(0,0,0,0.08)';

  const { data: regData } = useQuery({
    queryKey: ['my-registration', contest.id],
    queryFn: () => contestsApi.myRegistration(contest.id),
    enabled: isAuthenticated && status !== 'finished',
    retry: false,
  });
  const registered = !!regData;

  const registerMut = useMutation({
    mutationFn: () => contestsApi.register(contest.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-registration', contest.id] }),
  });

  const timeLabel = status === 'upcoming'
    ? `Через ${formatDistanceToNow(start, { locale: ru })}`
    : status === 'live'
    ? `Осталось ${formatDistanceToNow(end, { locale: ru })}`
    : `Завершился ${formatDistanceToNow(end, { addSuffix: true, locale: ru })}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }} transition={{ duration: 0.2 }}
      style={{
        background: cardBg, border: `1px solid ${status === 'live' ? cfg.border : cardBord}`,
        borderRadius: 18, overflow: 'hidden', position: 'relative',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        boxShadow: dark
          ? status === 'live' ? `0 0 40px ${cfg.glow}` : 'none'
          : '0 4px 24px rgba(0,0,0,0.07)',
        cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Top shimmer line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${cfg.color},transparent)`, opacity: status === 'finished' ? 0.3 : 0.8 }} />

      {/* Live pulse dot */}
      {status === 'live' && (
        <div style={{ position: 'absolute', top: 18, right: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ position: 'relative', width: 8, height: 8 }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e', animation: 'ping 1.2s ease-in-out infinite', opacity: 0.6 }} />
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e' }} />
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', letterSpacing: '0.06em' }}>LIVE</span>
        </div>
      )}

      <div style={{ padding: '22px 22px 18px' }}>
        {/* Status badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, letterSpacing: '0.05em' }}>
            {cfg.label}
          </span>
          {isTeamContest && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#818cf8', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', padding: '3px 10px', borderRadius: 20 }}>
              <Users size={10} /> Командный
            </span>
          )}
          {!contest.is_public && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: t3 }}>
              <Lock size={10} /> Приватный
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{ fontSize: 17, fontWeight: 800, color: t1, margin: '0 0 8px', lineHeight: 1.3, paddingRight: status === 'live' ? 80 : 0 }}>
          {contest.title}
        </h3>
        {contest.description && (
          <p style={{ fontSize: 13, color: t2, margin: '0 0 16px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {contest.description}
          </p>
        )}

        {/* Time info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          <div style={{ background: chipBg, border: `1px solid ${chipBord}`, borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
              <Calendar size={11} color={t3} />
              <span style={{ fontSize: 10, color: t3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Начало</span>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: t1, margin: 0, fontFamily: 'monospace' }}>
              {format(start, 'd MMM, HH:mm', { locale: ru })}
            </p>
          </div>
          <div style={{ background: chipBg, border: `1px solid ${chipBord}`, borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
              <Timer size={11} color={t3} />
              <span style={{ fontSize: 10, color: t3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {status === 'upcoming' ? 'До старта' : status === 'live' ? 'Осталось' : 'Прошло'}
              </span>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: cfg.color, margin: 0 }}>{timeLabel}</p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to={`/contests/${contest.slug}`} style={{ textDecoration: 'none', flex: 1 }}>
            <button style={{
              width: '100%', padding: '10px 16px', borderRadius: 12,
              background: status === 'live'
                ? 'linear-gradient(135deg,#16a34a,#22c55e)'
                : status === 'upcoming'
                ? 'linear-gradient(135deg,#4f46e5,#6366f1)'
                : dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${status === 'finished' ? chipBord : 'transparent'}`,
              color: status === 'finished' ? t1 : '#fff',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: status !== 'finished' ? `0 0 20px ${cfg.glow}` : 'none',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {status === 'live' ? <><Zap size={14} /> Войти</> : status === 'upcoming' ? <><ArrowRight size={14} /> Подробнее</> : <><Trophy size={14} /> Результаты</>}
            </button>
          </Link>

          {status !== 'finished' && (
            registered ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '10px 14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 12 }}>
                <Shield size={13} color="#22c55e" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>
                  {isTeamContest ? '🏆 Команда записана' : 'Записан'}
                </span>
              </div>
            ) : (
              <button
                onClick={() => isTeamContest ? setShowTeamModal(true) : registerMut.mutate()}
                disabled={registerMut.isPending}
                style={{ padding: '10px 16px', background: isTeamContest ? 'rgba(99,102,241,0.1)' : chipBg, border: `1px solid ${isTeamContest ? 'rgba(99,102,241,0.3)' : chipBord}`, borderRadius: 12, color: isTeamContest ? '#818cf8' : t1, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.15s', display: 'flex', alignItems: 'center', gap: 6 }}
                onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = isTeamContest ? 'rgba(99,102,241,0.1)' : chipBg}
              >
                {isTeamContest ? <><Users size={13}/> Командой</> : (registerMut.isPending ? '...' : 'Участвовать')}
              </button>
            )
          )}
        </div>
      </div>

      <AnimatePresence>
        {showTeamModal && <TeamRegisterModal contest={contest} dark={dark} onClose={() => setShowTeamModal(false)}/>}
      </AnimatePresence>
    </motion.div>
  );
}

// ── create modal ──────────────────────────────────────────────────
function CreateContestModal({ onClose, dark }: { onClose: () => void; dark: boolean }) {
  const navigate = useNavigate();
  const qc       = useQueryClient();
  const [error, setError]               = useState('');
  const [problemSearch, setProblemSearch] = useState('');
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [showNewProblem, setShowNewProblem] = useState(false);
  const [newProblem, setNewProblem] = useState<NewProblemForm>(EMPTY_PROBLEM);
  const [form, setForm] = useState({ title:'',description:'',...defaultDates(),is_public:true,max_participants:'',is_team_contest:false });

  const t1 = dark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.88)';
  const t2 = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
  const t3 = dark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.32)';
  const modalBg   = dark ? 'rgba(4,8,20,0.98)'      : 'rgba(255,255,255,0.99)';
  const modalBord = dark ? 'rgba(255,255,255,0.1)'   : 'rgba(0,0,0,0.1)';
  const inputBg   = dark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.04)';
  const inputSt   = { width:'100%', background:inputBg, border:`1px solid ${modalBord}`, borderRadius:10, color:t1, fontSize:13, padding:'10px 12px', outline:'none', fontFamily:'inherit', boxSizing:'border-box' as const };
  const labelSt   = { fontSize:12, fontWeight:700 as const, color:t2, marginBottom:6, display:'block' as const, textTransform:'uppercase' as const, letterSpacing:'0.06em' as const };

  const { data: allProblems, refetch: refetchProblems } = useQuery({
    queryKey: ['problems','all-for-select'],
    queryFn: () => problemsApi.list({ limit: 200 }),
  });

  const createProblemMut = useMutation({
    mutationFn: async () => {
      if (!newProblem.title.trim())        throw new Error('Введите название задачи');
      if (!newProblem.description.trim())  throw new Error('Введите условие задачи');
      if (!newProblem.input_format.trim()) throw new Error('Введите формат ввода');
      if (!newProblem.output_format.trim())throw new Error('Введите формат вывода');
      if (!newProblem.constraints.trim())  throw new Error('Введите ограничения');
      const validTests = newProblem.tests.filter(t => t.input.trim() && t.output.trim());
      if (!validTests.length) throw new Error('Добавьте хотя бы один тест');
      const problem = await problemsApi.create({ title:newProblem.title.trim(),description:newProblem.description.trim(),input_format:newProblem.input_format.trim(),output_format:newProblem.output_format.trim(),constraints:newProblem.constraints.trim(),difficulty:newProblem.difficulty,topic:newProblem.topic||undefined,is_public:false });
      for (let i=0;i<validTests.length;i++) await testCasesApi.create({ problem_id:problem.id,input_data:validTests[i].input,expected_output:validTests[i].output,is_sample:i<2,order_num:i,score:1 });
      return problem;
    },
    onSuccess: (problem) => { setSelectedProblems(prev=>[...prev,problem.id]); setNewProblem(EMPTY_PROBLEM); setShowNewProblem(false); refetchProblems(); },
    onError: (e:unknown) => setError((e as {message?:string})?.message ?? 'Ошибка создания задачи'),
  });

  const filtered = (allProblems ?? []).filter((p:ProblemShort) => p.title.toLowerCase().includes(problemSearch.toLowerCase()));
  const toggleProblem = (id:string) => setSelectedProblems(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id]);

  const createMut = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) throw new Error('Введите название');
      if (!form.starts_at)    throw new Error('Укажите дату начала');
      if (!form.ends_at)      throw new Error('Укажите дату конца');
      const s = new Date(form.starts_at+':00'), e = new Date(form.ends_at+':00');
      if (isNaN(s.getTime())) throw new Error('Неверный формат даты начала');
      if (isNaN(e.getTime())) throw new Error('Неверный формат даты конца');
      if (e <= s)             throw new Error('Дата конца должна быть позже начала');
      const contest = await contestsApi.create({ title:form.title.trim(),description:form.description.trim()||undefined,starts_at:form.starts_at+':00',ends_at:form.ends_at+':00',is_public:form.is_public,max_participants:form.max_participants?parseInt(form.max_participants):undefined,is_team_contest:form.is_team_contest } as Parameters<typeof contestsApi.create>[0]);
      for (let i=0;i<selectedProblems.length;i++) await contestsApi.addProblem(contest.id,selectedProblems[i],String.fromCharCode(65+i)).catch(()=>{});
      return contest;
    },
    onSuccess: (contest) => { qc.invalidateQueries({queryKey:['contests']}); navigate(`/contests/${contest.slug}`); onClose(); },
    onError: (err:unknown) => { const m=err as {message?:string;response?:{data?:{detail?:string}}}; setError(m?.response?.data?.detail ?? m?.message ?? 'Ошибка'); },
  });

  const f = (k:keyof typeof form, v:string|boolean) => setForm(prev => {
    const next = {...prev,[k]:v};
    if (k==='starts_at' && typeof v==='string' && v) {
      const s=new Date(v+':00'), e=new Date(next.ends_at+':00');
      if (!isNaN(s.getTime()) && (isNaN(e.getTime())||e<=s)) { const a=new Date(s);a.setHours(a.getHours()+2);next.ends_at=toInputDT(a); }
    }
    return next;
  });

  return (
    <div style={{ position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        onClick={onClose} style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)' }} />
      <motion.div
        initial={{opacity:0,scale:0.95,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:20}}
        style={{ position:'relative',width:'100%',maxWidth:640,maxHeight:'90vh',display:'flex',flexDirection:'column',background:modalBg,border:`1px solid ${modalBord}`,borderRadius:22,overflow:'hidden',boxShadow:'0 40px 120px rgba(0,0,0,0.4)' }}
      >
        {/* Header */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px',borderBottom:`1px solid ${modalBord}` }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:'rgba(245,158,11,0.15)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Trophy size={18} color="#f59e0b" />
            </div>
            <div>
              <p style={{ fontSize:16,fontWeight:800,color:t1,margin:0 }}>Создать контест</p>
              <p style={{ fontSize:12,color:t3,margin:0 }}>Настройте параметры соревнования</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32,height:32,borderRadius:9,background:'none',border:`1px solid ${modalBord}`,color:t2,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex:1,overflowY:'auto',padding:'22px 24px',display:'flex',flexDirection:'column',gap:18 }}>
          {error && (
            <div style={{ display:'flex',alignItems:'center',gap:8,padding:'11px 14px',borderRadius:12,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',fontSize:13 }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label style={labelSt}>Название *</label>
            <input style={inputSt} placeholder="Codeforces Round #999" value={form.title} onChange={e=>f('title',e.target.value)} />
          </div>

          {/* Description */}
          <div>
            <label style={labelSt}>Описание</label>
            <textarea style={{...inputSt,resize:'none',height:72}} placeholder="Краткое описание..." value={form.description} onChange={e=>f('description',e.target.value)} />
          </div>

          {/* Dates */}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
            {[['starts_at','Начало *'],['ends_at','Конец *']].map(([k,lbl])=>(
              <div key={k}>
                <label style={labelSt}>{lbl}</label>
                <input type="datetime-local" style={inputSt} value={(form as Record<string,string>)[k]} min={k==='ends_at'?form.starts_at:undefined} onChange={e=>f(k as keyof typeof form,e.target.value)} />
              </div>
            ))}
          </div>

          {/* Type + Max */}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
            <div>
              <label style={labelSt}>Видимость</label>
              <div style={{ display:'flex',borderRadius:10,border:`1px solid ${modalBord}`,overflow:'hidden' }}>
                {[{val:true,label:'Публичный',Icon:Globe},{val:false,label:'Приватный',Icon:Lock}].map(opt=>(
                  <button key={String(opt.val)} type="button" onClick={()=>f('is_public',opt.val)}
                    style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'9px 0',fontSize:12,fontWeight:700,cursor:'pointer',border:'none',background:form.is_public===opt.val?'linear-gradient(135deg,#4f46e5,#6366f1)':'transparent',color:form.is_public===opt.val?'#fff':t2,transition:'all 0.15s' }}>
                    <opt.Icon size={12} /> {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelSt}>Макс. участников</label>
              <input type="number" style={inputSt} placeholder="Без ограничений" value={form.max_participants} onChange={e=>f('max_participants',e.target.value)} />
            </div>
          </div>

          {/* Team contest toggle */}
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 16px',borderRadius:13,background:form.is_team_contest?'rgba(99,102,241,0.08)':'rgba(255,255,255,0.03)',border:`1px solid ${form.is_team_contest?'rgba(99,102,241,0.3)':modalBord}`,transition:'all 0.2s' }}>
            <div>
              <p style={{ fontSize:13,fontWeight:700,color:t1,margin:'0 0 3px',display:'flex',alignItems:'center',gap:7 }}>
                <Users size={14} color={form.is_team_contest?'#818cf8':t2}/> Командный контест
              </p>
              <p style={{ fontSize:11,color:t3,margin:0 }}>Регистрируются команды, не отдельные участники</p>
            </div>
            <button type="button" onClick={()=>f('is_team_contest',!form.is_team_contest)}
              style={{ position:'relative',width:44,height:24,borderRadius:12,background:form.is_team_contest?'#6366f1':'rgba(255,255,255,0.08)',border:`1px solid ${form.is_team_contest?'transparent':modalBord}`,cursor:'pointer',flexShrink:0,transition:'background 0.2s' }}>
              <span style={{ position:'absolute',top:2,left:form.is_team_contest?20:2,width:18,height:18,borderRadius:'50%',background:'#fff',transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}/>
            </button>
          </div>

          {/* Problems */}
          <div>
            <label style={{ ...labelSt, display:'flex',alignItems:'center',justifyContent:'space-between' }}>
              <span>Задачи {selectedProblems.length>0 && <span style={{color:'#818cf8'}}>({selectedProblems.length})</span>}</span>
            </label>
            <div style={{ position:'relative',marginBottom:8 }}>
              <Search size={13} style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:t3 }} />
              <input style={{...inputSt,paddingLeft:32}} placeholder="Поиск задач..." value={problemSearch} onChange={e=>setProblemSearch(e.target.value)} />
            </div>

            <button type="button" onClick={()=>setShowNewProblem(v=>!v)}
              style={{ display:'flex',alignItems:'center',gap:6,marginBottom:8,background:'none',border:'none',color:'#818cf8',fontSize:12,fontWeight:600,cursor:'pointer' }}>
              <Plus size={13}/> {showNewProblem?'Скрыть форму':'Создать новую задачу для этого контеста'}
            </button>

            {showNewProblem && (
              <div style={{ border:'1px solid rgba(99,102,241,0.3)',borderRadius:14,padding:16,background:'rgba(99,102,241,0.06)',marginBottom:8,display:'flex',flexDirection:'column',gap:12 }}>
                <p style={{ fontSize:11,fontWeight:800,color:'#818cf8',textTransform:'uppercase',letterSpacing:'0.08em',margin:0 }}>Новая задача</p>
                {[{key:'title',label:'Название *',rows:1},{key:'description',label:'Условие *',rows:3},{key:'input_format',label:'Формат входа *',rows:2},{key:'output_format',label:'Формат выхода *',rows:2},{key:'constraints',label:'Ограничения *',rows:1}].map(({key,label,rows})=>(
                  <div key={key}>
                    <label style={{...labelSt,fontSize:11}}>{label}</label>
                    {rows===1
                      ? <input style={inputSt} value={(newProblem as Record<string,string>)[key]} onChange={e=>setNewProblem(p=>({...p,[key]:e.target.value}))} />
                      : <textarea rows={rows} style={{...inputSt,resize:'none',fontFamily:'monospace'}} value={(newProblem as Record<string,string>)[key]} onChange={e=>setNewProblem(p=>({...p,[key]:e.target.value}))} />}
                  </div>
                ))}
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                  {[['difficulty','Сложность',[['easy','Лёгкая'],['medium','Средняя'],['hard','Сложная'],['expert','Эксперт']]],['topic','Тема',[['','— Без темы —'],...PROBLEM_TOPICS.map(t=>[t,t])]]].map(([k,lbl,opts])=>(
                    <div key={k as string}>
                      <label style={{...labelSt,fontSize:11}}>{lbl as string}</label>
                      <select style={{...inputSt,cursor:'pointer'}} value={(newProblem as Record<string,string>)[k as string]} onChange={e=>setNewProblem(p=>({...p,[k as string]:e.target.value}))}>
                        {(opts as string[][]).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8 }}>
                    <label style={{...labelSt,fontSize:11,marginBottom:0}}>Тест-кейсы *</label>
                    <button type="button" onClick={()=>setNewProblem(p=>({...p,tests:[...p.tests,{input:'',output:''}]}))} style={{ display:'flex',alignItems:'center',gap:4,background:'none',border:'none',color:'#818cf8',fontSize:11,cursor:'pointer' }}><Plus size={11}/>Добавить</button>
                  </div>
                  {newProblem.tests.map((tc,i)=>(
                    <div key={i} style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:6 }}>
                      <div><p style={{ fontSize:10,color:t3,marginBottom:4 }}>Вход #{i+1}</p><textarea rows={2} style={{...inputSt,resize:'none',fontFamily:'monospace',fontSize:12}} value={tc.input} onChange={e=>setNewProblem(p=>({...p,tests:p.tests.map((t,j)=>j===i?{...t,input:e.target.value}:t)}))} /></div>
                      <div><p style={{ fontSize:10,color:t3,marginBottom:4 }}>Выход #{i+1}</p><textarea rows={2} style={{...inputSt,resize:'none',fontFamily:'monospace',fontSize:12}} value={tc.output} onChange={e=>setNewProblem(p=>({...p,tests:p.tests.map((t,j)=>j===i?{...t,output:e.target.value}:t)}))} /></div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>createProblemMut.mutate()} disabled={createProblemMut.isPending}
                  style={{ padding:'9px 16px',background:'rgba(99,102,241,0.2)',border:'1px solid rgba(99,102,241,0.4)',borderRadius:10,color:'#818cf8',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:7 }}>
                  <Plus size={13}/> {createProblemMut.isPending?'Создание...':'Создать и добавить'}
                </button>
              </div>
            )}

            <div style={{ border:`1px solid ${modalBord}`,borderRadius:12,overflow:'hidden',maxHeight:200,overflowY:'auto' }}>
              {filtered.length===0
                ? <p style={{ padding:16,textAlign:'center',color:t3,fontSize:13 }}>Задачи не найдены</p>
                : filtered.map((p:ProblemShort)=>{
                    const sel = selectedProblems.includes(p.id);
                    return (
                      <button key={p.id} type="button" onClick={()=>toggleProblem(p.id)}
                        style={{ width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderBottom:`1px solid ${modalBord}`,background:sel?'rgba(99,102,241,0.1)':'transparent',border:'none',cursor:'pointer',textAlign:'left',transition:'background 0.15s' }}
                        onMouseEnter={e=>{if(!sel)e.currentTarget.style.background=dark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)'}}
                        onMouseLeave={e=>{if(!sel)e.currentTarget.style.background='transparent'}}>
                        {sel ? <CheckSquare size={15} color="#818cf8"/> : <Square size={15} color={t3}/>}
                        <span style={{ flex:1,fontSize:13,color:sel?t1:t2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{p.title}</span>
                        <span style={{ fontSize:11,color:t3 }}>{p.difficulty}</span>
                      </button>
                    );
                  })
              }
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'flex-end',gap:10,padding:'16px 24px',borderTop:`1px solid ${modalBord}` }}>
          <button onClick={onClose} style={{ padding:'10px 18px',background:'none',border:`1px solid ${modalBord}`,borderRadius:11,color:t2,fontSize:13,fontWeight:600,cursor:'pointer' }}>Отмена</button>
          <button onClick={()=>createMut.mutate()} disabled={createMut.isPending}
            style={{ padding:'10px 20px',background:'linear-gradient(135deg,#f59e0b,#d97706)',boxShadow:'0 0 24px rgba(245,158,11,0.4)',border:'none',borderRadius:11,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:7,transition:'transform 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'}
            onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
            <Trophy size={14}/> {createMut.isPending?'Создание...':'Создать контест'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── status filter tabs ────────────────────────────────────────────
const STATUS_TABS = [
  { value:'',         label:'Все',          color:'#6366f1' },
  { value:'upcoming', label:'Предстоящие',  color:'#6366f1' },
  { value:'running',  label:'Идут сейчас',  color:'#22c55e' },
  { value:'finished', label:'Завершённые',  color:'#64748b' },
];

// ── main page ─────────────────────────────────────────────────────
export function Contests() {
  const { isAuthenticated } = useAuthStore();
  const { theme }           = useThemeStore();
  const dark                = theme === 'dark';
  const [statusFilter, setStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const pageBg  = dark ? '#04080f'                : '#f1f5f9';
  const t1      = dark ? 'rgba(255,255,255,0.9)'  : 'rgba(0,0,0,0.88)';
  const t2      = dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
  const t3      = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.28)';
  const cardBg  = dark ? 'rgba(6,12,28,0.7)'      : 'rgba(255,255,255,0.97)';
  const cardBord= dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const chipBg  = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const chipBord= dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.09)';

  const { data: contests, isLoading } = useQuery({
    queryKey: ['contests', statusFilter],
    queryFn: () => contestsApi.list({ limit: 50, status: statusFilter || undefined }),
    retry: false,
  });

  const live     = (contests ?? []).filter((c: Contest) => contestStatus(c) === 'live').length;
  const upcoming = (contests ?? []).filter((c: Contest) => contestStatus(c) === 'upcoming').length;
  const finished = (contests ?? []).filter((c: Contest) => contestStatus(c) === 'finished').length;

  return (
    <div style={{ position:'relative', minHeight:'calc(100vh - 56px)', background:pageBg }}>
      <BackgroundGraph noSphere light={!dark} />

      <div style={{ position:'relative', zIndex:1, maxWidth:1320, margin:'0 auto', padding:'36px 36px 60px' }}>

        {/* Header */}
        <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} transition={{duration:0.4}}
          style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16,marginBottom:32 }}>
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:6 }}>
              <div style={{ width:44,height:44,borderRadius:13,background:'rgba(245,158,11,0.15)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Trophy size={22} color="#f59e0b" />
              </div>
              <h1 style={{ fontSize:32,fontWeight:900,color:t1,margin:0,letterSpacing:'-0.02em' }}>Контесты</h1>
            </div>
            <p style={{ fontSize:14,color:t2,margin:0,paddingLeft:56 }}>Участвуй в соревнованиях и поднимайся в рейтинге</p>
          </div>
          {isAuthenticated && (
            <button onClick={()=>setShowCreate(true)}
              style={{ display:'flex',alignItems:'center',gap:8,padding:'11px 20px',background:'linear-gradient(135deg,#f59e0b,#d97706)',boxShadow:'0 0 24px rgba(245,158,11,0.35)',border:'none',borderRadius:13,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',transition:'transform 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
              <Plus size={16}/> Создать контест
            </button>
          )}
        </motion.div>

        {/* Stats strip */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.08,duration:0.4}}
          style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:28 }}>
          {[
            {label:'Всего контестов', val:(contests??[]).length, icon:Trophy, color:'#f59e0b'},
            {label:'Идут сейчас',     val:live,                  icon:Zap,    color:'#22c55e'},
            {label:'Предстоят',       val:upcoming,              icon:Clock,  color:'#6366f1'},
            {label:'Завершено',       val:finished,              icon:Users,  color:'#64748b'},
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

        {/* Filter tabs */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.14}}
          style={{ display:'flex',gap:6,marginBottom:28,flexWrap:'wrap' }}>
          {STATUS_TABS.map(tab=>(
            <button key={tab.value} onClick={()=>setStatus(tab.value)}
              style={{ padding:'8px 18px',borderRadius:24,background:statusFilter===tab.value?`${tab.color}18`:chipBg,border:`1px solid ${statusFilter===tab.value?tab.color+'44':chipBord}`,color:statusFilter===tab.value?tab.color:t2,fontSize:13,fontWeight:statusFilter===tab.value?700:500,cursor:'pointer',transition:'all 0.15s' }}>
              {tab.value==='running' && statusFilter==='running' && <span style={{ display:'inline-block',width:6,height:6,borderRadius:'50%',background:'#22c55e',marginRight:6,verticalAlign:'middle' }} />}
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:18 }}>
            {Array(6).fill(0).map((_,i)=>(
              <div key={i} style={{ height:220,borderRadius:18,background:chipBg,border:`1px solid ${chipBord}` }} />
            ))}
          </div>
        ) : (contests??[]).length===0 ? (
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 0',gap:16 }}>
            <Trophy size={52} style={{ color:t3,opacity:0.3 }}/>
            <p style={{ fontSize:18,color:t2,margin:0 }}>Контестов не найдено</p>
            {isAuthenticated && (
              <button onClick={()=>setShowCreate(true)}
                style={{ padding:'9px 20px',background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:12,color:'#f59e0b',fontSize:13,fontWeight:600,cursor:'pointer' }}>
                Создать первый контест
              </button>
            )}
          </div>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:18 }}>
            {(contests as Contest[]).map((c,i)=>(
              <motion.div key={c.id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.04,duration:0.3}}>
                <ContestCard contest={c} dark={dark}/>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && <CreateContestModal onClose={()=>setShowCreate(false)} dark={dark}/>}
      </AnimatePresence>

      <style>{`@keyframes ping{0%{transform:scale(1);opacity:0.6}75%,100%{transform:scale(2.5);opacity:0}}`}</style>
    </div>
  );
}
