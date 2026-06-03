import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { authApi } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Пароли не совпадают'); return; }
    if (form.password.length < 6) { setError('Пароль минимум 6 символов'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.register({ username: form.username, email: form.email, password: form.password });
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Ошибка регистрации');
    } finally { setLoading(false); }
  };

  const iStyle: React.CSSProperties = {
    width:'100%', background:'var(--bg-2,#08080f)', border:'1px solid var(--border)',
    borderRadius:10, padding:'11px 12px 11px 38px', color:'var(--text-1)', fontSize:14,
    outline:'none', transition:'border-color 0.15s, box-shadow 0.15s', fontFamily:'Inter,sans-serif',
  };
  const fo = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--glow)'; };
  const bl = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, position:'relative', overflow:'hidden' }}>
      <div className="hero-glow-left" />
      <div className="hero-glow-right" />

      <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.45,ease:'easeOut'}}
        style={{width:'100%',maxWidth:420,position:'relative',zIndex:1}}>

        <div style={{textAlign:'center',marginBottom:32}}>
          <Link to="/" style={{display:'inline-flex',alignItems:'center',gap:10,textDecoration:'none',marginBottom:24}}>
            <div style={{width:44,height:44,borderRadius:14,background:'linear-gradient(135deg,#7c3aed,#6d28d9)',display:'flex',alignItems:'center',justifyContent:'center'}} className="glow-pulse">
              <Zap size={20} color="#fff"/>
            </div>
            <span style={{fontSize:24,fontWeight:900,letterSpacing:'-0.03em'}} className="gradient-text">Aetheris</span>
          </Link>
          <h1 style={{fontSize:22,fontWeight:700,color:'var(--text-1)',letterSpacing:'-0.02em',marginBottom:6}}>Создать аккаунт</h1>
          <p style={{fontSize:14,color:'var(--text-3)'}}>Присоединяйся к тысячам программистов</p>
        </div>

        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:32,backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)'}}>
          {error && (
            <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
              style={{marginBottom:16,padding:'10px 14px',borderRadius:10,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171',fontSize:13}}>
              ⚠ {error}
            </motion.div>
          )}
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:14}}>
            {[
              {label:'Логин',      type:'text',     ph:'your_handle',          val:form.username, Icon:User, key:'username'},
              {label:'Email',      type:'email',    ph:'you@example.com',      val:form.email,    Icon:Mail, key:'email'},
              {label:'Пароль',     type:'password', ph:'Минимум 6 символов',   val:form.password, Icon:Lock, key:'password'},
              {label:'Повторите',  type:'password', ph:'Повторите пароль',     val:form.confirm,  Icon:Lock, key:'confirm'},
            ].map(({label,type,ph,val,Icon,key})=>(
              <div key={key} style={{display:'flex',flexDirection:'column',gap:6}}>
                <label style={{fontSize:12,fontWeight:500,color:'var(--text-2)'}}>{label}</label>
                <div style={{position:'relative'}}>
                  <Icon size={15} color="var(--text-3)" style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}/>
                  <input type={type} placeholder={ph} required value={val}
                    onChange={e=>setForm({...form,[key]:e.target.value})}
                    style={iStyle} onFocus={fo} onBlur={bl}/>
                </div>
              </div>
            ))}
            <Button type="submit" loading={loading} size="lg" className="w-full mt-2">Зарегистрироваться</Button>
          </form>
          <p style={{textAlign:'center',marginTop:20,fontSize:13,color:'var(--text-3)'}}>
            Уже есть аккаунт?{' '}
            <Link to="/login" style={{color:'var(--accent-text,#a78bfa)',fontWeight:600,textDecoration:'none'}}>Войти</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
