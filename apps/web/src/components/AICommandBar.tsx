import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
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
    <div className="command-bar p-5 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/4 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/4 rounded-full blur-[60px] pointer-events-none" />

      {/* Label */}
      <div className="flex items-center gap-2 text-[10px] font-mono text-blue-400 mb-3">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span className="font-bold tracking-widest uppercase">Ask CampusSynapse — Autonomous Orchestration Interface</span>
        <span className="ml-auto px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[9px]">
          OR-Tools + AI
        </span>
      </div>

      {/* Main Input Row */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleExecute(); }}
        className="flex items-center gap-3"
      >
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Plan a seminar for 180 students tomorrow from 2 PM to 5 PM..."
            className="cs-input pl-10"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="btn-glow shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white text-[11px] font-bold flex items-center gap-2 shadow-lg shadow-blue-600/25 transition"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>ORCHESTRATING...</span>
            </>
          ) : (
            <>
              <span>ORCHESTRATE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Quick Chips */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="font-mono text-[9px] text-slate-600 shrink-0 uppercase tracking-wider">Quick:</span>
        {QUICK_COMMANDS.map((cmd, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setPrompt(cmd); handleExecute(cmd); }}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-[rgba(26,34,52,0.8)] hover:bg-[rgba(38,51,77,0.9)] border border-[rgba(38,51,77,0.9)] hover:border-blue-500/30 text-slate-400 hover:text-slate-200 transition text-[10px] font-mono whitespace-nowrap"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Pipeline Visualizer */}
      {pipelineStages.length > 0 && (
        <div className="mt-5 pt-4 border-t border-[rgba(38,51,77,0.5)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Orchestration Execution Pipeline
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE TELEMETRY
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {pipelineStages.slice(0, 4).map((stage, idx) => (
              <div
                key={idx}
                className="pipeline-stage completed"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-medium text-slate-200 truncate">{stage.name}</span>
                </div>
                <div className="text-[9px] text-slate-500 font-mono truncate">
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
