import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Swords, Plus, Clock, User, Trophy, X, Check, Zap } from 'lucide-react';
import { duelsApi, problemsApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SkeletonLine } from '../components/ui/Spinner';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import type { Duel, ProblemShort } from '../types';

function DuelCard({ duel, onAccept, onCancel }: {
  duel: Duel;
  onAccept?: (id: string) => void;
  onCancel?: (id: string) => void;
}) {
  const { user } = useAuthStore();
  const isChallenger = duel.challenger_id === user?.id;

  const statusColor: Record<string, string> = {
    pending:   'cyan',
    active:    'green',
    finished:  'gray',
    cancelled: 'gray',
  };

  return (
    <Card hover={duel.status === 'pending'} className="p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-900/30 border border-red-700/30 flex items-center justify-center">
            <Swords size={20} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">1v1 Duel</p>
            <p className="text-xs text-slate-500">{duel.time_limit_minutes}min limit</p>
          </div>
        </div>
        <Badge variant={statusColor[duel.status] as 'cyan' | 'green' | 'gray'}>
          {duel.status}
        </Badge>
      </div>

      <div className="flex items-center gap-2 mb-4 text-xs text-slate-400">
        <User size={12} />
        <span className="font-mono">{duel.challenger_id.slice(0, 8)}…</span>
        <Zap size={10} className="text-yellow-400 mx-1" />
        <span className="font-mono">{duel.opponent_id ? duel.opponent_id.slice(0, 8) + '…' : '???'}</span>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {formatDistanceToNow(new Date(duel.created_at), { addSuffix: true })}
        </span>
        {duel.winner_id && (
          <span className="flex items-center gap-1 text-yellow-400">
            <Trophy size={11} /> Winner: {duel.winner_id.slice(0, 8)}…
          </span>
        )}
      </div>

      {duel.status === 'pending' && (
        <div className="flex gap-2">
          {!isChallenger && onAccept && (
            <Button
              size="sm"
              icon={<Check size={14} />}
              onClick={() => onAccept(duel.id)}
              className="flex-1"
            >
              Accept
            </Button>
          )}
          {isChallenger && onCancel && (
            <Button
              size="sm"
              variant="danger"
              icon={<X size={14} />}
              onClick={() => onCancel(duel.id)}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

function CreateDuelModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [problemId, setProblemId] = useState('');
  const [timeLimit, setTimeLimit] = useState('30');

  const { data: problems } = useQuery({
    queryKey: ['problems', 'list'],
    queryFn: () => problemsApi.list({ limit: 50 }),
  });

  const createMut = useMutation({
    mutationFn: () => duelsApi.create({
      problem_id: problemId,
      time_limit_minutes: parseInt(timeLimit),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['duels'] });
      onClose();
    },
  });

  const problemOptions = [
    { value: '', label: 'Select a problem…' },
    ...(problems ?? []).map((p: ProblemShort) => ({ value: p.id, label: p.title })),
  ];

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
            <Swords size={18} className="text-red-400" /> Create Duel
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
        </div>

        <div className="flex flex-col gap-4">
          <Select
            label="Problem"
            options={problemOptions}
            value={problemId}
            onChange={e => setProblemId(e.target.value)}
          />
          <Select
            label="Time Limit"
            options={[
              { value: '15',  label: '15 minutes' },
              { value: '30',  label: '30 minutes' },
              { value: '45',  label: '45 minutes' },
              { value: '60',  label: '60 minutes' },
              { value: '90',  label: '90 minutes' },
            ]}
            value={timeLimit}
            onChange={e => setTimeLimit(e.target.value)}
          />
          <Button
            onClick={() => createMut.mutate()}
            loading={createMut.isPending}
            disabled={!problemId}
            icon={<Swords size={16} />}
            className="w-full mt-2"
            size="lg"
          >
            Create Duel
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export function Duels() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<'active' | 'mine'>('active');

  const { data: activeDuels, isLoading: activeLoading } = useQuery({
    queryKey: ['duels', 'active'],
    queryFn: () => duelsApi.listActive(0, 20),
    refetchInterval: 10_000,
  });

  const { data: myDuels, isLoading: myLoading } = useQuery({
    queryKey: ['duels', 'mine'],
    queryFn: () => duelsApi.mine(0, 20),
  });

  const acceptMut = useMutation({
    mutationFn: (id: string) => duelsApi.accept(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['duels'] }),
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => duelsApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['duels'] }),
  });

  const displayDuels = tab === 'active' ? activeDuels : myDuels;
  const isLoading    = tab === 'active' ? activeLoading : myLoading;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <Swords size={28} className="text-red-400" /> Duels
          </h1>
          <p className="text-slate-400">Challenge other users to 1v1 coding battles</p>
        </div>
        <Button onClick={() => setShowCreate(true)} icon={<Plus size={16} />}>
          Create Duel
        </Button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/60 border border-slate-800 rounded-xl p-1 w-fit mb-6">
        {(['active', 'mine'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all cursor-pointer ${
              tab === t ? 'bg-purple-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t === 'active' ? '⚔️ Open Duels' : '📋 My Duels'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i}><CardBody><SkeletonLine className="w-full h-32" /></CardBody></Card>
          ))}
        </div>
      ) : (displayDuels ?? []).length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          <Swords size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg mb-4">No duels found</p>
          <Button onClick={() => setShowCreate(true)} icon={<Plus size={16} />}>
            Create the first duel
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(displayDuels as Duel[])?.map(d => (
            <DuelCard
              key={d.id}
              duel={d}
              onAccept={id => acceptMut.mutate(id)}
              onCancel={id => cancelMut.mutate(id)}
            />
          ))}
        </div>
      )}

      {showCreate && <CreateDuelModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
