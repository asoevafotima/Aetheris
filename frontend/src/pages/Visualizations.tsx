import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Play, SkipBack, Pause, ChevronRight } from 'lucide-react';
import { visApi } from '../api/endpoints';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';

// Built-in visualizations when no data from API
const BUILTIN_VISUALIZATIONS = [
  {
    id: 'bubble-sort',
    title: 'Bubble Sort',
    algorithm_name: 'bubble_sort',
    description: 'Step through the classic O(n²) sorting algorithm',
    steps_json: JSON.stringify(generateBubbleSortSteps([64, 34, 25, 12, 22, 11, 90])),
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    algorithm_name: 'binary_search',
    description: 'O(log n) search on a sorted array',
    steps_json: JSON.stringify(generateBinarySearchSteps([1,3,5,7,9,11,13,15,17,19], 13)),
  },
  {
    id: 'merge-sort',
    title: 'Merge Sort',
    algorithm_name: 'merge_sort',
    description: 'Divide and conquer O(n log n) sorting',
    steps_json: JSON.stringify(generateMergeSortSteps([38, 27, 43, 3, 9, 82, 10])),
  },
];

function generateBubbleSortSteps(arr: number[]) {
  const steps: { array: number[]; comparing: number[]; swapped: boolean; description: string }[] = [];
  const a = [...arr];
  const n = a.length;
  steps.push({ array: [...a], comparing: [], swapped: false, description: 'Initial array' });
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ array: [...a], comparing: [j, j + 1], swapped: false, description: `Comparing a[${j}]=${a[j]} with a[${j+1}]=${a[j+1]}` });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({ array: [...a], comparing: [j, j + 1], swapped: true, description: `Swapped! Now ${a[j]} and ${a[j+1]}` });
      }
    }
  }
  steps.push({ array: [...a], comparing: [], swapped: false, description: 'Sorted!' });
  return steps;
}

function generateBinarySearchSteps(arr: number[], target: number) {
  const steps: { array: number[]; low: number; high: number; mid: number; found: boolean; description: string }[] = [];
  let low = 0, high = arr.length - 1;
  steps.push({ array: [...arr], low, high, mid: -1, found: false, description: `Searching for ${target}` });
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    steps.push({ array: [...arr], low, high, mid, found: arr[mid] === target, description: `mid=${mid}, arr[mid]=${arr[mid]}` });
    if (arr[mid] === target) { steps.push({ array: [...arr], low, high, mid, found: true, description: `Found ${target} at index ${mid}!` }); break; }
    else if (arr[mid] < target) { low = mid + 1; steps.push({ array: [...arr], low, high, mid: -1, found: false, description: `Target is right, new low=${low}` }); }
    else { high = mid - 1; steps.push({ array: [...arr], low, high, mid: -1, found: false, description: `Target is left, new high=${high}` }); }
  }
  return steps;
}

function generateMergeSortSteps(arr: number[]) {
  const steps: { array: number[]; highlight: number[]; description: string }[] = [];
  steps.push({ array: [...arr], highlight: [], description: 'Initial array' });
  // Simplified visualization
  const sorted = [...arr].sort((a, b) => a - b);
  for (let i = 0; i < arr.length; i++) {
    steps.push({ array: [...sorted.slice(0, i + 1), ...arr.slice(i + 1)], highlight: [i], description: `Merging element ${sorted[i]}` });
  }
  steps.push({ array: sorted, highlight: [], description: 'Sorted!' });
  return steps;
}

function BubbleSortViz({ step }: { step: { array: number[]; comparing: number[]; swapped: boolean } }) {
  const max = Math.max(...step.array);
  return (
    <div className="flex items-end justify-center gap-1.5 h-40">
      {step.array.map((val, i) => (
        <motion.div
          key={i}
          layout
          className={`w-10 rounded-t-md flex items-end justify-center pb-1 transition-colors ${
            step.comparing.includes(i)
              ? step.swapped ? 'bg-emerald-500' : 'bg-yellow-500'
              : 'bg-purple-600'
          }`}
          style={{ height: `${(val / max) * 100}%` }}
        >
          <span className="text-xs font-mono text-white text-center" style={{ fontSize: 10 }}>{val}</span>
        </motion.div>
      ))}
    </div>
  );
}

function BinarySearchViz({ step }: { step: { array: number[]; low: number; high: number; mid: number; found: boolean } }) {
  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      {step.array.map((val, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-mono font-bold transition-all ${
            step.found && i === step.mid ? 'border-emerald-500 bg-emerald-900/40 text-emerald-300' :
            i === step.mid ? 'border-yellow-500 bg-yellow-900/40 text-yellow-300' :
            i >= step.low && i <= step.high ? 'border-purple-600 bg-purple-900/30 text-purple-300' :
            'border-slate-700 bg-slate-800/60 text-slate-500'
          }`}>
            {val}
          </div>
          <div className="flex gap-0.5 text-[9px] font-mono">
            {i === step.low  && <span className="text-cyan-400">L</span>}
            {i === step.mid  && <span className="text-yellow-400">M</span>}
            {i === step.high && <span className="text-cyan-400">H</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function MergeSortViz({ step }: { step: { array: number[]; highlight: number[] } }) {
  const max = Math.max(...step.array);
  return (
    <div className="flex items-end justify-center gap-1.5 h-40">
      {step.array.map((val, i) => (
        <motion.div
          key={i}
          layout
          className={`w-10 rounded-t-md flex items-end justify-center pb-1 transition-colors ${
            step.highlight.includes(i) ? 'bg-emerald-500' : 'bg-purple-600'
          }`}
          style={{ height: `${(val / max) * 100}%` }}
        >
          <span className="text-xs font-mono text-white text-center" style={{ fontSize: 10 }}>{val}</span>
        </motion.div>
      ))}
    </div>
  );
}

function VisualizationPlayer({ vis }: { vis: typeof BUILTIN_VISUALIZATIONS[0] }) {
  const steps = JSON.parse(vis.steps_json ?? '[]');
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const step = steps[stepIdx] ?? {};
  const isLast  = stepIdx >= steps.length - 1;
  const isFirst = stepIdx === 0;

  const prev = () => setStepIdx(Math.max(0, stepIdx - 1));
  const next = () => { if (!isLast) setStepIdx(stepIdx + 1); else setPlaying(false); };

  useState(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStepIdx(prev => {
        if (prev >= steps.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(id);
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Visualization area */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-8 min-h-60 flex flex-col items-center justify-center gap-4">
        <AnimatePresence mode="wait">
          {vis.algorithm_name === 'bubble_sort' && <BubbleSortViz step={step} />}
          {vis.algorithm_name === 'binary_search' && <BinarySearchViz step={step} />}
          {vis.algorithm_name === 'merge_sort' && <MergeSortViz step={step} />}
        </AnimatePresence>
        <p className="text-sm text-slate-400 text-center">{step.description}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<SkipBack size={14} />} onClick={() => setStepIdx(0)} disabled={isFirst}>Reset</Button>
          <Button variant="outline" size="sm" onClick={prev} disabled={isFirst}>&lt;</Button>
          <Button size="sm" icon={playing ? <Pause size={14} /> : <Play size={14} />} onClick={() => setPlaying(!playing)}>
            {playing ? 'Pause' : 'Play'}
          </Button>
          <Button variant="outline" size="sm" onClick={next} disabled={isLast}>&gt;</Button>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Step {stepIdx + 1} / {steps.length}
        </span>
      </div>

      {/* Progress */}
      <div className="w-full bg-slate-800 rounded-full h-1.5">
        <div
          className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((stepIdx + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function Visualizations() {
  const [selected, setSelected] = useState(BUILTIN_VISUALIZATIONS[0].id);

  const { data: apiVis } = useQuery({
    queryKey: ['visualizations'],
    queryFn: visApi.list,
  });

  const normalizedApiVis = (apiVis ?? []).map((v: { id: string; title: string; algorithm_name: string; description?: string; steps_json?: string }) => ({
    ...v,
    description: v.description ?? '',
    steps_json: v.steps_json ?? '[]',
  }));
  const allVis = [...BUILTIN_VISUALIZATIONS, ...normalizedApiVis];
  const selectedVis = allVis.find(v => v.id === selected) ?? allVis[0];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
          <BarChart2 size={28} className="text-cyan-400" /> Algorithm Visualizations
        </h1>
        <p className="text-slate-400">Watch classic algorithms come to life step by step</p>
      </motion.div>

      <div className="flex gap-6">
        {/* Sidebar list */}
        <div className="w-56 shrink-0 flex flex-col gap-1.5">
          {allVis.map(v => (
            <button
              key={v.id}
              onClick={() => setSelected(v.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-all cursor-pointer ${
                selected === v.id
                  ? 'bg-purple-900/40 border border-purple-700/40 text-purple-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <BarChart2 size={14} className="shrink-0" />
              <span className="truncate">{v.title}</span>
              {selected === v.id && <ChevronRight size={12} className="ml-auto shrink-0" />}
            </button>
          ))}
        </div>

        {/* Main area */}
        <div className="flex-1">
          <Card>
            <CardBody className="p-6">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-white">{selectedVis.title}</h2>
                {selectedVis.description && (
                  <p className="text-slate-400 text-sm mt-1">{selectedVis.description}</p>
                )}
              </div>
              <VisualizationPlayer vis={selectedVis} />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
