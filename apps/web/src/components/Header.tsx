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
    <header className="header-glow h-14 sticky top-0 z-30 px-5 flex items-center justify-between">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="relative">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#060a12] radar-pulse" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-[0.08em] text-white text-[13px] leading-none">
              CAMPUSSYNAPSE
            </span>
            <span className="text-[8px] font-mono font-bold px-1.5 py-[2px] rounded bg-blue-500/12 text-blue-400 border border-blue-500/20 tracking-widest">
              SIH26193
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            {['OBSERVE', 'SIMULATE', 'DECIDE', 'AUTOMATE'].map((step, i) => (
              <React.Fragment key={step}>
                <span className={`text-[9px] font-mono font-semibold ${
                  i === 0 ? 'text-emerald-400' :
                  i === 1 ? 'text-amber-400' :
                  i === 2 ? 'text-blue-400' : 'text-purple-400'
                }`}>{step}</span>
                {i < 3 && <span className="text-[9px] text-slate-600">›</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Center: Live Status Chips */}
      <div className="hidden lg:flex items-center gap-2">
        {/* System Health */}
        <button
          onClick={() => setHealthModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/6 border border-emerald-500/18 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition text-[11px] font-mono group"
        >
          <Activity className="w-3 h-3 text-emerald-400 group-hover:animate-pulse" />
          <span className="text-slate-400">SYSTEM HEALTH</span>
          <span className="text-emerald-400 font-bold">100%</span>
        </button>

        {/* Autonomy Level */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/6 border border-blue-500/18 text-[11px] font-mono">
          <ShieldCheck className="w-3 h-3 text-blue-400" />
          <span className="text-slate-400">AUTONOMY:</span>
          <span className="text-blue-400 font-bold">L2 (Approve &amp; Exec)</span>
        </div>

        {/* Optimizer */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/6 border border-amber-500/18 text-[11px] font-mono">
          <Zap className="w-3 h-3 text-amber-400" />
          <span className="text-slate-400">OPTIMIZER:</span>
          <span className="text-amber-400 font-bold">
            {systemHealth?.optimizer?.engine || 'OR-TOOLS CP-SAT'}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDemoModalOpen(true)}
          className="btn-glow flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-semibold shadow-lg shadow-blue-500/25 transition"
        >
          <Play className="w-3 h-3 fill-current" />
          RUN DEMO
        </button>

        <button
          onClick={handleResetDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(26,34,52,0.8)] hover:bg-[rgba(38,51,77,0.8)] border border-[rgba(38,51,77,0.9)] text-slate-300 hover:text-white text-[11px] font-medium transition active:scale-95"
          title="Restore Pristine Synthetic Campus State"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">RESET</span>
        </button>
      </div>
    </header>
  );
};
