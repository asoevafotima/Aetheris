import { useRef, useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Bell, Shield, Save, Camera, Sun, Moon, Check } from 'lucide-react';
import { profilesApi, settingsApi, usersApi } from '../api/endpoints';
import { useAuthStore }  from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useT, LANGUAGES } from '../i18n';
import { BackgroundGraph } from '../components/BackgroundGraph';

export function Settings() {
  const [tab, setTab]   = useState('profile');
  const [saved, setSaved] = useState(false);
  const { user, fetchMe } = useAuthStore();
  const { theme, lang }   = useThemeStore();
  const dark = theme === 'dark';
  const t    = useT();
  const qc   = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pageBg    = dark ? '#04080f'                 : '#f1f5f9';
  const t1        = dark ? 'rgba(255,255,255,0.9)'   : 'rgba(0,0,0,0.88)';
  const t2        = dark ? 'rgba(255,255,255,0.45)'  : 'rgba(0,0,0,0.5)';
  const t3        = dark ? 'rgba(255,255,255,0.22)'  : 'rgba(0,0,0,0.28)';
  const cardBg    = dark ? 'rgba(6,12,28,0.75)'      : 'rgba(255,255,255,0.97)';
  const cardBord  = dark ? 'rgba(255,255,255,0.07)'  : 'rgba(0,0,0,0.08)';
  const inputBg   = dark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.04)';
  const inputBord = dark ? 'rgba(255,255,255,0.12)'  : 'rgba(0,0,0,0.12)';
  const chipBg    = dark ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.04)';
  const chipBord  = dark ? 'rgba(255,255,255,0.1)'   : 'rgba(0,0,0,0.09)';

  const inputSt = { width:'100%', background:inputBg, border:`1px solid ${inputBord}`, borderRadius:11, color:t1, fontSize:13, padding:'11px 13px', outline:'none', fontFamily:'inherit', boxSizing:'border-box' as const, transition:'border-color 0.15s' };
  const labelSt = { fontSize:11, fontWeight:800 as const, color:t3, textTransform:'uppercase' as const, letterSpacing:'0.08em' as const, display:'block' as const, marginBottom:8 };

  const { data: profile }  = useQuery({ queryKey:['profile','me'], queryFn:profilesApi.me });
  const { data: settingsData } = useQuery({ queryKey:['settings','me'], queryFn:settingsApi.me });

  const [pf, setPf] = useState({ first_name:'',last_name:'',bio:'',country:'',city:'',github_url:'',linkedin_url:'',website_url:'' });
  const [af, setAf] = useState({ username:'',email:'' });

  useEffect(() => {
    if (profile) setPf({ first_name:profile.first_name??'', last_name:profile.last_name??'', bio:profile.bio??'', country:profile.country??'', city:profile.city??'', github_url:profile.github_url??'', linkedin_url:profile.linkedin_url??'', website_url:profile.website_url??'' });
  }, [profile]);
  useEffect(() => { if (user) setAf({ username:user.username, email:user.email }); }, [user]);

  const showSaved = () => { setSaved(true); setTimeout(()=>setSaved(false), 2200); };
  const profileMut  = useMutation({ mutationFn:()=>profilesApi.updateMe(pf),   onSuccess:()=>{qc.invalidateQueries({queryKey:['profile','me']});showSaved();} });
  const accountMut  = useMutation({ mutationFn:()=>usersApi.updateMe({username:af.username,email:af.email}), onSuccess:()=>{fetchMe();showSaved();} });
  const settingsMut = useMutation({ mutationFn:(data:object)=>settingsApi.update(data), onSuccess:()=>showSaved() });
  const avatarMut   = useMutation({
    mutationFn:(file:File)=>profilesApi.uploadAvatar(file),
    onSuccess:()=>{ qc.invalidateQueries({queryKey:['profile','me']}); showSaved(); },
  });

  const TABS = [
    { id:'profile',  Icon:User,         label:t.settings.profile  },
    { id:'account',  Icon:Shield,        label:t.settings.account  },
    { id:'settings', Icon:SettingsIcon,  label:t.settings.prefs    },
    { id:'notifs',   Icon:Bell,          label:t.settings.notifs   },
  ];

  const Field = ({ label, value, onChange, type='text', placeholder='' }: { label:string;value:string;onChange:(v:string)=>void;type?:string;placeholder?:string }) => (
    <div>
      <label style={labelSt}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={inputSt}
        onFocus={e=>e.target.style.borderColor='rgba(99,102,241,0.5)'} onBlur={e=>e.target.style.borderColor=inputBord}/>
    </div>
  );

  const SaveBtn = ({ onClick, loading }: { onClick:()=>void; loading:boolean }) => (
    <button onClick={onClick} disabled={loading}
      style={{ display:'flex',alignItems:'center',gap:8,padding:'11px 22px',background:'linear-gradient(135deg,#6366f1,#4f46e5)',boxShadow:'0 0 22px rgba(99,102,241,0.35)',border:'none',borderRadius:12,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',transition:'transform 0.15s' }}
      onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'} onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
      <Save size={14}/> {loading ? t.common.loading : t.common.save}
    </button>
  );

  const avatarUrl = profile?.avatar_url
    ? (profile.avatar_url.startsWith('http') ? profile.avatar_url : `http://localhost:8000${profile.avatar_url}`)
    : null;

  return (
    <div style={{ position:'relative',minHeight:'calc(100vh - 56px)',background:pageBg }}>
      <BackgroundGraph noSphere light={!dark}/>

      <div style={{ position:'relative',zIndex:1,maxWidth:900,margin:'0 auto',padding:'36px 36px 60px' }}>

        {/* Header */}
        <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} transition={{duration:0.4}} style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:30,fontWeight:900,color:t1,margin:'0 0 6px',letterSpacing:'-0.02em' }}>{t.settings.title}</h1>
          <p style={{ fontSize:14,color:t2,margin:0 }}>{t.settings.subtitle}</p>
        </motion.div>

        {/* Saved toast */}
        {saved && (
          <motion.div initial={{opacity:0,y:-10,scale:0.95}} animate={{opacity:1,y:0,scale:1}}
            style={{ marginBottom:18,padding:'11px 16px',borderRadius:13,background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.3)',color:'#22c55e',fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:8 }}>
            <Check size={15}/> {t.settings.saved}
          </motion.div>
        )}

        <div style={{ display:'flex',gap:20 }}>
          {/* Tab sidebar */}
          <div style={{ width:210,flexShrink:0,display:'flex',flexDirection:'column',gap:4 }}>
            {TABS.map(({id,Icon,label})=>(
              <button key={id} onClick={()=>setTab(id)}
                style={{ display:'flex',alignItems:'center',gap:10,padding:'11px 14px',borderRadius:12,border:`1px solid ${tab===id?'rgba(99,102,241,0.35)':'transparent'}`,background:tab===id?'rgba(99,102,241,0.1)':'transparent',color:tab===id?'#818cf8':t2,fontSize:13,fontWeight:tab===id?700:500,cursor:'pointer',textAlign:'left',transition:'all 0.15s' }}
                onMouseEnter={e=>{if(tab!==id){e.currentTarget.style.background=chipBg;e.currentTarget.style.color=t1;}}}
                onMouseLeave={e=>{if(tab!==id){e.currentTarget.style.background='transparent';e.currentTarget.style.color=t2;}}}>
                <Icon size={16}/> {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex:1,display:'flex',flexDirection:'column',gap:16 }}>

            {/* Profile tab */}
            {tab==='profile' && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{ background:cardBg,border:`1px solid ${cardBord}`,borderRadius:20,overflow:'hidden',backdropFilter:'blur(24px)',boxShadow:dark?'none':'0 4px 24px rgba(0,0,0,0.06)' }}>
                <div style={{ height:2,background:'linear-gradient(90deg,#6366f1,#06b6d4,transparent)' }}/>
                <div style={{ padding:'24px',display:'flex',flexDirection:'column',gap:18 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                    <User size={16} color="#818cf8"/>
                    <span style={{ fontSize:15,fontWeight:700,color:t1 }}>{t.settings.profile}</span>
                  </div>

                  {/* Avatar */}
                  <div style={{ display:'flex',alignItems:'center',gap:16 }}>
                    <div style={{ width:72,height:72,borderRadius:16,overflow:'hidden',flexShrink:0,background:'linear-gradient(135deg,#6366f1,#06b6d4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:900,color:'#fff',boxShadow:'0 0 24px rgba(99,102,241,0.3)' }}>
                      {avatarUrl
                        ? <img src={avatarUrl} alt="avatar" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
                        : (user?.username[0].toUpperCase())
                      }
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }}
                      onChange={e=>{ const f=e.target.files?.[0]; if(f) avatarMut.mutate(f); e.target.value=''; }}/>
                    <button onClick={()=>fileInputRef.current?.click()} disabled={avatarMut.isPending}
                      style={{ display:'flex',alignItems:'center',gap:7,padding:'9px 16px',background:chipBg,border:`1px solid ${chipBord}`,borderRadius:11,color:t2,fontSize:13,fontWeight:600,cursor:'pointer' }}>
                      <Camera size={14}/> {avatarMut.isPending ? t.common.loading : t.settings.changePhoto}
                    </button>
                  </div>

                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
                    <Field label={t.settings.firstName} value={pf.first_name} onChange={v=>setPf({...pf,first_name:v})} placeholder="Иван"/>
                    <Field label={t.settings.lastName}  value={pf.last_name}  onChange={v=>setPf({...pf,last_name:v})}  placeholder="Иванов"/>
                  </div>

                  <div>
                    <label style={labelSt}>{t.settings.bio}</label>
                    <textarea value={pf.bio} onChange={e=>setPf({...pf,bio:e.target.value})} rows={3} placeholder="..." style={{...inputSt,resize:'none'}}
                      onFocus={e=>e.target.style.borderColor='rgba(99,102,241,0.5)'} onBlur={e=>e.target.style.borderColor=inputBord}/>
                  </div>

                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
                    <Field label={t.settings.country} value={pf.country} onChange={v=>setPf({...pf,country:v})} placeholder="Russia"/>
                    <Field label={t.settings.city}    value={pf.city}    onChange={v=>setPf({...pf,city:v})}    placeholder="Moscow"/>
                  </div>

                  <Field label="GitHub URL" value={pf.github_url} onChange={v=>setPf({...pf,github_url:v})} placeholder="https://github.com/username"/>
                  <Field label={t.settings.website}  value={pf.website_url} onChange={v=>setPf({...pf,website_url:v})} placeholder="https://yoursite.com"/>

                  <SaveBtn onClick={()=>profileMut.mutate()} loading={profileMut.isPending}/>
                </div>
              </motion.div>
            )}

            {/* Account tab */}
            {tab==='account' && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{ display:'flex',flexDirection:'column',gap:14 }}>
                <div style={{ background:cardBg,border:`1px solid ${cardBord}`,borderRadius:20,overflow:'hidden',backdropFilter:'blur(24px)',boxShadow:dark?'none':'0 4px 24px rgba(0,0,0,0.06)' }}>
                  <div style={{ height:2,background:'linear-gradient(90deg,#6366f1,#06b6d4,transparent)' }}/>
                  <div style={{ padding:'24px',display:'flex',flexDirection:'column',gap:16 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                      <Shield size={16} color="#818cf8"/>
                      <span style={{ fontSize:15,fontWeight:700,color:t1 }}>{t.settings.accountData}</span>
                    </div>
                    <Field label={t.settings.usernameLabel} value={af.username} onChange={v=>setAf({...af,username:v})}/>
                    <Field label={t.settings.emailLabel}    type="email" value={af.email} onChange={v=>setAf({...af,email:v})}/>
                    <SaveBtn onClick={()=>accountMut.mutate()} loading={accountMut.isPending}/>
                  </div>
                </div>

                <div style={{ background:cardBg,border:'1px solid rgba(239,68,68,0.2)',borderRadius:20,overflow:'hidden',backdropFilter:'blur(24px)' }}>
                  <div style={{ height:2,background:'linear-gradient(90deg,#ef4444,transparent)' }}/>
                  <div style={{ padding:'24px' }}>
                    <p style={{ fontSize:14,fontWeight:700,color:'#f87171',margin:'0 0 8px' }}>{t.settings.dangerZone}</p>
                    <p style={{ fontSize:13,color:t2,margin:'0 0 16px',lineHeight:1.5 }}>{t.settings.dangerDesc}</p>
                    <button style={{ padding:'9px 18px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:11,color:'#f87171',fontSize:13,fontWeight:700,cursor:'pointer',transition:'background 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.18)'}
                      onMouseLeave={e=>e.currentTarget.style.background='rgba(239,68,68,0.1)'}>
                      {t.settings.deleteAccount}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Preferences tab */}
            {tab==='settings' && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}}
                style={{ background:cardBg,border:`1px solid ${cardBord}`,borderRadius:20,overflow:'hidden',backdropFilter:'blur(24px)',boxShadow:dark?'none':'0 4px 24px rgba(0,0,0,0.06)' }}>
                <div style={{ height:2,background:'linear-gradient(90deg,#6366f1,#06b6d4,transparent)' }}/>
                <div style={{ padding:'24px',display:'flex',flexDirection:'column',gap:24 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                    <SettingsIcon size={16} color="#818cf8"/>
                    <span style={{ fontSize:15,fontWeight:700,color:t1 }}>{t.settings.prefs}</span>
                  </div>

                  {/* Theme */}
                  <div>
                    <p style={{ fontSize:11,fontWeight:800,color:t3,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12 }}>{t.settings.theme}</p>
                    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                      {([['light', t.settings.light, Sun],['dark', t.settings.dark, Moon]] as const).map(([th,label,Icon])=>(
                        <button key={th} onClick={()=>useThemeStore.getState().setTheme(th)}
                          style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:'14px',borderRadius:14,border:`2px solid ${theme===th?'#6366f1':chipBord}`,background:theme===th?'rgba(99,102,241,0.12)':chipBg,color:theme===th?'#818cf8':t2,fontSize:14,fontWeight:theme===th?700:500,cursor:'pointer',transition:'all 0.15s' }}>
                          <Icon size={16}/> {label}
                          {theme===th && <Check size={14} style={{ marginLeft:'auto' }}/>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language — 20 languages grid */}
                  <div>
                    <p style={{ fontSize:11,fontWeight:800,color:t3,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12 }}>{t.settings.language}</p>
                    <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8 }}>
                      {LANGUAGES.map(({ code, flag, name }) => (
                        <button key={code} onClick={()=>useThemeStore.getState().setLang(code)}
                          style={{ display:'flex',alignItems:'center',gap:7,padding:'10px 10px',borderRadius:12,border:`2px solid ${lang===code?'#6366f1':chipBord}`,background:lang===code?'rgba(99,102,241,0.12)':chipBg,color:lang===code?'#818cf8':t2,fontSize:12,fontWeight:lang===code?700:500,cursor:'pointer',transition:'all 0.15s',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>
                          <span style={{ fontSize:16,flexShrink:0 }}>{flag}</span>
                          <span style={{ overflow:'hidden',textOverflow:'ellipsis' }}>{name}</span>
                          {lang===code && <Check size={12} style={{ marginLeft:'auto',flexShrink:0 }}/>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications tab */}
            {tab==='notifs' && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}}
                style={{ background:cardBg,border:`1px solid ${cardBord}`,borderRadius:20,overflow:'hidden',backdropFilter:'blur(24px)',boxShadow:dark?'none':'0 4px 24px rgba(0,0,0,0.06)' }}>
                <div style={{ height:2,background:'linear-gradient(90deg,#6366f1,#06b6d4,transparent)' }}/>
                <div style={{ padding:'24px' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:20 }}>
                    <Bell size={16} color="#818cf8"/>
                    <span style={{ fontSize:15,fontWeight:700,color:t1 }}>{t.settings.notifs}</span>
                  </div>
                  {[
                    { key:'email_notifications', label:t.settings.emailNotifs, desc:t.settings.emailNotifsDesc },
                  ].map(({key,label,desc})=>{
                    const on = (settingsData as Record<string,boolean>|undefined)?.[key];
                    return (
                      <div key={key} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 0',borderBottom:`1px solid ${cardBord}` }}>
                        <div>
                          <p style={{ fontSize:14,fontWeight:600,color:t1,margin:'0 0 3px' }}>{label}</p>
                          <p style={{ fontSize:12,color:t3,margin:0 }}>{desc}</p>
                        </div>
                        <button onClick={()=>settingsMut.mutate({[key]:!on})}
                          style={{ position:'relative',width:46,height:26,borderRadius:13,background:on?'#6366f1':'rgba(255,255,255,0.1)',border:`1px solid ${on?'transparent':chipBord}`,cursor:'pointer',flexShrink:0,transition:'background 0.2s' }}>
                          <span style={{ position:'absolute',top:2,left:on?22:2,width:20,height:20,borderRadius:'50%',background:'#fff',transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}/>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
