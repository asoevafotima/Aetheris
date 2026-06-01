import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { motion } from 'framer-motion';
import { BookOpen, Plus, CheckSquare, Square, X } from 'lucide-react';
import { trainingApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';
import type { TrainingPlan } from '../types';

function PlanCard({ plan }: { plan: TrainingPlan }) {
  const [open, setOpen] = useState(false);

  const { data: items } = useQuery({
    queryKey: ['training-items', plan.id],
    queryFn: () => trainingApi.items(plan.id),
    enabled: open,
  });

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-white/3 transition-colors cursor-pointer"
      >
        <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-700/30 flex items-center justify-center shrink-0">
          <BookOpen size={18} className="text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white">{plan.title}</p>
          {plan.description && <p className="text-sm text-slate-400 truncate">{plan.description}</p>}
        </div>
        <span className="text-xs text-slate-500">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }}>
          <div className="border-t border-slate-800 p-4">
            {!items || (items as unknown[]).length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No items in this plan yet</p>
            ) : (
              <div className="flex flex-col gap-2">
                {(items as { id: string; is_completed?: boolean; problem_id?: string; note?: string }[]).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700">
                    {item.is_completed
                      ? <CheckSquare size={16} className="text-emerald-400 shrink-0" />
                      : <Square size={16} className="text-slate-500 shrink-0" />
                    }
                    <span className={`text-sm flex-1 ${item.is_completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                      {item.note ?? item.problem_id ?? 'Item'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </Card>
  );
}

function CreatePlanModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: '', description: '' });

  const createMut = useMutation({
    mutationFn: () => trainingApi.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['training-plans'] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen size={18} className="text-purple-400" /> New Training Plan
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
        </div>
        <div className="flex flex-col gap-4">
          <Input label="Plan Title" placeholder="e.g. Dynamic Programming Mastery" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description" placeholder="What will you study?" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <Button onClick={() => createMut.mutate()} loading={createMut.isPending} disabled={!form.title.trim()} icon={<Plus size={16} />} className="w-full" size="lg">Create Plan</Button>
        </div>
      </motion.div>
    </div>
  );
}

export function Training() {
  const [showCreate, setShowCreate] = useState(false);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['training-plans'],
    queryFn: trainingApi.list,
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <BookOpen size={28} className="text-emerald-400" /> Training Plans
          </h1>
          <p className="text-slate-400">Structured learning paths for competitive programming</p>
        </div>
        <Button onClick={() => setShowCreate(true)} icon={<Plus size={16} />}>New Plan</Button>
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array(3).fill(0).map((_, i) => <Card key={i}><CardBody className="h-16 shimmer" /></Card>)}
        </div>
      ) : (plans as TrainingPlan[] ?? []).length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg mb-4">No training plans yet</p>
          <Button onClick={() => setShowCreate(true)} icon={<Plus size={16} />}>Create your first plan</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(plans as TrainingPlan[]).map(p => <PlanCard key={p.id} plan={p} />)}
        </div>
      )}

      {showCreate && <CreatePlanModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
