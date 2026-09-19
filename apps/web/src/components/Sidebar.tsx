import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Layers, Sparkles, FlaskConical, Server,
  CalendarDays, ClipboardList, Wrench, ShieldCheck,
  BarChart3, FileText, Settings2, Activity
} from 'lucide-react';
import { useCampusStore } from '../store/useCampusStore';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/digital-twin', label: 'Digital Twin', icon: Layers, badge: 'LIVE', badgeColor: 'badge-glow-emerald' },
  { to: '/orchestrator', label: 'AI Orchestrator', icon: Sparkles, badge: 'AI', badgeColor: 'badge-glow-cyan' },
  { to: '/simulator', label: 'What-If Simulator', icon: FlaskConical },
  { to: '/resources', label: 'Resources', icon: Server },
  { to: '/schedules', label: 'Schedules', icon: CalendarDays },
  { to: '/requests', label: 'Requests', icon: ClipboardList },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/approvals', label: 'Approvals', icon: ShieldCheck },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/audit-log', label: 'Audit Log', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings2 },
];

export const Sidebar: React.FC = () => {
  const { pendingApprovalsCount } = useCampusStore();

  return (
    <aside className="w-60 shrink-0 flex flex-col glass-panel border-r border-white/10 z-20">
      {/* Nav Section Header Label */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400">
          Navigation Control
        </span>
        <span className="w-2 h-2 rounded-full bg-cyan-400 status-pulse-dot" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 pb-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, badge, badgeColor }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 via-indigo-500/10 to-transparent text-cyan-300 border border-cyan-500/30 shadow-glow-cyan font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-400 rounded-r-full shadow-glow-cyan" />
                )}
                <Icon className={`w-4 h-4 shrink-0 transition duration-200 ${isActive ? 'text-cyan-400 scale-110' : 'text-slate-400 group-hover:text-cyan-300'}`} />
                <span className="flex-1 tracking-tight">{label}</span>

                {/* Pending approvals count badge */}
                {to === '/approvals' && pendingApprovalsCount > 0 && (
                  <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full badge-glow-amber">
                    {pendingApprovalsCount}
                  </span>
                )}

                {/* Feature badge */}
                {badge && (
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* System Integrity Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/20 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
              <span>SYSTEM ONLINE</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              All microservices operational
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
