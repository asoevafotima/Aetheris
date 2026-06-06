import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Users, Search, ChevronDown, Check,
  UserCog, Crown, Ban, CheckCircle2, X,
} from 'lucide-react';
import { usersApi } from '../api/endpoints';
import { useAuthStore }  from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useT }          from '../i18n';
import { Navigate }      from 'react-router-dom';
import { format }        from 'date-fns';
import { ru }            from 'date-fns/locale';
import api               from '../api/client';
import type { User }     from '../types';
import { BackgroundGraph } from '../components/BackgroundGraph';

const ROLE_CFG = {
  admin:     { label: 'Администратор', color: '#f87171', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)',  grad: 'linear-gradient(135deg,#ef4444,#dc2626)', icon: Crown     },
  moderator: { label: 'Модератор',     color: '#22d3ee', bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.35)',  grad: 'linear-gradient(135deg,#06b6d4,#0891b2)', icon: ShieldCheck },
  user:      { label: 'Участник',      color: '#818cf8', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.25)', grad: 'linear-gradient(135deg,#6366f1,#4f46e5)', icon: Users     },
};

function RoleDropdown({ user: u, dark, onChangeRole }: {
  user: User; dark: boolean; onChangeRole: (id: string, role: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const cfg = ROLE_CFG[u.role as keyof typeof ROLE_CFG] ?? ROLE_CFG.user;
  const dropBg   = dark ? 'rgba(6,12,28,0.98)' : 'rgba(255,255,255,0.99)';
  const dropBord = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const hoverBg  = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const t1       = dark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)';

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 10,
          background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
          fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
        {cfg.label} <ChevronDown size={11} style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }}/>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)}/>
            <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }} transition={{ duration: 0.12 }}
              style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 20, width: 180,
                borderRadius: 14, background: dropBg, border: `1px solid ${dropBord}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)', overflow: 'hidden', backdropFilter: 'blur(24px)' }}>
              {Object.entries(ROLE_CFG).map(([val, rc]) => (
                <button key={val} onClick={() => { onChangeRole(u.id, val); setOpen(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer',
                    color: t1, fontSize: 13, transition: 'background 0.12s', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: rc.color, flexShrink: 0 }}/>
                    <span style={{ color: rc.color, fontWeight: 600 }}>{rc.label}</span>
                  </span>
                  {u.role === val && <Check size={13} style={{ color: '#818cf8' }}/>}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AdminPanel() {
  const { user: me }    = useAuthStore();
  const { theme }       = useThemeStore();
  const t               = useT();
  const dark            = theme === 'dark';
  const qc              = useQueryClient();
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  if (me?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  // ── tokens ──
  const pageBg   = dark ? '#04080f'                : '#f1f5f9';
  const t1       = dark ? 'rgba(255,255,255,0.9)'  : 'rgba(0,0,0,0.88)';
  const t2       = dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
  const t3       = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.28)';
  const cardBg   = dark ? 'rgba(6,12,28,0.75)'     : 'rgba(255,255,255,0.97)';
  const cardBord = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const rowHov   = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const inputBg  = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const inputBord= dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.12)';
  const chipBg   = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const chipBord = dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.09)';

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => usersApi.list(0, 200),
    staleTime: 0,
  });

  const changeRoleMut = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.patch(`/users/${id}/role`, { role }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users', 'all'] }),
  });

  const toggleActiveMut = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      api.patch(`/users/${id}/active`, { is_active }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users', 'all'] }),
  });

  const allUsers = (users ?? []) as User[];
  const filtered = allUsers.filter(u => {
    const q = search.toLowerCase();
    return (!q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      && (!roleFilter || u.role === roleFilter);
  });

  const stats = [
    { label: 'Всего', value: allUsers.length,                                          color: '#818cf8', grad: 'linear-gradient(135deg,#6366f1,#4f46e5)' },
    { label: 'Админов',    value: allUsers.filter(u => u.role === 'admin').length,      color: '#f87171', grad: 'linear-gradient(135deg,#ef4444,#dc2626)' },
    { label: 'Модераторов',value: allUsers.filter(u => u.role === 'moderator').length,  color: '#22d3ee', grad: 'linear-gradient(135deg,#06b6d4,#0891b2)' },
    { label: 'Участников', value: allUsers.filter(u => u.role === 'user').length,       color: '#34d399', grad: 'linear-gradient(135deg,#10b981,#059669)' },
  ];

  const TABS = [
    { v: '',          l: 'Все'            },
    { v: 'admin',     l: 'Администраторы' },
    { v: 'moderator', l: 'Модераторы'     },
    { v: 'user',      l: 'Участники'      },
  ];

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 56px)', background: pageBg }}>
      <BackgroundGraph noSphere light={!dark}/>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '36px 36px 60px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(239,68,68,0.15)' }}>
              <ShieldCheck size={20} color="#f87171"/>
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: t1, margin: 0, letterSpacing: '-0.02em' }}>
                Панель администратора
              </h1>
              <p style={{ fontSize: 14, color: t2, margin: 0 }}>Управление пользователями и ролями</p>
            </div>
          </div>
        </motion.div>

        {/* Stat cards */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, duration: 0.4 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.04, duration: 0.35 }}
              style={{ background: cardBg, border: `1px solid ${cardBord}`, borderRadius: 18,
                overflow: 'hidden', backdropFilter: 'blur(24px)', boxShadow: dark ? 'none' : '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ height: 2, background: s.grad }}/>
              <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: s.grad,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 16px ${s.color}40`, flexShrink: 0 }}>
                  <Users size={18} color="#fff"/>
                </div>
                <div>
                  <p style={{ fontSize: 26, fontWeight: 900, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: 12, color: t3, margin: '3px 0 0', fontWeight: 600 }}>{s.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Roles info card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
          style={{ background: dark ? 'rgba(6,12,28,0.6)' : 'rgba(99,102,241,0.05)',
            border: `1px solid ${dark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'}`,
            borderRadius: 18, padding: '16px 22px', marginBottom: 24, backdropFilter: 'blur(24px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <UserCog size={15} color="#818cf8"/>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#818cf8' }}>Права ролей</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {Object.entries(ROLE_CFG).map(([, rc]) => (
              <div key={rc.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ padding: '3px 10px', borderRadius: 8, background: rc.bg, color: rc.color,
                  border: `1px solid ${rc.border}`, fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0, marginTop: 1 }}>
                  {rc.label}
                </span>
                <p style={{ fontSize: 12, color: t2, margin: 0, lineHeight: 1.5 }}>
                  {rc.label === 'Администратор' && 'Полный доступ: задачи, контесты, пользователи.'}
                  {rc.label === 'Модератор'     && 'Создание задач и контестов, проверка решений.'}
                  {rc.label === 'Участник'      && 'Решает задачи, участвует в контестах и дуэлях.'}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
          style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: t3, pointerEvents: 'none' }}/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по логину или email..."
              style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 10, paddingBottom: 10,
                background: inputBg, border: `1px solid ${inputBord}`, borderRadius: 12,
                color: t1, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const }}
              onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
              onBlur={e  => e.target.style.borderColor = inputBord}/>
          </div>

          {/* Role tabs */}
          <div style={{ display: 'flex', gap: 4, background: chipBg, border: `1px solid ${chipBord}`, borderRadius: 12, padding: 4 }}>
            {TABS.map(tab => (
              <button key={tab.v} onClick={() => setRoleFilter(tab.v)}
                style={{ padding: '7px 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: 'none', transition: 'all 0.15s',
                  background: roleFilter === tab.v ? 'rgba(99,102,241,0.2)' : 'transparent',
                  color:      roleFilter === tab.v ? '#818cf8' : t2 }}>
                {tab.l}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Users table */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}
          style={{ background: cardBg, border: `1px solid ${cardBord}`, borderRadius: 20,
            overflow: 'hidden', backdropFilter: 'blur(24px)', boxShadow: dark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ height: 2, background: 'linear-gradient(90deg,#6366f1,#06b6d4,transparent)' }}/>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${cardBord}` }}>
                  {['Пользователь', 'Email', 'Дата', 'Статус', 'Роль', 'Действия'].map(h => (
                    <th key={h} style={{ padding: '13px 18px', textAlign: 'left', fontSize: 11,
                      fontWeight: 800, color: t3, textTransform: 'uppercase', letterSpacing: '0.07em',
                      background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array(6).fill(0).map((_, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${cardBord}` }}>
                        {Array(6).fill(0).map((_, j) => (
                          <td key={j} style={{ padding: '14px 18px' }}>
                            <div style={{ height: 14, borderRadius: 7, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                              width: j === 0 ? 140 : j === 1 ? 160 : 80 }}/>
                          </td>
                        ))}
                      </tr>
                    ))
                  : filtered.map((u: User, i) => {
                      const rc = ROLE_CFG[u.role as keyof typeof ROLE_CFG] ?? ROLE_CFG.user;
                      const isMe = u.id === me?.id;
                      return (
                        <motion.tr key={u.id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.025 }}
                          style={{ borderBottom: `1px solid ${cardBord}`, transition: 'background 0.12s',
                            background: isMe ? (dark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)') : 'transparent' }}
                          onMouseEnter={e => { if (!isMe) (e.currentTarget as HTMLElement).style.background = rowHov; }}
                          onMouseLeave={e => { if (!isMe) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>

                          {/* User */}
                          <td style={{ padding: '13px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                background: rc.grad ?? 'linear-gradient(135deg,#6366f1,#4f46e5)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 15, fontWeight: 900, color: '#fff',
                                boxShadow: `0 0 12px ${rc.color}40` }}>
                                {u.username[0].toUpperCase()}
                              </div>
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: t1, margin: 0 }}>
                                  {u.username}
                                  {isMe && <span style={{ marginLeft: 7, fontSize: 10, color: '#818cf8', fontWeight: 700 }}>(вы)</span>}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td style={{ padding: '13px 18px', fontSize: 13, color: t2 }}>{u.email}</td>

                          {/* Date */}
                          <td style={{ padding: '13px 18px', fontSize: 12, color: t3, whiteSpace: 'nowrap' }}>
                            {u.created_at ? format(new Date(u.created_at), 'd MMM yyyy', { locale: ru }) : '—'}
                          </td>

                          {/* Active */}
                          <td style={{ padding: '13px 18px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px',
                              borderRadius: 8, fontSize: 11, fontWeight: 700,
                              background: u.is_active ? 'rgba(34,197,94,0.12)'  : 'rgba(100,116,139,0.1)',
                              color:      u.is_active ? '#22c55e'               : t3,
                              border: `1px solid ${u.is_active ? 'rgba(34,197,94,0.3)' : 'rgba(100,116,139,0.2)'}` }}>
                              {u.is_active ? <CheckCircle2 size={10}/> : <Ban size={10}/>}
                              {u.is_active ? 'Активен' : 'Отключён'}
                            </span>
                          </td>

                          {/* Role */}
                          <td style={{ padding: '13px 18px' }}>
                            {isMe
                              ? <span style={{ fontSize: 11, color: t3, fontStyle: 'italic' }}>себя нельзя</span>
                              : <RoleDropdown user={u} dark={dark} onChangeRole={(id, role) => changeRoleMut.mutate({ id, role })}/>
                            }
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '13px 18px' }}>
                            {!isMe && (
                              <button
                                onClick={() => toggleActiveMut.mutate({ id: u.id, is_active: !u.is_active })}
                                title={u.is_active ? 'Отключить' : 'Активировать'}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  width: 32, height: 32, borderRadius: 9, cursor: 'pointer', transition: 'all 0.15s',
                                  border: `1px solid ${u.is_active ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                                  background: u.is_active ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
                                  color: u.is_active ? '#f87171' : '#22c55e' }}>
                                {u.is_active ? <X size={13}/> : <CheckCircle2 size={13}/>}
                              </button>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })
                }
              </tbody>
            </table>

            {!isLoading && filtered.length === 0 && (
              <div style={{ padding: '60px 0', textAlign: 'center' }}>
                <Users size={40} style={{ margin: '0 auto 12px', color: t3, opacity: 0.4 }}/>
                <p style={{ color: t3, fontSize: 14 }}>Пользователи не найдены</p>
              </div>
            )}
          </div>

          <div style={{ padding: '12px 20px', borderTop: `1px solid ${cardBord}`,
            fontSize: 12, color: t3, textAlign: 'right' }}>
            Показано {filtered.length} из {allUsers.length} пользователей
          </div>
        </motion.div>
      </div>
    </div>
  );
}
