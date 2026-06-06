import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, Star, Globe, Lock,
  Send, MessageSquare, Crown, UserPlus, UserMinus,
  Trash2, Check, X, Search, Bell,
} from 'lucide-react';
import { teamsApi, chatApi, usersApi, teamInvitationsApi } from '../api/endpoints';
import { useAuthStore }  from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { BackgroundGraph } from '../components/BackgroundGraph';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { ChatMessage } from '../types';

interface Member {
  id: string;          // TeamMember record ID
  user_id: string;     // actual User ID
  username?: string;   // from nested user object (if backend returns it)
  role?: string;
  user?: { id: string; username: string; role: string };
}
interface TeamInvite { id: string; from_user: { id: string; username: string }; team: { id: string; name: string } }

export function TeamDetail() {
  const { slug }    = useParams<{ slug: string }>();
  const { user }    = useAuthStore();
  const { theme }   = useThemeStore();
  const dark        = theme === 'dark';
  const qc          = useQueryClient();
  const [chatText, setChatText]   = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const pageBg    = dark ? '#04080f'                 : '#f1f5f9';
  const t1        = dark ? 'rgba(255,255,255,0.9)'   : 'rgba(0,0,0,0.88)';
  const t2        = dark ? 'rgba(255,255,255,0.45)'  : 'rgba(0,0,0,0.5)';
  const t3        = dark ? 'rgba(255,255,255,0.22)'  : 'rgba(0,0,0,0.28)';
  const cardBg    = dark ? 'rgba(6,12,28,0.78)'      : 'rgba(255,255,255,0.97)';
  const cardBord  = dark ? 'rgba(255,255,255,0.07)'  : 'rgba(0,0,0,0.08)';
  const inputBg   = dark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.04)';
  const inputBord = dark ? 'rgba(255,255,255,0.12)'  : 'rgba(0,0,0,0.12)';
  const chipBg    = dark ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.04)';
  const chipBord  = dark ? 'rgba(255,255,255,0.1)'   : 'rgba(0,0,0,0.08)';

  const { data: team } = useQuery({
    queryKey: ['team', slug],
    queryFn: () => teamsApi.get(slug!),
    enabled: !!slug,
  });
  const { data: members, refetch: refetchMembers } = useQuery({
    queryKey: ['team-members', team?.id],
    queryFn: () => teamsApi.members(team!.id),
    enabled: !!team?.id,
  });
  const { data: messages, refetch: refetchChat } = useQuery({
    queryKey: ['chat', 'team', team?.id],
    queryFn: () => chatApi.contest(team!.id, 0, 100),
    enabled: !!team?.id,
    refetchInterval: 4000,
  });
  const { data: userSearch } = useQuery({
    queryKey: ['users-search', searchUser],
    queryFn: () => usersApi.search(searchUser),
    enabled: searchUser.length >= 2,
  });
  // Incoming invitations for current user
  const { data: myInvites, refetch: refetchInvites } = useQuery({
    queryKey: ['team-invitations', 'me'],
    queryFn: teamInvitationsApi.myIncoming,
    refetchInterval: 15_000,
  });

  const sendChatMut = useMutation({
    mutationFn: () => chatApi.send({ content: chatText.trim(), contest_id: team!.id }),
    onSuccess: () => { setChatText(''); refetchChat(); },
  });

  const inviteMut = useMutation({
    mutationFn: (userId: string) => teamInvitationsApi.send(team!.id, userId),
    onSuccess: () => { setSearchUser(''); setShowSearch(false); },
  });

  const removeMut = useMutation({
    mutationFn: (userId: string) => teamsApi.removeMember(team!.id, userId),
    onSuccess: () => refetchMembers(),
  });

  const acceptInvMut = useMutation({
    mutationFn: (id: string) => teamInvitationsApi.accept(id),
    onSuccess: () => { refetchInvites(); refetchMembers(); },
  });
  const declineInvMut = useMutation({
    mutationFn: (id: string) => teamInvitationsApi.decline(id),
    onSuccess: () => refetchInvites(),
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  if (!team) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'60vh' }}>
      <div style={{ width:32,height:32,borderRadius:'50%',border:'3px solid rgba(99,102,241,0.3)',borderTopColor:'#818cf8',animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const memberList = (members ?? []) as Member[];
  const getMemberUserId = (m: Member) => m.user?.id ?? m.user_id;
  const getMemberUsername = (m: Member) => m.user?.username ?? m.username ?? m.user_id;
  const isOwner = team.owner_id === user?.id
    || !!memberList.find(m => getMemberUserId(m) === user?.id && (m.role === 'owner' || m.role === 'admin'));
  const isMember = memberList.some(m => getMemberUserId(m) === user?.id);
  const chatList   = (messages ?? []) as ChatMessage[];
  const invList    = (myInvites ?? []) as TeamInvite[];
  const thisTeamInvites = invList.filter(i => i.team?.id === team.id);

  return (
    <div style={{ position:'relative', minHeight:'calc(100vh - 56px)', background:pageBg }}>
      <BackgroundGraph noSphere light={!dark}/>

      <div style={{ position:'relative', zIndex:1, maxWidth:1280, margin:'0 auto', padding:'28px 32px 48px' }}>

        {/* Back + Header */}
        <motion.div initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}} transition={{duration:0.4}} style={{ marginBottom:22 }}>
          <Link to="/teams" style={{ display:'inline-flex',alignItems:'center',gap:6,fontSize:13,color:t2,textDecoration:'none',marginBottom:16 }}>
            <ArrowLeft size={14}/> Все команды
          </Link>
          <div style={{ display:'flex',alignItems:'center',gap:16,flexWrap:'wrap' }}>
            <div style={{ width:60,height:60,borderRadius:16,background:'linear-gradient(135deg,#6366f1,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:900,color:'#fff',boxShadow:'0 0 30px rgba(99,102,241,0.4)',flexShrink:0 }}>
              {team.name[0]?.toUpperCase()}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex',alignItems:'center',gap:10,flexWrap:'wrap' }}>
                <h1 style={{ fontSize:26,fontWeight:900,color:t1,margin:0 }}>{team.name}</h1>
                <span style={{ display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,background:'rgba(245,158,11,0.12)',color:'#f59e0b',border:'1px solid rgba(245,158,11,0.3)' }}>
                  <Star size={10}/> {Math.round(team.rating)}
                </span>
                <span style={{ display:'flex',alignItems:'center',gap:4,fontSize:11,color:t3 }}>
                  {team.is_public ? <Globe size={11}/> : <Lock size={11}/>}
                  {team.is_public ? 'Публичная' : 'Приватная'}
                </span>
                <span style={{ fontSize:11,color:t3 }}>{memberList.length}/{team.max_members} участников</span>
              </div>
              {team.description && <p style={{ fontSize:13,color:t2,margin:'5px 0 0' }}>{team.description}</p>}
            </div>
          </div>
        </motion.div>

        {/* Incoming invites for this team */}
        <AnimatePresence>
          {thisTeamInvites.length > 0 && (
            <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{ marginBottom:16 }}>
              {thisTeamInvites.map(inv => (
                <div key={inv.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'14px 18px',marginBottom:8,borderRadius:14,background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.3)',backdropFilter:'blur(12px)' }}>
                  <Bell size={16} color="#818cf8"/>
                  <p style={{ flex:1,fontSize:13,color:t1,margin:0,fontWeight:600 }}>
                    <span style={{ color:'#818cf8' }}>{inv.from_user?.username}</span> пригласил тебя в команду <span style={{ color:'#818cf8' }}>{inv.team?.name}</span>
                  </p>
                  <div style={{ display:'flex',gap:8 }}>
                    <button onClick={() => declineInvMut.mutate(inv.id)}
                      style={{ width:34,height:34,borderRadius:9,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
                      <X size={14}/>
                    </button>
                    <button onClick={() => acceptInvMut.mutate(inv.id)}
                      style={{ width:34,height:34,borderRadius:9,background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.35)',color:'#22c55e',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
                      <Check size={14}/>
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main layout */}
        <div style={{ display:'grid', gridTemplateColumns:'290px 1fr', gap:18, alignItems:'flex-start' }}>

          {/* Members panel */}
          <motion.div initial={{opacity:0,x:-14}} animate={{opacity:1,x:0}} transition={{delay:0.1}}>
            <div style={{ background:cardBg,border:`1px solid ${cardBord}`,borderRadius:18,overflow:'hidden',backdropFilter:'blur(24px)',boxShadow:dark?'none':'0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ padding:'16px 18px',borderBottom:`1px solid ${cardBord}`,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                <div style={{ display:'flex',alignItems:'center',gap:7 }}>
                  <Users size={15} color="#818cf8"/>
                  <span style={{ fontSize:14,fontWeight:700,color:t1 }}>Участники</span>
                  <span style={{ fontSize:11,color:t3,fontFamily:'monospace' }}>{memberList.length}/{team.max_members}</span>
                </div>
                {isOwner && memberList.length < team.max_members && (
                  <button onClick={() => setShowSearch(!showSearch)}
                    style={{ display:'flex',alignItems:'center',gap:5,padding:'5px 10px',borderRadius:8,background:showSearch?'rgba(99,102,241,0.15)':chipBg,border:`1px solid ${showSearch?'rgba(99,102,241,0.4)':chipBord}`,color:showSearch?'#818cf8':t2,fontSize:12,fontWeight:600,cursor:'pointer',transition:'all 0.15s' }}>
                    <UserPlus size={13}/> Пригласить
                  </button>
                )}
              </div>

              {/* Invite search */}
              <AnimatePresence>
                {showSearch && isOwner && (
                  <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                    style={{ overflow:'hidden',borderBottom:`1px solid ${cardBord}` }}>
                    <div style={{ padding:'12px 16px' }}>
                      <div style={{ position:'relative' }}>
                        <Search size={13} style={{ position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:t3 }}/>
                        <input placeholder="Найди пользователя..." value={searchUser} onChange={e=>setSearchUser(e.target.value)}
                          style={{ width:'100%',paddingLeft:30,paddingRight:12,paddingTop:8,paddingBottom:8,background:inputBg,border:`1px solid ${inputBord}`,borderRadius:10,color:t1,fontSize:12,outline:'none',fontFamily:'inherit',boxSizing:'border-box' }}/>
                      </div>
                      {userSearch && (userSearch as Member[]).filter(u => !memberList.find(m => getMemberUserId(m) === u.id)).map(u => (
                        <button key={u.id}
                          onClick={() => inviteMut.mutate(u.id)}
                          disabled={inviteMut.isPending}
                          style={{ width:'100%',display:'flex',alignItems:'center',gap:9,padding:'9px 4px',background:'none',border:'none',color:t1,fontSize:13,cursor:'pointer',textAlign:'left',borderTop:`1px solid ${cardBord}`,marginTop:6,transition:'color 0.15s' }}>
                          <div style={{ width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:'#fff',flexShrink:0 }}>
                            {u.username[0]?.toUpperCase()}
                          </div>
                          <span style={{ flex:1 }}>{u.username}</span>
                          <span style={{ fontSize:11,color:'#818cf8',fontWeight:700,background:'rgba(99,102,241,0.1)',padding:'2px 8px',borderRadius:6 }}>
                            {inviteMut.isPending ? '...' : 'Пригласить'}
                          </span>
                        </button>
                      ))}
                      {searchUser.length >= 2 && (!userSearch || (userSearch as Member[]).filter(u => !memberList.find(m => getMemberUserId(m) === u.id)).length === 0) && (
                        <p style={{ fontSize:12,color:t3,textAlign:'center',margin:'10px 0 4px' }}>Никого не найдено</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Member list */}
              {memberList.map(m => (
                <div key={m.id} style={{ display:'flex',alignItems:'center',gap:10,padding:'12px 18px',borderBottom:`1px solid ${cardBord}`,transition:'background 0.15s' }}
                  onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background=chipBg}
                  onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='transparent'}>
                  <div style={{ width:36,height:36,borderRadius:'50%',background:m.role==='owner'||getMemberUserId(m)===team.owner_id?'linear-gradient(135deg,#f59e0b,#d97706)':'linear-gradient(135deg,#6366f1,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:900,color:'#fff',flexShrink:0 }}>
                    {getMemberUsername(m)[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ fontSize:13,fontWeight:600,color:t1,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{getMemberUsername(m)}</p>
                    <p style={{ fontSize:11,color:t3,margin:0,display:'flex',alignItems:'center',gap:4 }}>
                      {(m.role==='owner'||getMemberUserId(m)===team.owner_id)
                        ? <><Crown size={9} color="#f59e0b"/> Владелец</>
                        : m.role==='admin' ? <><Crown size={9} color="#818cf8"/> Администратор</>
                        : 'Участник'}
                    </p>
                  </div>
                  {isOwner && getMemberUserId(m) !== user?.id && (
                    <button onClick={() => removeMut.mutate(getMemberUserId(m))}
                      style={{ background:'none',border:'none',color:t3,cursor:'pointer',padding:4,transition:'color 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.color='#f87171'}
                      onMouseLeave={e=>e.currentTarget.style.color=t3}>
                      <UserMinus size={13}/>
                    </button>
                  )}
                  {getMemberUserId(m) === user?.id && <span style={{ fontSize:10,color:'#818cf8',background:'rgba(99,102,241,0.1)',padding:'2px 6px',borderRadius:6,fontWeight:700 }}>Вы</span>}
                </div>
              ))}

              {memberList.length === 0 && (
                <p style={{ padding:'20px',textAlign:'center',fontSize:13,color:t3 }}>Участников пока нет</p>
              )}
            </div>
          </motion.div>

          {/* Chat */}
          <motion.div initial={{opacity:0,x:14}} animate={{opacity:1,x:0}} transition={{delay:0.15}}>
            <div style={{ background:cardBg,border:`1px solid ${cardBord}`,borderRadius:18,overflow:'hidden',backdropFilter:'blur(24px)',boxShadow:dark?'none':'0 4px 20px rgba(0,0,0,0.06)',display:'flex',flexDirection:'column',height:'calc(100vh - 280px)',minHeight:440 }}>

              <div style={{ padding:'16px 20px',borderBottom:`1px solid ${cardBord}`,display:'flex',alignItems:'center',gap:10,flexShrink:0 }}>
                <span style={{ width:8,height:8,borderRadius:'50%',background:'#22c55e',boxShadow:'0 0 8px rgba(34,197,94,0.6)',flexShrink:0 }}/>
                <MessageSquare size={15} color="#818cf8"/>
                <span style={{ fontSize:14,fontWeight:700,color:t1 }}>Чат команды</span>
                <span style={{ fontSize:11,color:t3,marginLeft:'auto' }}>↻ каждые 4с</span>
              </div>

              <div style={{ flex:1,overflowY:'auto',padding:'16px 20px',display:'flex',flexDirection:'column',gap:10 }}>
                {chatList.length === 0 ? (
                  <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:12,textAlign:'center' }}>
                    <MessageSquare size={40} style={{ color:t3,opacity:0.3 }}/>
                    <p style={{ fontSize:13,color:t2,margin:0 }}>Начните общение!</p>
                  </div>
                ) : chatList.map(msg => {
                  const isMe = msg.user_id === user?.id;
                  return (
                    <motion.div key={msg.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
                      style={{ display:'flex',gap:9,flexDirection:isMe?'row-reverse':'row',alignItems:'flex-end' }}>
                      <div style={{ width:30,height:30,borderRadius:'50%',background:isMe?'linear-gradient(135deg,#1d4ed8,#2563eb)':'linear-gradient(135deg,#6366f1,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,color:'#fff',flexShrink:0 }}>
                        {(msg.username??'?')[0]?.toUpperCase()}
                      </div>
                      <div style={{ maxWidth:'70%',display:'flex',flexDirection:'column',gap:3,alignItems:isMe?'flex-end':'flex-start' }}>
                        {!isMe && <span style={{ fontSize:10,color:t3,fontWeight:700 }}>{msg.username}</span>}
                        <div style={{ padding:'10px 14px',borderRadius:isMe?'16px 4px 16px 16px':'4px 16px 16px 16px',fontSize:13,lineHeight:1.5,
                          background:isMe?'linear-gradient(135deg,#1d4ed8,#2563eb)':dark?'rgba(14,20,40,0.9)':'rgba(255,255,255,0.95)',
                          color:isMe?'#fff':t1,
                          border:isMe?'none':`1px solid ${cardBord}`,
                          boxShadow:isMe?'0 0 16px rgba(29,78,216,0.3)':undefined }}>
                          {msg.content}
                        </div>
                        <span style={{ fontSize:10,color:t3 }}>
                          {formatDistanceToNow(new Date(msg.created_at),{addSuffix:true,locale:ru})}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={bottomRef}/>
              </div>

              <div style={{ padding:'12px 16px',borderTop:`1px solid ${cardBord}`,display:'flex',gap:10,flexShrink:0 }}>
                {!isMember ? (
                  <p style={{ flex:1,fontSize:13,color:t3,textAlign:'center',margin:'8px 0' }}>
                    Вступи в команду чтобы писать в чат
                  </p>
                ) : (
                  <>
                    <input
                      placeholder="Напиши сообщение... (Enter — отправить)"
                      value={chatText}
                      onChange={e => setChatText(e.target.value)}
                      onKeyDown={e => { if (e.key==='Enter'&&!e.shiftKey&&chatText.trim()) { e.preventDefault(); sendChatMut.mutate(); } }}
                      style={{ flex:1,padding:'11px 14px',background:inputBg,border:`1px solid ${inputBord}`,borderRadius:12,color:t1,fontSize:13,outline:'none',fontFamily:'inherit',transition:'border-color 0.15s' }}
                      onFocus={e=>e.target.style.borderColor='rgba(99,102,241,0.5)'}
                      onBlur={e=>e.target.style.borderColor=inputBord}
                    />
                    <button onClick={() => sendChatMut.mutate()} disabled={!chatText.trim()||sendChatMut.isPending}
                      style={{ width:44,height:44,borderRadius:12,background:chatText.trim()?'linear-gradient(135deg,#6366f1,#4f46e5)':'rgba(99,102,241,0.1)',boxShadow:chatText.trim()?'0 0 16px rgba(99,102,241,0.4)':'none',border:'none',color:chatText.trim()?'#fff':'#818cf8',cursor:chatText.trim()?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.2s' }}>
                      <Send size={17}/>
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
