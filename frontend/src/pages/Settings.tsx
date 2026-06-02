import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Bell, Shield, Save, Camera, Sun, Moon, Globe } from 'lucide-react';
import { profilesApi, settingsApi, usersApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useT } from '../i18n';

const TABS = (t: ReturnType<typeof useT>) => [
  { id: 'profile',   icon: User,         label: t.settings.profile },
  { id: 'account',   icon: Shield,       label: t.settings.account },
  { id: 'settings',  icon: SettingsIcon, label: t.settings.prefs   },
  { id: 'notifs',    icon: Bell,         label: t.settings.notifs  },
];

export function Settings() {
  const [tab, setTab] = useState('profile');
  const { user, fetchMe } = useAuthStore();
  const { theme, lang } = useThemeStore();
  const t  = useT();
  const qc = useQueryClient();
  const tabs = TABS(t);

  const { data: profile } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: profilesApi.me,
  });

  const { data: settings } = useQuery({
    queryKey: ['settings', 'me'],
    queryFn: settingsApi.me,
  });

  const [profileForm, setProfileForm] = useState({
    first_name: '', last_name: '', bio: '', country: '', city: '',
    github_url: '', linkedin_url: '', website_url: '',
  });

  const [accountForm, setAccountForm] = useState({ username: '', email: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        first_name:   profile.first_name   ?? '',
        last_name:    profile.last_name    ?? '',
        bio:          profile.bio          ?? '',
        country:      profile.country      ?? '',
        city:         profile.city         ?? '',
        github_url:   profile.github_url   ?? '',
        linkedin_url: profile.linkedin_url ?? '',
        website_url:  profile.website_url  ?? '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user) setAccountForm({ username: user.username, email: user.email });
  }, [user]);

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const profileMut = useMutation({
    mutationFn: () => profilesApi.updateMe(profileForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['profile', 'me'] }); showSaved(); },
  });

  const accountMut = useMutation({
    mutationFn: () => usersApi.updateMe({ username: accountForm.username, email: accountForm.email }),
    onSuccess: () => { fetchMe(); showSaved(); },
  });

  const settingsMut = useMutation({
    mutationFn: (data: object) => settingsApi.update(data),
    onSuccess: () => showSaved(),
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-app-1 mb-1">{t.settings.title}</h1>
        <p className="text-app-2">{t.settings.subtitle}</p>
      </motion.div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-700 text-sm flex items-center gap-2">
          <Save size={14} /> {t.settings.saved}
        </motion.div>
      )}

      <div className="flex gap-6">
        {/* Tab list */}
        <div className="w-48 shrink-0 flex flex-col gap-1">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left border ${
                tab === id
                  ? 'bg-[var(--accent-light)] text-[var(--accent-text)] border-[var(--accent-light)]'
                  : 'text-app-2 hover:text-app-1 hover:bg-[var(--hover)] border-transparent'
              }`}
            >
              <Icon size={16} />{label}
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col gap-4">
          {/* Профиль */}
          {tab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
              <Card>
                <CardHeader><h2 className="font-semibold text-app-1 flex items-center gap-2"><User size={16} /> {t.settings.profile}</h2></CardHeader>
                <CardBody className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-2xl font-black text-white">
                      {user?.username[0].toUpperCase()}
                    </div>
                    <Button variant="outline" size="sm" icon={<Camera size={14} />}>
                      {lang === 'ru' ? 'Сменить фото' : 'Change Avatar'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label={lang === 'ru' ? 'Имя' : 'First Name'} value={profileForm.first_name} onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })} placeholder="Иван" />
                    <Input label={lang === 'ru' ? 'Фамилия' : 'Last Name'} value={profileForm.last_name} onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })} placeholder="Иванов" />
                  </div>
                  <Textarea label={lang === 'ru' ? 'О себе' : 'Bio'} value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder={lang === 'ru' ? 'Расскажи о себе…' : 'Tell us about yourself…'} rows={3} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label={lang === 'ru' ? 'Страна' : 'Country'} value={profileForm.country} onChange={e => setProfileForm({ ...profileForm, country: e.target.value })} placeholder="Россия" />
                    <Input label={lang === 'ru' ? 'Город' : 'City'} value={profileForm.city} onChange={e => setProfileForm({ ...profileForm, city: e.target.value })} placeholder="Москва" />
                  </div>
                  <Input label="GitHub URL" value={profileForm.github_url} onChange={e => setProfileForm({ ...profileForm, github_url: e.target.value })} placeholder="https://github.com/username" />
                  <Input label={lang === 'ru' ? 'Личный сайт' : 'Website URL'} value={profileForm.website_url} onChange={e => setProfileForm({ ...profileForm, website_url: e.target.value })} placeholder="https://yoursite.com" />
                  <Button onClick={() => profileMut.mutate()} loading={profileMut.isPending} icon={<Save size={16} />}>{t.common.save}</Button>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* Аккаунт */}
          {tab === 'account' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
              <Card>
                <CardHeader><h2 className="font-semibold text-app-1">{lang === 'ru' ? 'Данные аккаунта' : 'Account Information'}</h2></CardHeader>
                <CardBody className="flex flex-col gap-4">
                  <Input label={lang === 'ru' ? 'Логин' : 'Username'} value={accountForm.username} onChange={e => setAccountForm({ ...accountForm, username: e.target.value })} />
                  <Input label="Email" type="email" value={accountForm.email} onChange={e => setAccountForm({ ...accountForm, email: e.target.value })} />
                  <Button onClick={() => accountMut.mutate()} loading={accountMut.isPending} icon={<Save size={16} />}>{t.common.save}</Button>
                </CardBody>
              </Card>
              <Card>
                <CardHeader><h2 className="font-semibold text-red-600">{lang === 'ru' ? 'Опасная зона' : 'Danger Zone'}</h2></CardHeader>
                <CardBody>
                  <p className="text-app-2 text-sm mb-4">{lang === 'ru' ? 'После удаления аккаунта восстановить его невозможно.' : 'Once deleted, your account cannot be recovered.'}</p>
                  <Button variant="danger">{lang === 'ru' ? 'Удалить аккаунт' : 'Delete Account'}</Button>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* Предпочтения — тема и язык */}
          {tab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
              <Card>
                <CardHeader><h2 className="font-semibold text-app-1">{t.settings.prefs}</h2></CardHeader>
                <CardBody className="flex flex-col gap-5">
                  {/* Тема */}
                  <div>
                    <p className="text-sm font-medium text-app-2 mb-3">{t.settings.theme}</p>
                    <div className="flex gap-3">
                      {(['light', 'dark'] as const).map(th => (
                        <button key={th} onClick={() => useThemeStore.getState().setTheme(th)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                            theme === th
                              ? 'border-purple-500 bg-[var(--accent-light)] text-[var(--accent-text)]'
                              : 'border-[var(--border)] text-app-2 hover:border-[var(--border-2)]'
                          }`}
                        >
                          {th === 'light' ? <Sun size={16} /> : <Moon size={16} />}
                          {th === 'light' ? t.settings.light : t.settings.dark}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Язык */}
                  <div>
                    <p className="text-sm font-medium text-app-2 mb-3">{t.settings.language}</p>
                    <div className="flex gap-3">
                      {(['ru', 'en'] as const).map(l => (
                        <button key={l} onClick={() => useThemeStore.getState().setLang(l)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                            lang === l
                              ? 'border-purple-500 bg-[var(--accent-light)] text-[var(--accent-text)]'
                              : 'border-[var(--border)] text-app-2 hover:border-[var(--border-2)]'
                          }`}
                        >
                          <Globe size={16} />
                          {l === 'ru' ? '🇷🇺 Русский' : '🇬🇧 English'}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* Уведомления */}
          {tab === 'notifs' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <CardHeader>
                  <h2 className="font-semibold text-app-1 flex items-center gap-2"><Bell size={16} /> {t.settings.notifs}</h2>
                </CardHeader>
                <CardBody className="flex flex-col gap-4">
                  {[{ key: 'email_notifications', label: lang === 'ru' ? 'Email уведомления' : 'Email Notifications', desc: lang === 'ru' ? 'Получать напоминания о контестах и вызовах на дуэль' : 'Receive contest reminders and duel challenges' }].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-app-1">{label}</p>
                        <p className="text-xs text-app-3">{desc}</p>
                      </div>
                      <button
                        onClick={() => settingsMut.mutate({ [key]: !(settings as Record<string, boolean> | undefined)?.[key] })}
                        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${(settings as Record<string, boolean> | undefined)?.[key] ? 'bg-purple-600' : 'bg-[var(--border-2)]'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${(settings as Record<string, boolean> | undefined)?.[key] ? 'translate-x-5' : ''}`} />
                      </button>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
