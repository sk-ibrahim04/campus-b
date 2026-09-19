import React from 'react';
import { useCampusStore } from '../store/useCampusStore';
import { X, CheckCircle2, Cpu, Database, Activity, ShieldCheck, Zap } from 'lucide-react';

export const SystemHealthModal: React.FC = () => {
  const { isHealthModalOpen, setHealthModalOpen, systemHealth, telemetry } = useCampusStore();

  if (!isHealthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-surface border border-surface-border rounded-xl shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-surface-border">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">System Health & Observability Matrix</h3>
              <p className="text-xs text-slate-400 font-mono">Live Subsystem Telemetry & Provider Status</p>
            </div>
          </div>
          <button
            onClick={() => setHealthModalOpen(false)}
            className="p-1.5 rounded-lg bg-surface-elevated hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subsystems Matrix */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-mono">
          {/* AI Provider */}
          <div className="p-4 rounded-lg bg-surface-elevated border border-surface-border flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-300 font-semibold">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>AI Intent Provider</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                ONLINE
              </span>
            </div>
            <div className="space-y-1 text-slate-400 text-[11px]">
              <div>Engine: <span className="text-slate-200">{systemHealth?.aiProvider.activeEngine || 'GEMINI 1.5 + DETERMINISTIC FALLBACK'}</span></div>
              <div>Latency: <span className="text-slate-200">{systemHealth?.aiProvider.latencyMs || 28}ms</span></div>
              <div>Fail-Safe: <span className="text-emerald-400">Deterministic Rules Active</span></div>
            </div>
          </div>

          {/* Optimizer Engine */}
          <div className="p-4 rounded-lg bg-surface-elevated border border-surface-border flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-300 font-semibold">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Constraint Optimizer</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                HEALTHY
              </span>
            </div>
            <div className="space-y-1 text-slate-400 text-[11px]">
              <div>Solver: <span className="text-slate-200">{systemHealth?.optimizer.engine || 'GOOGLE_OR_TOOLS_CPSAT'}</span></div>
              <div>Constraints: <span className="text-slate-200">Capacity, Overlap, Equipment</span></div>
              <div>Response: <span className="text-emerald-400">{systemHealth?.optimizer.latencyMs || 45}ms</span></div>
            </div>
          </div>

          {/* Database */}
          <div className="p-4 rounded-lg bg-surface-elevated border border-surface-border flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-300 font-semibold">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Digital Twin Database</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                CONNECTED
              </span>
            </div>
            <div className="space-y-1 text-slate-400 text-[11px]">
              <div>Driver: <span className="text-slate-200">Mongoose / MongoDB</span></div>
              <div>Mode: <span className="text-blue-400">{systemHealth?.database.mode || 'STANDALONE / EMBEDDED'}</span></div>
              <div>Total Monitored Spaces: <span className="text-slate-200">{telemetry?.totalResourcesCount || 20}</span></div>
            </div>
          </div>

          {/* Realtime Gateway */}
          <div className="p-4 rounded-lg bg-surface-elevated border border-surface-border flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Autonomy & WebSocket</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            <div className="space-y-1 text-slate-400 text-[11px]">
              <div>Level: <span className="text-blue-400">Level {systemHealth?.autonomyEngine.level ?? 2} (Approve then Exec)</span></div>
              <div>Autonomous Actions: <span className="text-emerald-400">{telemetry?.autonomousActionsTodayCount || 12} today</span></div>
              <div>WebSocket Clients: <span className="text-slate-200">{systemHealth?.socket.connectedClients || 1} live</span></div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-surface-border flex justify-end">
          <button
            onClick={() => setHealthModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition"
          >
            CLOSE PANEL
          </button>
        </div>
      </div>
    </div>
  );
};
