import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Box,
  Compass,
  Cpu,
  Calendar,
  Layers,
  Wrench,
  CheckSquare,
  BarChart3,
  FileText,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useCampusStore } from '../store/useCampusStore';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/digital-twin', label: 'Digital Twin', icon: Box, highlight: true },
  { path: '/orchestrator', label: 'AI Orchestrator', icon: Sparkles, highlight: true },
  { path: '/simulator', label: 'What-If Simulator', icon: Compass, highlight: true },
  { path: '/resources', label: 'Resources', icon: Layers },
  { path: '/schedules', label: 'Schedules', icon: Calendar },
  { path: '/maintenance', label: 'Maintenance', icon: Wrench },
  { path: '/approvals', label: 'Approvals', icon: CheckSquare, badgeKey: 'pendingApprovals' },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/audit-log', label: 'Audit Log', icon: FileText },
  { path: '/settings', label: 'Autonomy Settings', icon: Sliders },
];

export const Sidebar: React.FC = () => {
  const { pendingApprovalsCount } = useCampusStore();

  return (
    <aside className="w-64 border-r border-surface-border bg-surface flex flex-col justify-between py-4 select-none shrink-0">
      <div>
        <div className="px-5 mb-4 text-[11px] font-mono tracking-wider text-slate-500 uppercase">
          Mission Control Navigation
        </div>
        <nav className="space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition group ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-surface-elevated'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 shrink-0 transition group-hover:text-white" />
                  <span>{item.label}</span>
                </div>
                {item.badgeKey === 'pendingApprovals' && pendingApprovalsCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {pendingApprovalsCount}
                  </span>
                )}
                {item.highlight && !item.badgeKey && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Operator Session Info */}
      <div className="px-4 pt-4 border-t border-surface-border">
        <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-blue-400 border border-blue-500/30">
            DR
          </div>
          <div className="truncate">
            <div className="text-xs font-medium text-slate-200 truncate">Dr. Rajesh Sharma</div>
            <div className="text-[10px] font-mono text-slate-400 truncate">SUPER_ADMIN</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
