import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, Loader2, CheckCircle2, Zap } from 'lucide-react';
import { api } from '../services/api';
import { useCampusStore } from '../store/useCampusStore';

const QUICK_COMMANDS = [
  'Plan a seminar for 180 students tomorrow from 2 PM to 5 PM.',
  'Find unused classrooms right now.',
  'What happens if Auditorium 1 becomes unavailable tomorrow?',
  'Move the database lab — Lab C1 is under maintenance.',
  'Find a room for a faculty meeting for 12 people.',
  'Show conflicts for tomorrow afternoon.',
];

const STAGE_LABELS = [
  'Sensing Campus State & Intent',
  'Inspecting Digital Twin Resources',
  'Detecting Schedule & Capacity Conflicts',
  'Executing OR-Tools CP-SAT Optimization',
  'Synthesizing Explainable Decision & Policy Validation',
];

interface AICommandBarProps {
  onPlanGenerated?: (result: any) => void;
}

export const AICommandBar: React.FC<AICommandBarProps> = ({ onPlanGenerated }) => {
  const [prompt, setPrompt] = useState('Plan a seminar for 180 students tomorrow from 2 PM to 5 PM.');
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStages, setPipelineStages] = useState<any[]>([]);
  const { showToast, fetchDashboard, fetchResources } = useCampusStore();

  const handleExecute = async (overridePrompt?: string) => {
    const textToRun = overridePrompt || prompt;
    if (!textToRun.trim()) return;

    setIsLoading(true);
    setPipelineStages(STAGE_LABELS.map((name, i) => ({
      name, status: i === 0 ? 'IN_PROGRESS' : 'PENDING',
    })));

    try {
      const response = await api.planAndOptimize({ prompt: textToRun });
      setPipelineStages(response.pipelineStages || []);
      if (onPlanGenerated) onPlanGenerated(response);
      showToast('AI Orchestration completed. Scored candidate plans ready.', 'success');
      await fetchDashboard();
      await fetchResources();
    } catch (err) {
      showToast('Orchestration failed: ' + (err as Error).message, 'error');
      setPipelineStages([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 relative overflow-hidden shadow-2xl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Label */}
      <div className="flex items-center justify-between gap-2 text-xs font-mono text-cyan-400 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-bold tracking-wider uppercase text-white font-display text-sm">
            Ask CampusSynapse — Autonomous Orchestration AI
          </span>
        </div>
        <span className="px-3 py-1 rounded-full badge-glow-cyan text-[10px] font-bold flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-cyan-400" />
          OR-Tools CP-SAT + AI Engine
        </span>
      </div>

      {/* Search Input & Action */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleExecute(); }}
        className="flex items-center gap-3 relative z-10"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Plan a seminar for 180 students tomorrow from 2 PM to 5 PM..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 shadow-inner"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="shrink-0 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-2.5 shadow-glow-cyan transition duration-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>ORCHESTRATING...</span>
            </>
          ) : (
            <>
              <span>ORCHESTRATE</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Prompts List */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none relative z-10">
        <span className="font-mono text-[10px] text-slate-400 shrink-0 font-bold uppercase tracking-wider">Quick:</span>
        {QUICK_COMMANDS.map((cmd, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setPrompt(cmd); handleExecute(cmd); }}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-white transition text-[11px] font-medium whitespace-nowrap"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Execution Pipeline */}
      {pipelineStages.length > 0 && (
        <div className="mt-6 pt-5 border-t border-white/10 relative z-10 animate-fadeInUp">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
              Orchestration Execution Pipeline
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 status-pulse-dot" />
              LIVE TELEMETRY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {pipelineStages.slice(0, 4).map((stage, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 backdrop-blur-md"
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-100 truncate">{stage.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {stage.detail || 'Verified by Policy & Constraint Solver'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
