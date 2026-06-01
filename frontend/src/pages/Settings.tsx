import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Bell, Shield, Save, Camera } from 'lucide-react';
import { profilesApi, settingsApi, usersApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';

const TABS = [
  { id: 'profile',   icon: User,         label: 'Profile'       },
  { id: 'account',   icon: Shield,        label: 'Account'       },
  { id: 'settings',  icon: SettingsIcon,  label: 'Preferences'   },
  { id: 'notifs',    icon: Bell,          label: 'Notifications' },
];

export function Settings() {
  const [tab, setTab] = useState('profile');
  const { user, fetchMe } = useAuthStore();
  const qc = useQueryClient();

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
        <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
        <p className="text-slate-400">Manage your account preferences</p>
      </motion.div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-xl bg-emerald-900/30 border border-emerald-700/40 text-emerald-400 text-sm flex items-center gap-2"
        >
          <Save size={14} /> Changes saved successfully!
        </motion.div>
      )}

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 shrink-0 flex flex-col gap-1">
          {TABS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left ${
                tab === id
                  ? 'bg-purple-900/40 text-purple-300 border border-purple-700/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {tab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <h2 className="font-semibold text-white flex items-center gap-2"><User size={16} /> Public Profile</h2>
                </CardHeader>
                <CardBody className="flex flex-col gap-4">
                  {/* Avatar placeholder */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-700 to-cyan-600 flex items-center justify-center text-2xl font-black text-white">
                      {user?.username[0].toUpperCase()}
                    </div>
                    <Button variant="outline" size="sm" icon={<Camera size={14} />}>Change Avatar</Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input label="First Name" value={profileForm.first_name} onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })} placeholder="John" />
                    <Input label="Last Name"  value={profileForm.last_name}  onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })}  placeholder="Doe"  />
                  </div>
                  <Textarea label="Bio" value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder="Tell us about yourself…" rows={3} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Country" value={profileForm.country} onChange={e => setProfileForm({ ...profileForm, country: e.target.value })} placeholder="Russia" />
                    <Input label="City"    value={profileForm.city}    onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}    placeholder="Moscow" />
                  </div>
                  <Input label="GitHub URL"   value={profileForm.github_url}   onChange={e => setProfileForm({ ...profileForm, github_url: e.target.value })}   placeholder="https://github.com/username" />
                  <Input label="Website URL"  value={profileForm.website_url}  onChange={e => setProfileForm({ ...profileForm, website_url: e.target.value })}  placeholder="https://yoursite.com" />
                  <Button onClick={() => profileMut.mutate()} loading={profileMut.isPending} icon={<Save size={16} />}>Save Profile</Button>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {tab === 'account' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
              <Card>
                <CardHeader><h2 className="font-semibold text-white">Account Information</h2></CardHeader>
                <CardBody className="flex flex-col gap-4">
                  <Input label="Username" value={accountForm.username} onChange={e => setAccountForm({ ...accountForm, username: e.target.value })} />
                  <Input label="Email" type="email" value={accountForm.email} onChange={e => setAccountForm({ ...accountForm, email: e.target.value })} />
                  <Button onClick={() => accountMut.mutate()} loading={accountMut.isPending} icon={<Save size={16} />}>Save Account</Button>
                </CardBody>
              </Card>

              <Card>
                <CardHeader><h2 className="font-semibold text-white text-red-400">Danger Zone</h2></CardHeader>
                <CardBody>
                  <p className="text-slate-400 text-sm mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                  <Button variant="danger">Delete Account</Button>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {tab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
              <Card>
                <CardHeader><h2 className="font-semibold text-white">Preferences</h2></CardHeader>
                <CardBody className="flex flex-col gap-4">
                  <Select
                    label="Default Language"
                    options={[
                      { value: 'python', label: 'Python 3' },
                      { value: 'cpp',    label: 'C++ 17'  },
                    ]}
                    value={settings?.language ?? 'python'}
                    onChange={e => settingsMut.mutate({ language: e.target.value })}
                  />
                  <Select
                    label="Theme"
                    options={[
                      { value: 'dark',  label: 'Dark (Default)' },
                      { value: 'light', label: 'Light'           },
                    ]}
                    value={settings?.theme ?? 'dark'}
                    onChange={e => settingsMut.mutate({ theme: e.target.value })}
                  />
                </CardBody>
              </Card>
            </motion.div>
          )}

          {tab === 'notifs' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <CardHeader><h2 className="font-semibold text-white flex items-center gap-2"><Bell size={16} /> Notifications</h2></CardHeader>
                <CardBody className="flex flex-col gap-4">
                  {[
                    { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive contest reminders and duel challenges via email' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-white">{label}</p>
                        <p className="text-xs text-slate-400">{desc}</p>
                      </div>
                      <button
                        onClick={() => settingsMut.mutate({ [key]: !(settings as Record<string, boolean> | undefined)?.[key] })}
                        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                          (settings as Record<string, boolean> | undefined)?.[key] ? 'bg-purple-600' : 'bg-slate-700'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          (settings as Record<string, boolean> | undefined)?.[key] ? 'translate-x-5' : ''
                        }`} />
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
