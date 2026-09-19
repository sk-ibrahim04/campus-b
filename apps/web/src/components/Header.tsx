import React from 'react';
import { useCampusStore } from '../store/useCampusStore';
import { Play, RotateCcw, Activity, ShieldCheck, Cpu, Zap } from 'lucide-react';
import { api } from '../services/api';

export const Header: React.FC = () => {
  const { systemHealth, telemetry, setHealthModalOpen, setDemoModalOpen, showToast, fetchDashboard, fetchResources } =
    useCampusStore();

  const handleResetDemo = async () => {
    try {
      showToast('Resetting CampusSynapse Digital Twin...', 'info');
      await api.resetDemo();
      await fetchDashboard();
      await fetchResources();
      showToast('Demo state successfully reset to baseline.', 'success');
    } catch (err) {
      showToast('Failed to reset demo: ' + (err as Error).message, 'error');
    }
  };

  return (
    <header className="h-16 border-b border-surface-border bg-surface/90 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Left: Brand & Tagline */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-wider text-white text-base">CAMPUSSYNAPSE</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                SIH26193
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center space-x-1 font-mono">
              <span className="text-emerald-400">OBSERVE</span>
              <span>→</span>
              <span className="text-amber-400">SIMULATE</span>
              <span>→</span>
              <span className="text-blue-400">DECIDE</span>
              <span>→</span>
              <span className="text-purple-400">AUTOMATE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Realtime Telemetry & Health Quick Status */}
      <div className="hidden lg:flex items-center space-x-4">
        <button
          onClick={() => setHealthModalOpen(true)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-surface-elevated border border-surface-border hover:border-slate-600 transition text-xs font-mono"
          title="Inspect System Observability Matrix"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 radar-pulse" />
          <span className="text-slate-300">SYSTEM HEALTH</span>
          <span className="text-emerald-400 font-bold">100%</span>
        </button>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-surface-elevated border border-surface-border text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">AUTONOMY:</span>
          <span className="text-blue-400 font-semibold">L2 (Approve & Exec)</span>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-surface-elevated border border-surface-border text-xs font-mono">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">OPTIMIZER:</span>
          <span className="text-amber-400 font-semibold">{systemHealth?.optimizer.engine || 'OR-TOOLS CP-SAT'}</span>
        </div>
      </div>

      {/* Right: Judge-Ready Demo Actions */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setDemoModalOpen(true)}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-medium shadow-md shadow-blue-500/25 transition active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>RUN DEMO</span>
        </button>

        <button
          onClick={handleResetDemo}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-surface-elevated hover:bg-slate-800 border border-surface-border text-slate-300 hover:text-white text-xs font-medium transition active:scale-95"
          title="Restore Pristine Synthetic Campus State"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">RESET</span>
        </button>
      </div>
    </header>
  );
};
