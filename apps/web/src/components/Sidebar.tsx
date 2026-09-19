import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Layers, Sparkles, FlaskConical, Server,
  CalendarDays, ClipboardList, Wrench, ShieldCheck,
  BarChart3, FileText, Settings2,
} from 'lucide-react';
import { useCampusStore } from '../store/useCampusStore';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/digital-twin', label: 'Digital Twin', icon: Layers, badge: 'LIVE' },
  { to: '/orchestrator', label: 'AI Orchestrator', icon: Sparkles, badge: 'AI' },
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

const BADGE_STYLES: Record<string, string> = {
  LIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  AI: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
};

export const Sidebar: React.FC = () => {
  const { pendingApprovalsCount } = useCampusStore();

  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-[rgba(38,51,77,0.5)] bg-[rgba(6,10,18,0.7)] backdrop-blur-xl">
      {/* Nav Section Label */}
      <div className="px-4 pt-4 pb-2">
        <span className="text-[9px] font-mono font-bold tracking-[0.15em] uppercase text-slate-600">
          Mission Control
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 pb-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-item group ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-[15px] h-[15px] shrink-0 opacity-80" />
            <span className="flex-1 leading-none">{label}</span>

            {/* Pending approvals badge */}
            {to === '/approvals' && pendingApprovalsCount > 0 && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 min-w-[18px] text-center">
                {pendingApprovalsCount}
              </span>
            )}

            {/* Feature badge */}
            {badge && (
              <span
                className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${BADGE_STYLES[badge]}`}
              >
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* System Integrity Footer */}
      <div className="px-3 pb-4 pt-3 border-t border-[rgba(38,51,77,0.4)]">
        <div className="px-3 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 radar-pulse shrink-0" />
            <span className="text-[10px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">
              System Online
            </span>
          </div>
          <p className="text-[9px] text-slate-500 font-mono leading-tight">
            All microservices operational
          </p>
        </div>
      </div>
    </aside>
  );
};
