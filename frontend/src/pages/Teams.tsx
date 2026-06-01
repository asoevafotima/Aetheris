import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Plus, X, Shield, Star } from 'lucide-react';
import { teamsApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';
import { SkeletonLine } from '../components/ui/Spinner';
import { formatDistanceToNow } from 'date-fns';
import type { Team } from '../types';

function TeamCard({ team }: { team: Team }) {
  return (
    <Link to={`/teams/${team.slug}`}>
      <Card hover className="p-5 h-full">
        <div className="flex items-start gap-3 mb-4">
          {team.avatar_url ? (
            <img src={team.avatar_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-700/30 flex items-center justify-center text-lg font-bold text-purple-300">
              {team.name[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{team.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-xs text-yellow-400">
                <Star size={10} className="fill-yellow-400" /> {Math.round(team.rating)}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-500">
                max {team.max_members} members
              </span>
            </div>
          </div>
        </div>
        {team.description && (
          <p className="text-sm text-slate-400 line-clamp-2 mb-3">{team.description}</p>
        )}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Users size={11} /> {team.is_public ? 'Public' : 'Private'}
          </span>
          <span>{formatDistanceToNow(new Date(team.created_at), { addSuffix: true })}</span>
        </div>
      </Card>
    </Link>
  );
}

function CreateTeamModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', description: '', is_public: true, max_members: 5 });
  const [error, setError] = useState('');

  const createMut = useMutation({
    mutationFn: () => teamsApi.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams'] }); onClose(); },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? 'Failed to create team');
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users size={18} className="text-purple-400" /> Create Team
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-700/40 text-red-400 text-sm">{error}</div>}

        <div className="flex flex-col gap-4">
          <Input
            label="Team Name"
            placeholder="e.g. AlgoMasters"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <Textarea
            label="Description"
            placeholder="Tell us about your team…"
            rows={3}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex items-center gap-3">
            <Input
              label="Max Members"
              type="number"
              min={2}
              max={10}
              value={form.max_members}
              onChange={e => setForm({ ...form, max_members: parseInt(e.target.value) })}
              className="flex-1"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Visibility</label>
              <button
                type="button"
                onClick={() => setForm({ ...form, is_public: !form.is_public })}
                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                  form.is_public
                    ? 'border-purple-600 bg-purple-900/30 text-purple-300'
                    : 'border-slate-700 bg-slate-800 text-slate-400'
                }`}
              >
                {form.is_public ? '🌐 Public' : '🔒 Private'}
              </button>
            </div>
          </div>
          <Button
            onClick={() => createMut.mutate()}
            loading={createMut.isPending}
            disabled={!form.name.trim()}
            icon={<Plus size={16} />}
            className="w-full mt-2"
            size="lg"
          >
            Create Team
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export function Teams() {
  const [showCreate, setShowCreate] = useState(false);

  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.list(0, 50),
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <Shield size={28} className="text-purple-400" /> Teams
          </h1>
          <p className="text-slate-400">Form teams and compete together in team olympiads</p>
        </div>
        <Button onClick={() => setShowCreate(true)} icon={<Plus size={16} />}>
          Create Team
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i}><CardBody><SkeletonLine className="w-full h-32" /></CardBody></Card>
          ))}
        </div>
      ) : (teams ?? []).length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          <Users size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg mb-4">No teams yet</p>
          <Button onClick={() => setShowCreate(true)} icon={<Plus size={16} />}>
            Create the first team
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(teams as Team[])?.map(t => <TeamCard key={t.id} team={t} />)}
        </div>
      )}

      {showCreate && <CreateTeamModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
