import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Code2, Bookmark, BookmarkCheck, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { problemsApi, bookmarksApi } from '../api/endpoints';
import { DifficultyBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SkeletonLine } from '../components/ui/Spinner';
import { useT } from '../i18n';
import { useAuthStore } from '../store/authStore';
import type { ProblemShort } from '../types';

const TOPICS = ['Массивы','Строки','Математика','Ввод/вывод','Сортировка','Поиск','Динамическое программирование','Жадные алгоритмы','Рекурсия','Графы','Деревья','Брутфорс'];
const DIFFS = [
  {v:'',     l:'Все',     dot:'rgba(255,255,255,0.3)'},
  {v:'easy', l:'Лёгкая',  dot:'#34d399'},
  {v:'medium',l:'Средняя',dot:'#fbbf24'},
  {v:'hard', l:'Сложная', dot:'#fb923c'},
  {v:'expert',l:'Эксперт',dot:'#f87171'},
];

export function Problems() {
  const t = useT();
  const { user } = useAuthStore();
  const [search, setSearch]   = useState('');
  const [diff, setDiff]       = useState('');
  const [topic, setTopic]     = useState('');
  const [page, setPage]       = useState(0);
  const limit = 20;

  const { data: problems, isLoading } = useQuery({
    queryKey: ['problems', diff, topic, page],
    queryFn: () => problemsApi.list({ skip: page*limit, limit, difficulty: diff||undefined, topic: topic||undefined }),
  });
  const { data: bookmarks, refetch: refBm } = useQuery({ queryKey: ['bookmarks'], queryFn: bookmarksApi.list });
  const bmIds = new Set(((bookmarks??[]) as {problem_id:string}[]).map(b=>b.problem_id));
  const filtered = (problems??[]).filter((p:ProblemShort) => p.title.toLowerCase().includes(search.toLowerCase()));

  const toggleBm = async (e: React.MouseEvent, pid: string) => {
    e.preventDefault();
    try { bmIds.has(pid) ? await bookmarksApi.remove(pid) : await bookmarksApi.add(pid); refBm(); } catch {/**/}
  };

  return (
    <div style={{ padding: '32px', background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} transition={{duration:0.4,ease:'easeOut'}} style={{marginBottom:32}}>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
          <div>
            <h1 style={{fontSize:30,fontWeight:800,letterSpacing:'-0.03em',color:'var(--text-1)',display:'flex',alignItems:'center',gap:12}}>
              <Code2 size={26} color="var(--accent)"/> {t.problems.title}
            </h1>
            <p style={{fontSize:14,color:'var(--text-3)',marginTop:6}}>{t.problems.subtitle}</p>
          </div>
          {(user?.role==='admin'||user?.role==='moderator') && (
            <Link to="/problems/create"><Button icon={<Plus size={14}/>}>Создать задачу</Button></Link>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:24}}>
        {/* Search */}
        <div style={{position:'relative',maxWidth:500}}>
          <Search size={15} color="var(--text-3)" style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}/>
          <input className="input-theme" style={{paddingLeft:38,paddingRight:12,paddingTop:10,paddingBottom:10,width:'100%'}}
            placeholder={t.common.search+'…'} value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>

        {/* Difficulty segmented */}
        <div style={{display:'flex',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden',width:'fit-content'}}>
          {DIFFS.map(({v,l,dot})=>(
            <button key={v} onClick={()=>{setDiff(v);setPage(0);}}
              style={{
                display:'flex',alignItems:'center',gap:6,padding:'8px 14px',fontSize:12,fontWeight:500,cursor:'pointer',border:'none',whiteSpace:'nowrap',transition:'all 0.15s',
                background: diff===v ? 'var(--accent)' : 'transparent',
                color: diff===v ? '#fff' : 'var(--text-3)',
              }}>
              <span style={{width:6,height:6,borderRadius:'50%',background:diff===v?'rgba(255,255,255,0.7)':dot,flexShrink:0}}/>
              {l}
            </button>
          ))}
        </div>

        {/* Topic pills */}
        <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
          <button onClick={()=>{setTopic('');setPage(0);}}
            style={{padding:'5px 12px',borderRadius:99,fontSize:12,fontWeight:500,cursor:'pointer',border:`1px solid ${topic===''?'var(--accent)':'var(--border)'}`,background:topic===''?'rgba(124,58,237,0.1)':'transparent',color:topic===''?'#a78bfa':'var(--text-3)',transition:'all 0.15s'}}>
            Все темы
          </button>
          {TOPICS.map(tp=>(
            <button key={tp} onClick={()=>{setTopic(topic===tp?'':tp);setPage(0);}}
              style={{padding:'5px 12px',borderRadius:99,fontSize:12,fontWeight:500,cursor:'pointer',border:`1px solid ${topic===tp?'var(--accent)':'var(--border)'}`,background:topic===tp?'rgba(124,58,237,0.1)':'transparent',color:topic===tp?'#a78bfa':'var(--text-3)',transition:'all 0.15s'}}>
              {tp}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{borderRadius:16,overflow:'hidden',background:'var(--surface)',border:'1px solid var(--border)',boxShadow:'var(--shadow)'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'var(--bg-2,var(--bg))'}}>
              {['#','Задача','Код','Сложность','Тема','Решено',''].map((h,i)=>(
                <th key={i} style={{padding:'12px 16px',textAlign:i===5||i===6?'right':'left',fontSize:10,fontWeight:600,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.1em',borderBottom:'1px solid var(--border)',whiteSpace:'nowrap',
                  display: i===2?'none':i===4?'none':undefined}}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array(10).fill(0).map((_,i)=>(
                  <tr key={i} style={{borderBottom:'1px solid var(--border)'}}>
                    <td colSpan={7} style={{padding:'12px 16px'}}><SkeletonLine className="h-8 w-full"/></td>
                  </tr>
                ))
              : (
                <AnimatePresence>
                  {filtered.map((p:ProblemShort, i:number)=>(
                    <motion.tr key={p.id} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:i*0.02}}
                      style={{borderBottom:'1px solid var(--border)',cursor:'pointer',transition:'background 0.1s'}}
                      onMouseEnter={e=>(e.currentTarget.style.background='var(--hover)')}
                      onMouseLeave={e=>(e.currentTarget.style.background='')}>
                      <td style={{padding:'13px 16px',fontSize:12,fontFamily:'JetBrains Mono,monospace',color:'var(--text-3)',width:48}}>
                        {page*limit+i+1}
                      </td>
                      <td style={{padding:'13px 16px'}}>
                        <Link to={`/problems/${p.slug}`} style={{textDecoration:'none',display:'flex',alignItems:'center',gap:8}}>
                          <Code2 size={13} color="var(--text-3)"/>
                          <span style={{fontSize:13,fontWeight:500,color:'var(--text-1)',transition:'color 0.15s'}}
                            onMouseEnter={e=>(e.currentTarget.style.color='var(--accent)')}
                            onMouseLeave={e=>(e.currentTarget.style.color='var(--text-1)')}>
                            {p.title}
                          </span>
                        </Link>
                      </td>
                      <td style={{padding:'13px 8px',display:'none'}}>
                        {p.difficulty_code && <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,fontWeight:700,color:'#a78bfa',background:'rgba(124,58,237,0.1)',border:'1px solid rgba(124,58,237,0.2)',padding:'2px 7px',borderRadius:6,textTransform:'uppercase'}}>{p.difficulty_code}</span>}
                      </td>
                      <td style={{padding:'13px 8px'}}><DifficultyBadge difficulty={p.difficulty}/></td>
                      <td style={{padding:'13px 8px',display:'none'}}>
                        {p.topic && <span style={{fontSize:11,color:'var(--text-2)',background:'var(--bg)',border:'1px solid var(--border)',padding:'2px 9px',borderRadius:99}}>{p.topic}</span>}
                      </td>
                      <td style={{padding:'13px 16px',textAlign:'right',fontSize:12,fontFamily:'JetBrains Mono,monospace',color:'var(--text-3)'}}>
                        {p.solve_count.toLocaleString()}
                      </td>
                      <td style={{padding:'13px 12px',textAlign:'right'}}>
                        <button onClick={e=>toggleBm(e,p.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-3)',opacity:0,transition:'opacity 0.15s',display:'flex',alignItems:'center'}}
                          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.opacity='1';(e.currentTarget as HTMLButtonElement).style.color=bmIds.has(p.id)?'#fbbf24':'var(--text-2)';}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.opacity='0';}}
                          className="group-hover:opacity-100">
                          {bmIds.has(p.id) ? <BookmarkCheck size={14} color="#fbbf24"/> : <Bookmark size={14}/>}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
          </tbody>
        </table>
        {!isLoading && filtered.length===0 && (
          <div style={{padding:'64px 16px',textAlign:'center',color:'var(--text-3)'}}>
            <Code2 size={36} style={{margin:'0 auto 12px',opacity:0.2}}/>
            <p style={{fontSize:14}}>{t.problems.not_found}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:20}}>
        <Button variant="outline" size="sm" icon={<ChevronLeft size={13}/>} onClick={()=>setPage(Math.max(0,page-1))} disabled={page===0}>
          {t.common.back}
        </Button>
        <span style={{fontSize:13,fontFamily:'JetBrains Mono,monospace',color:'var(--text-3)'}}>{page+1}</span>
        <Button variant="outline" size="sm" onClick={()=>setPage(page+1)} disabled={(problems?.length??0)<limit}>
          {t.common.next} <ChevronRight size={13}/>
        </Button>
      </div>
    </div>
  );
}
