import React from 'react';
import { useCampusStore } from '../store/useCampusStore';
import { Play, RotateCcw, ShieldCheck, Cpu, Zap, Activity } from 'lucide-react';
import { api } from '../services/api';

export const Header: React.FC = () => {
  const { systemHealth, setHealthModalOpen, setDemoModalOpen, showToast, fetchDashboard, fetchResources } =
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
    <header className="h-16 sticky top-0 z-30 px-6 flex items-center justify-between glass-panel border-b border-white/10">
      {/* Left: Brand Logo & Mission Pipeline */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="relative group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-glow-cyan group-hover:scale-105 transition duration-300">
            <Cpu className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 status-pulse-dot" />
        </div>

        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold tracking-tight text-white text-base font-display">
              CAMPUS<span className="gradient-text">SYNAPSE</span>
            </span>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full badge-glow-violet tracking-widest">
              SIH26193
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {['OBSERVE', 'SIMULATE', 'DECIDE', 'AUTOMATE'].map((step, i) => (
              <React.Fragment key={step}>
                <span className={`text-[10px] font-mono font-bold tracking-wider ${
                  i === 0 ? 'text-emerald-400' :
                  i === 1 ? 'text-amber-400' :
                  i === 2 ? 'text-cyan-400' : 'text-purple-400'
                }`}>{step}</span>
                {i < 3 && <span className="text-[10px] text-slate-500">›</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Center: Live Status Badges */}
      <div className="hidden lg:flex items-center gap-3">
        {/* System Health */}
        <button
          onClick={() => setHealthModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl badge-glow-emerald hover:scale-105 transition text-xs font-mono font-bold"
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-slate-300">SYSTEM HEALTH:</span>
          <span className="text-emerald-400">100%</span>
        </button>

        {/* Autonomy Level */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl badge-glow-cyan text-xs font-mono font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300">AUTONOMY:</span>
          <span className="text-cyan-400">L2 (Approve & Exec)</span>
        </div>

        {/* Optimizer */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl badge-glow-violet text-xs font-mono font-bold">
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-slate-300">OPTIMIZER:</span>
          <span className="text-purple-300">
            {systemHealth?.optimizer?.engine || 'OR-TOOLS CP-SAT'}
          </span>
        </div>
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setDemoModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold shadow-glow-cyan hover:scale-105 transition duration-200"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          RUN DEMO SCENARIO
        </button>

        <button
          onClick={handleResetDemo}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl glass-panel hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition active:scale-95 border border-white/10"
          title="Restore Pristine Synthetic Campus State"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">RESET</span>
        </button>
      </div>
    </header>
  );
};
