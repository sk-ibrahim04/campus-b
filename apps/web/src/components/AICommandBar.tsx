import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { useCampusStore } from '../store/useCampusStore';

const QUICK_COMMANDS = [
  'Plan a seminar for 180 students tomorrow from 2 PM to 5 PM.',
  'Find unused classrooms right now.',
  'What happens if Auditorium 1 becomes unavailable tomorrow?',
  'Move the database lab because Lab C1 is under maintenance.',
  'Find a room for a faculty meeting for 12 people.',
  'Show conflicts for tomorrow afternoon.',
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
    setPipelineStages([
      { name: 'Sensing Campus State & Intent', status: 'IN_PROGRESS' },
      { name: 'Inspecting Digital Twin Resources', status: 'PENDING' },
      { name: 'Detecting Schedule & Capacity Conflicts', status: 'PENDING' },
      { name: 'Executing OR-Tools CP-SAT Optimization', status: 'PENDING' },
      { name: 'Synthesizing Explainable Decision & Policy Validation', status: 'PENDING' },
    ]);

    try {
      const response = await api.planAndOptimize({ prompt: textToRun });
      setPipelineStages(response.pipelineStages || []);
      if (onPlanGenerated) {
        onPlanGenerated(response);
      }
      showToast('AI Orchestration completed. Scored candidate plans ready.', 'success');
      await fetchDashboard();
      await fetchResources();
    } catch (err) {
      showToast('Orchestration failed: ' + (err as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-surface border border-surface-border rounded-xl p-5 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center space-x-2 text-xs font-mono text-blue-400 mb-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span className="font-semibold tracking-wide uppercase">Ask CampusSynapse — Autonomous Orchestration Interface</span>
      </div>

      {/* Main Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleExecute();
        }}
        className="flex items-center space-x-3"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Plan a seminar for 180 students tomorrow from 2 PM to 5 PM..."
            className="w-full bg-surface-elevated border border-surface-border rounded-lg pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-sans shadow-inner"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-semibold flex items-center space-x-2 transition shadow-lg shadow-blue-600/25 active:scale-95 shrink-0"
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

      {/* Quick Prompts */}
      <div className="mt-3 flex items-center space-x-2 overflow-x-auto pb-1 text-xs text-slate-400 scrollbar-none">
        <span className="font-mono text-[11px] text-slate-500 shrink-0">QUICK CHIPS:</span>
        {QUICK_COMMANDS.map((cmd, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setPrompt(cmd);
              handleExecute(cmd);
            }}
            className="px-2.5 py-1 rounded bg-surface-elevated hover:bg-slate-800 border border-surface-border text-slate-300 hover:text-white transition whitespace-nowrap text-[11px] font-sans"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Live Pipeline Visualizer */}
      {pipelineStages.length > 0 && (
        <div className="mt-5 pt-4 border-t border-surface-border/60">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Orchestration Execution Pipeline</span>
            <span className="text-emerald-400 font-bold">LIVE TELEMETRY</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {pipelineStages.slice(0, 4).map((stage, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-surface-elevated/70 border border-surface-border text-xs flex flex-col justify-between"
              >
                <div className="flex items-center space-x-2 font-medium text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{stage.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate font-mono">
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
